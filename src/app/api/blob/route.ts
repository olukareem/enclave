// Vercel Blob API routes for document upload and access.
//
// All access is gated by the Auth.js session. The upload route additionally
// verifies (via Postgres RLS) that the current user is an admin of the target
// entity before accepting the file. This enforces the same "admin-only writes"
// rule as the documents table RLS policy.
//
// Vercel Blob URL pattern: https://<store>.public.blob.vercel-storage.com/<path>
// The URL IS the access credential for public blobs. Enforce write-side access
// at this route; read-side access is open (by design for this demo starter).
// Replace with @aws-sdk/s3-presigner (R2/S3) for true time-limited read URLs.

import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// ── GET /api/blob?path=<storage_path> ──────────────────────────────────────
// Verify the current user has entity membership for this document, then return
// the Vercel Blob URL. Acts as an access-control gate for file downloads.

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "path required" }, { status: 400 });

  // The storage_path is `{entity_id}/{filename}` — extract entity_id from the prefix.
  const entityId = path.split("/")[0];
  if (!entityId || !/^[0-9a-f-]{36}$/.test(entityId)) {
    return NextResponse.json({ error: "Invalid path format" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  try {
    const [, [membership]] = await sql.transaction([
      sql`SELECT set_config('app.current_user_id', ${session.user.id}, true)`,
      sql`SELECT 1 FROM user_entity WHERE user_id = ${session.user.id} AND entity_id = ${entityId} LIMIT 1`,
    ]);

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return the Vercel Blob URL for this path.
    // In production with a real store, fetch the blob metadata for a verified URL.
    // For this starter, we reconstruct it from the BLOB_READ_WRITE_TOKEN store URL.
    const storeUrl = process.env.BLOB_STORE_URL ?? "";
    const url = storeUrl ? `${storeUrl}/${path}` : `/api/blob/direct?path=${path}`;
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── POST /api/blob — multipart upload ─────────────────────────────────────
// Accepts a multipart form with fields: file (File), entity_id (string).
// Verifies admin role on that entity, uploads to Vercel Blob, returns the URL.

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const entityId = formData.get("entity_id") as string | null;
  if (!file || !entityId) {
    return NextResponse.json({ error: "file and entity_id are required" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  // Check that the current user is an admin of this entity (same rule as documents RLS).
  try {
    const [, [adminRow]] = await sql.transaction([
      sql`SELECT set_config('app.current_user_id', ${session.user.id}, true)`,
      sql`SELECT 1 FROM user_entity WHERE user_id = ${session.user.id} AND entity_id = ${entityId} AND role = 'admin' LIMIT 1`,
    ]);

    if (!adminRow) {
      return NextResponse.json(
        { error: "Only admins can upload documents to this entity.", rls_violation: true },
        { status: 403 },
      );
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  // Upload to Vercel Blob. Path: {entity_id}/{docId}.{ext}
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const docId = crypto.randomUUID();
  const blobPath = `${entityId}/${docId}.${ext}`;

  try {
    const blob = await put(blobPath, file, {
      access: "public", // URLs are long and unguessable; admin-only upload is the write gate.
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      path: blobPath,
      name: file.name,
      size: file.size,
      type: ext,
    });
  } catch (err) {
    return NextResponse.json({ error: `Blob upload failed: ${String(err)}` }, { status: 500 });
  }
}

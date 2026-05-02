"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type ColumnDef } from "@/components/tables/data-table";
import { SignedUrlDialog } from "@/components/common/signed-url-dialog";
import { useAuth } from "@/lib/auth";
import { useCanWrite } from "@/components/common/role-gate";
import { useEntityRows } from "@/lib/use-entity-query";
import { toast } from "@/lib/use-toast";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Document } from "@/lib/types";

const FILE_TYPE_OPTIONS = ["all", "pdf", "xlsx", "docx", "png"];

export default function DocumentsPage() {
  const { currentEntity, currentUser } = useAuth();
  const canWrite = useCanWrite();
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: allDocs, refetch } = useEntityRows("documents", currentEntity?.id ?? null);

  // Cache uploader names: fetch user profiles for all uploaded_by UUIDs in the list.
  const [uploaderNames, setUploaderNames] = useState<Record<string, string>>({});
  useEffect(() => {
    const ids = Array.from(new Set(allDocs.map((d) => d.uploaded_by)));
    const missing = ids.filter((id) => !uploaderNames[id]);
    if (missing.length === 0) return;

    let active = true;
    fetch(`/api/data?table=users&ids=${missing.join(",")}`)
      .then((r) => r.json() as Promise<{ data?: { id: string; full_name: string }[] }>)
      .then(({ data }) => {
        if (!active || !data) return;
        setUploaderNames((prev) => {
          const next = { ...prev };
          for (const u of data) next[u.id] = u.full_name;
          return next;
        });
      })
      .catch(() => {/* silently ignore — names just stay as "—" */});
    return () => { active = false; };
  }, [allDocs]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(
    () => (filter === "all" ? allDocs : allDocs.filter((d) => d.file_type === filter)),
    [allDocs, filter],
  );

  async function handleFileSelected(file: File) {
    if (!currentEntity || !currentUser) return;
    setUploading(true);

    try {
      // Upload the file to Vercel Blob via the /api/blob route.
      // That route verifies admin membership before accepting the upload.
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entity_id", currentEntity.id);

      const uploadRes = await fetch("/api/blob", { method: "POST", body: formData });
      const uploadJson = (await uploadRes.json()) as {
        url?: string;
        path?: string;
        name?: string;
        size?: number;
        type?: string;
        error?: string;
        rls_violation?: boolean;
      };

      if (!uploadRes.ok || !uploadJson.url) {
        toast({
          title: "Upload failed",
          description: uploadJson.error ?? "Unknown error from blob API",
          variant: "destructive",
        });
        return;
      }

      // Insert the document metadata row. The /api/data route enforces the
      // documents_admin_writes RLS policy.
      const insertRes = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: "documents",
          row: {
            entity_id: currentEntity.id,
            title: file.name.replace(/\.[^.]+$/, ""),
            file_type: uploadJson.type ?? "bin",
            file_size: file.size,
            storage_path: uploadJson.path,
            uploaded_by: currentUser.id,
          },
        }),
      });
      const insertJson = (await insertRes.json()) as { error?: string };

      if (!insertRes.ok) {
        toast({
          title: "Metadata insert failed",
          description: insertJson.error ?? "Document uploaded but record not saved.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Uploaded", description: `${file.name} added.` });
      refetch();
    } finally {
      setUploading(false);
    }
  }

  const columns: ColumnDef<Document>[] = [
    {
      key: "title",
      header: "Title",
      sortAccessor: (r) => r.title.toLowerCase(),
      cell: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "file_type",
      header: "Type",
      sortAccessor: (r) => r.file_type,
      cell: (r) => (
        <Badge variant="outline" className="uppercase">
          {r.file_type}
        </Badge>
      ),
    },
    {
      key: "file_size",
      header: "Size",
      align: "right",
      sortAccessor: (r) => r.file_size,
      cell: (r) => formatBytes(r.file_size),
    },
    {
      key: "uploaded_by",
      header: "Uploaded by",
      cell: (r) => uploaderNames[r.uploaded_by] ?? "—",
    },
    {
      key: "created_at",
      header: "Date",
      align: "right",
      sortAccessor: (r) => r.created_at,
      cell: (r) => formatDate(r.created_at),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentEntity ? `Files associated with ${currentEntity.name}.` : "No entity selected."}{" "}
            Click a row to view the document URL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Filter</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t === "all" ? "All types" : t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canWrite ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFileSelected(f);
                  e.target.value = "";
                }}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button disabled>
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Viewer access: read only</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        onRowClick={(r) => setActive(r)}
        emptyTitle={filter === "all" ? "No documents yet" : `No ${filter.toUpperCase()} documents`}
        emptyDescription={
          filter === "all"
            ? "Upload your first file to start tracking documents for this entity."
            : "Try a different file-type filter."
        }
        emptyIcon={FileText}
      />

      <SignedUrlDialog doc={active} onClose={() => setActive(null)} />
    </div>
  );
}

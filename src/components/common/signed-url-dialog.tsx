"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Link2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/use-toast";
import type { Document } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

interface SignedUrlDialogProps {
  doc: Document | null;
  onClose: () => void;
}

// How long (in seconds) the UI countdown runs before disabling the copy/download buttons.
// This is a UI-only demo timer — the Vercel Blob URL itself doesn't expire.
// Swap @vercel/blob for @aws-sdk/s3-presigner (R2/S3) to add real presigned URL expiry.
const DISPLAY_TTL = 60;

export function SignedUrlDialog({ doc, onClose }: SignedUrlDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [issuedAt, setIssuedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = doc !== null;

  // Fetch the Blob URL for this document when the dialog opens.
  // The /api/blob route verifies entity membership before returning the URL.
  useEffect(() => {
    if (!doc) {
      setBlobUrl(null);
      setIssuedAt(null);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    fetch(`/api/blob?path=${encodeURIComponent(doc.storage_path)}`)
      .then((res) => res.json() as Promise<{ url?: string; error?: string }>)
      .then(({ url, error: apiError }) => {
        if (!active) return;
        if (apiError || !url) {
          setError(
            apiError ??
              "Could not retrieve file URL. The file may not exist in Vercel Blob yet — " +
              "uploads create real objects; seeded documents are metadata-only.",
          );
        } else {
          setBlobUrl(url);
          setIssuedAt(Date.now());
          setNow(Date.now());
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doc]);

  // UI countdown — ticks once per second for the demo visual.
  useEffect(() => {
    if (!issuedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [issuedAt]);

  const remaining = useMemo(() => {
    if (!issuedAt) return 0;
    return Math.max(0, DISPLAY_TTL - Math.floor((now - issuedAt) / 1000));
  }, [issuedAt, now]);

  function copy() {
    if (!blobUrl) return;
    navigator.clipboard?.writeText(blobUrl).catch(() => {});
    toast({ title: "Copied", description: "Document URL copied to clipboard." });
  }

  function download() {
    if (!blobUrl) return;
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent>
        {doc ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-start gap-2">
                <Link2 className="mt-0.5 h-4 w-4 text-primary" />
                <span className="flex-1">{doc.title}</span>
              </DialogTitle>
              <DialogDescription>
                Document URL retrieved via /api/blob — entity membership is verified
                server-side before the URL is returned.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="uppercase">
                  {doc.file_type}
                </Badge>
                <span>{formatBytes(doc.file_size)}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">{doc.storage_path}</span>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying entity membership and retrieving URL…
                </div>
              ) : error ? (
                <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                  {error}
                </div>
              ) : blobUrl ? (
                <>
                  <div className="rounded-md border bg-muted/40 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Vercel Blob URL
                    </div>
                    <div className="mt-1 break-all font-mono text-[11px] text-foreground/90">
                      {blobUrl}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-md border border-warning/30 bg-warning/5 p-2.5 text-xs">
                    <span className="text-warning">
                      Demo timer: <span className="font-mono font-semibold">{remaining}s</span>
                    </span>
                    <span className="text-muted-foreground">
                      Access gated by entity membership · Vercel Blob
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Swap{" "}
                    <code className="rounded bg-muted px-1 font-mono">@vercel/blob</code> for{" "}
                    <code className="rounded bg-muted px-1 font-mono">@aws-sdk/s3-presigner</code>{" "}
                    (R2 or S3) to add real time-limited presigned URLs.
                  </p>
                </>
              ) : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={copy} disabled={!blobUrl || remaining === 0}>
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </Button>
              <Button onClick={download} disabled={!blobUrl || remaining === 0}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

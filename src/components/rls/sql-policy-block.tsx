interface SqlPolicyBlockProps {
  title?: string;
  sql: string;
}

export function SqlPolicyBlock({ title = "Postgres policy (verbatim)", sql }: SqlPolicyBlockProps) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <pre className="overflow-x-auto rounded-md border bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
        {sql}
      </pre>
    </div>
  );
}

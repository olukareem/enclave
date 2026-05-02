"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TableName } from "@/lib/types";
import {
  FK_LINKS,
  SVG_HEIGHT,
  SVG_WIDTH,
  TABLES,
  columnAnchorY,
  tableHeight,
  type TableMeta,
} from "./schema-data";

interface SchemaCanvasProps {
  selected: TableName;
  onSelect: (t: TableName) => void;
}

export function SchemaCanvas({ selected, onSelect }: SchemaCanvasProps) {
  const [hoverLink, setHoverLink] = useState<{ from: string; to: string } | null>(null);

  return (
    <div className="overflow-auto rounded-lg border bg-card">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="block w-full"
        style={{ minWidth: 900 }}
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
          </marker>
        </defs>

        {/* FK arrows: render below tables so the boxes overlap them cleanly */}
        {FK_LINKS.map((link, i) => {
          const fromTable = TABLES.find((t) => t.name === link.fromTable)!;
          const toTable = TABLES.find((t) => t.name === link.toTable)!;
          const isHovered =
            hoverLink?.from === `${link.fromTable}.${link.fromColumn}` &&
            hoverLink?.to === `${link.toTable}.${link.toColumn}`;
          const isSelectedTable =
            selected === link.fromTable || selected === link.toTable;
          const active = isHovered || isSelectedTable;

          // Choose anchor sides intelligently: if `to` is above `from`,
          // exit `from` from the top and enter `to` at the bottom.
          const fromY = columnAnchorY(fromTable, link.fromColumn);
          const toY = columnAnchorY(toTable, link.toColumn);
          const fromCenterX = fromTable.x + fromTable.width / 2;
          const toCenterX = toTable.x + toTable.width / 2;

          // Default: left/right anchors based on x ordering.
          let x1: number, x2: number, y1 = fromY, y2 = toY;
          if (fromCenterX < toCenterX) {
            x1 = fromTable.x + fromTable.width;
            x2 = toTable.x;
          } else {
            x1 = fromTable.x;
            x2 = toTable.x + toTable.width;
          }

          // For vertical relationships (top row → bottom row), route from top of
          // the lower table up to the bottom of the upper table to look like an
          // ER diagram instead of a long diagonal.
          const verticalGap = Math.abs(fromTable.y - toTable.y);
          if (verticalGap > 200) {
            const fromIsLower = fromTable.y > toTable.y;
            x1 = fromTable.x + fromTable.width / 2;
            x2 = toTable.x + toTable.width / 2;
            y1 = fromIsLower ? fromTable.y : fromTable.y + tableHeight(fromTable);
            y2 = fromIsLower ? toTable.y + tableHeight(toTable) : toTable.y;
          }

          // Cubic bezier with control points biased toward the source/target sides.
          const dx = x2 - x1;
          const dy = y2 - y1;
          const horizontal = Math.abs(dx) > Math.abs(dy);
          const c1x = horizontal ? x1 + dx * 0.5 : x1;
          const c1y = horizontal ? y1 : y1 + dy * 0.5;
          const c2x = horizontal ? x2 - dx * 0.5 : x2;
          const c2y = horizontal ? y2 : y2 - dy * 0.5;

          return (
            <g key={i}>
              <path
                d={`M ${x1},${y1} C ${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`}
                fill="none"
                stroke={active ? "hsl(var(--primary))" : "hsl(var(--border))"}
                strokeWidth={active ? 1.6 : 1.2}
                markerEnd={active ? "url(#arrow-active)" : "url(#arrow)"}
                onMouseEnter={() =>
                  setHoverLink({
                    from: `${link.fromTable}.${link.fromColumn}`,
                    to: `${link.toTable}.${link.toColumn}`,
                  })
                }
                onMouseLeave={() => setHoverLink(null)}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}

        {/* Table cards */}
        {TABLES.map((t) => (
          <TableNode
            key={t.name}
            table={t}
            selected={selected === t.name}
            onSelect={() => onSelect(t.name)}
            highlightedColumn={
              hoverLink?.from.startsWith(t.name + ".")
                ? hoverLink.from.split(".")[1]
                : hoverLink?.to.startsWith(t.name + ".")
                ? hoverLink.to.split(".")[1]
                : null
            }
          />
        ))}
      </svg>
    </div>
  );
}

interface TableNodeProps {
  table: TableMeta;
  selected: boolean;
  onSelect: () => void;
  highlightedColumn: string | null;
}

function TableNode({ table, selected, onSelect, highlightedColumn }: TableNodeProps) {
  const height = tableHeight(table);
  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={onSelect}
      className="group"
    >
      {/* Tag above the access-control core */}
      {table.highlight ? (
        <g>
          <rect
            x={table.x + table.width / 2 - 90}
            y={table.y - 24}
            width={180}
            height={18}
            rx={4}
            fill="hsl(var(--primary))"
            opacity={0.12}
          />
          <text
            x={table.x + table.width / 2}
            y={table.y - 11}
            textAnchor="middle"
            className="fill-primary text-[10px] font-semibold uppercase tracking-wider"
          >
            Access control core
          </text>
        </g>
      ) : null}

      {/* Card body */}
      <rect
        x={table.x}
        y={table.y}
        width={table.width}
        height={height}
        rx={6}
        fill="hsl(var(--card))"
        stroke={
          selected
            ? "hsl(var(--primary))"
            : table.highlight
            ? "hsl(var(--primary))"
            : "hsl(var(--border))"
        }
        strokeWidth={selected ? 2 : table.highlight ? 1.5 : 1}
      />

      {/* Header */}
      <rect
        x={table.x}
        y={table.y}
        width={table.width}
        height={50}
        rx={6}
        fill={table.highlight ? "hsl(var(--primary))" : "hsl(var(--muted))"}
        opacity={table.highlight ? 0.08 : 1}
      />
      <text
        x={table.x + 12}
        y={table.y + 22}
        className={cn(
          "fill-foreground text-[13px] font-semibold",
          table.highlight && "fill-primary",
        )}
      >
        {table.label}
      </text>
      <text
        x={table.x + 12}
        y={table.y + 39}
        className="fill-muted-foreground text-[10px]"
      >
        {table.description}
      </text>

      {/* Columns */}
      {table.columns.map((col, i) => {
        const y = table.y + 50 + i * 24;
        const isHighlighted = highlightedColumn === col.name;
        return (
          <g key={col.name}>
            <rect
              x={table.x + 1}
              y={y}
              width={table.width - 2}
              height={24}
              fill={isHighlighted ? "hsl(var(--primary))" : "transparent"}
              opacity={isHighlighted ? 0.08 : 0}
            />
            <text x={table.x + 12} y={y + 16} className="fill-foreground text-[11px] font-mono">
              {col.pk ? "★ " : col.fk ? "→ " : "  "}
              {col.name}
            </text>
            <text
              x={table.x + table.width - 12}
              y={y + 16}
              textAnchor="end"
              className="fill-muted-foreground text-[10px] font-mono"
            >
              {col.type}
            </text>
            {col.rls ? (
              <circle
                cx={table.x + table.width - 6}
                cy={y + 12}
                r={2.5}
                fill="hsl(var(--primary))"
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

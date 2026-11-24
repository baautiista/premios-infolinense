/**
 * Marcado mínimo y seguro para las páginas editables (sin HTML):
 *   ## Título · - lista · **negrita** · [texto](https://…) · [PENDIENTE: …]
 * Se convierte en una estructura que React pinta sin innerHTML.
 */
export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; v: string }
  | { t: "link"; v: string; href: string }
  | { t: "pending"; v: string };

export type Block =
  | { t: "h2"; inline: Inline[] }
  | { t: "h3"; inline: Inline[] }
  | { t: "p"; inline: Inline[] }
  | { t: "ul"; items: Inline[][] };

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /\[PENDIENTE:\s*([^\]]+)\]|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ t: "text", v: src.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: "pending", v: m[1].trim() });
    else if (m[2] !== undefined) out.push({ t: "strong", v: m[2] });
    else if (m[3] !== undefined) {
      const href = m[4];
      if (SAFE_HREF.test(href)) out.push({ t: "link", v: m[3], href });
      else out.push({ t: "text", v: m[3] });
    }
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ t: "text", v: src.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  const flushPara = () => {
    if (para.length) blocks.push({ t: "p", inline: parseInline(para.join(" ")) });
    para = [];
  };
  const flushList = () => {
    if (list) blocks.push({ t: "ul", items: list.map(parseInline) });
    list = null;
  };
  for (const raw of src.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara();
      flushList();
      blocks.push({ t: "h3", inline: parseInline(line.slice(4)) });
    } else if (line.startsWith("## ") || line.startsWith("# ")) {
      flushPara();
      flushList();
      blocks.push({ t: "h2", inline: parseInline(line.replace(/^#+\s/, "")) });
    } else if (/^[-*]\s+/.test(line)) {
      flushPara();
      (list ??= []).push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

/** Cuenta los marcadores [PENDIENTE: …] de un texto (el panel los muestra como avisos). */
export function countPending(src: string): number {
  return (src.match(/\[PENDIENTE:/g) ?? []).length;
}

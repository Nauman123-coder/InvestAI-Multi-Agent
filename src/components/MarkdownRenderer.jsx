import { useEffect, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   MARKDOWN RENDERER — true ChatGPT-style streaming

   THE REAL FIX:
   Instead of rebuilding innerHTML on every token (which flickers),
   we track a "rendered up to" index and only update the DOM for
   NEW content. Completed lines are written once and never touched.
   Only the currently-building last line is updated each token.

   This is how real AI chat UIs work:
   • Completed paragraphs/bullets → written to DOM once, immutable
   • The "in-progress" last line → updated in-place, no re-mount
   • New tokens fade in via CSS animation on a sentinel span
   • Blinking cursor always at the tail
═══════════════════════════════════════════════════════════════ */

/* ── HTML helpers ────────────────────────────────────────────── */
const esc  = (s) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const inln = (s) => s
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/__(.+?)__/g,     "<strong>$1</strong>")
  .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>")
  .replace(/`([^`]+)`/g,     "<code>$1</code>");

/* Convert one markdown line to an HTML fragment (no \n at end) */
function lineToHtml(line) {
  const t = line.trimEnd();
  if (t.startsWith("## "))  return `<h2>${inln(esc(t.slice(3).trim()))}</h2>`;
  if (t.startsWith("### ")) return `<h3>${inln(esc(t.slice(4).trim()))}</h3>`;
  if (/^-{3,}$/.test(t.trim())) return "<hr>";
  if (/^[-•*]\s/.test(t) || /^[✅⚠️→◆◈]\s*/.test(t.trimStart())) {
    const body = t.replace(/^[-•*]\s/,"").replace(/^[✅⚠️→◆◈]\s*/,"").trim();
    return `<li><span>${inln(esc(body))}</span></li>`;
  }
  if (/^\d+\.\s/.test(t)) {
    const body = t.replace(/^\d+\.\s/,"").trim();
    return `<li><span>${inln(esc(body))}</span></li>`;
  }
  if (t.trim() === "") return null; // blank line
  return `<p>${inln(esc(t.trim()))}</p>`;
}

/* Full markdown → HTML (for static, finished render) */
function toHtml(md) {
  if (!md) return "";
  const lines  = md.split("\n");
  const parts  = [];
  let   inList = false;
  const closeList = () => { if (inList) { parts.push("</ul>"); inList = false; } };
  for (const raw of lines) {
    const h = lineToHtml(raw);
    if (h === null) { closeList(); continue; }
    const isBullet = h.startsWith("<li>");
    if (isBullet && !inList) { parts.push("<ul>"); inList = true; }
    if (!isBullet && inList) closeList();
    parts.push(h);
  }
  closeList();
  return parts.join("");
}

/* ── Static renderer (finished messages) ────────────────────── */
function StaticMD({ content }) {
  const html = useMemo(() => toHtml(content), [content]);
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── Streaming renderer ──────────────────────────────────────── */
/*
  State tracked in refs (avoids React re-renders):
  • rootEl     — the container div
  • cursorEl   — the blinking <span class="scur"> always at the tail
  • inListEl   — current open <ul> element (or null)
  • liveEl     — the element being built right now (p/li/h2/h3)
  • doneLines  — how many newlines we've already committed
*/
function StreamingMD({ content }) {
  const rootRef   = useRef(null);
  const stateRef  = useRef({
    doneLines: 0,
    inListEl:  null,
    liveEl:    null,
    cursorEl:  null,
  });

  // Initialize cursor on mount
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cur = document.createElement("span");
    cur.className = "scur";
    root.appendChild(cur);
    stateRef.current.cursorEl = cur;
    return () => { root.innerHTML = ""; };
  }, []);

  // Update DOM on every token append
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !content) return;

    const s   = stateRef.current;
    const cur = s.cursorEl;

    // Split content into lines
    const lines = content.split("\n");

    // Commit all fully-complete lines (all except the last one, which may be partial)
    const completedLines = lines.slice(0, lines.length - 1);
    const partialLine    = lines[lines.length - 1];

    // Process newly completed lines since last render
    for (let i = s.doneLines; i < completedLines.length; i++) {
      const line = completedLines[i];
      const html = lineToHtml(line);

      if (html === null) {
        // Blank line — close list if open
        if (s.inListEl) { s.inListEl = null; }
        s.liveEl = null;
        continue;
      }

      const isBullet = html.startsWith("<li>");

      if (isBullet) {
        if (!s.inListEl) {
          const ul = document.createElement("ul");
          root.insertBefore(ul, cur);
          s.inListEl = ul;
        }
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const li = tmp.firstChild;
        s.inListEl.appendChild(li);
        s.liveEl = null;
      } else {
        s.inListEl = null;
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const el = tmp.firstChild;
        root.insertBefore(el, cur);
        s.liveEl = null;
      }
    }
    s.doneLines = completedLines.length;

    // Handle the partial (in-progress) last line
    if (partialLine !== undefined) {
      const html    = lineToHtml(partialLine);
      const isEmpty = html === null || partialLine.trim() === "";

      if (!isEmpty && html) {
        const isBullet = html.startsWith("<li>");

        // Get or create the live element
        if (!s.liveEl) {
          if (isBullet) {
            if (!s.inListEl) {
              const ul = document.createElement("ul");
              root.insertBefore(ul, cur);
              s.inListEl = ul;
            }
            const li = document.createElement("li");
            li.innerHTML = "<span></span>";
            s.inListEl.appendChild(li);
            s.liveEl = li.querySelector("span");
          } else {
            const tmp = document.createElement("div");
            // Use the tag from lineToHtml result
            const tagMatch = html.match(/^<(\w+)/);
            const tag = tagMatch ? tagMatch[1] : "p";
            const el = document.createElement(tag);
            root.insertBefore(el, cur);
            s.liveEl = el;
            s.inListEl = null;
          }
        }

        // Extract inner content from html (strip outer tags)
        const inner = html.replace(/^<\w+>/, "").replace(/<\/\w+>$/, "");

        // Update live element — apply new-token animation to just the new tail
        // We do this by comparing old inner length to new inner length
        const oldHtml = s.liveEl.innerHTML.replace(/<span class="tok">.*?<\/span>/g, "");
        const newFull = inner;

        if (newFull !== oldHtml) {
          // Find the new suffix
          let commonLen = 0;
          while (
            commonLen < oldHtml.length &&
            commonLen < newFull.length &&
            oldHtml[commonLen] === newFull[commonLen]
          ) commonLen++;

          const oldPart = newFull.slice(0, commonLen);
          const newPart = newFull.slice(commonLen);

          if (newPart) {
            s.liveEl.innerHTML =
              oldPart + `<span class="tok">${newPart}</span>`;
          } else {
            s.liveEl.innerHTML = newFull;
          }
        }
      }
    }

    // Keep cursor at the end
    root.appendChild(cur);

  }, [content]);

  return (
    <div
      ref={rootRef}
      className="prose stream-prose"
    />
  );
}

/* ── Default export ──────────────────────────────────────────── */
export default function MD({ content = "", streaming = false }) {
  if (streaming) return <StreamingMD content={content} />;
  return <StaticMD content={content} />;
}
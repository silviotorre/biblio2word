export const WORD_NS = "http://schemas.openxmlformats.org/officeDocument/2006/bibliography";

export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildTag({ authorFamily, year, title }) {
  const shortTitle = (title || "")
    .split(/\s+/)
    .join("")
    .slice(0, 8);
  const raw = `${authorFamily || "Source"}${year || ""}${shortTitle || ""}`;
  const sanitized = raw.replace(/[^A-Za-z0-9_-]/g, "");
  return sanitized || "Source";
}

export function wrapSourcesXml(sourcesXml) {
  return `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<b:Sources xmlns:b=\"${WORD_NS}\">\n${sourcesXml}\n</b:Sources>`;
}
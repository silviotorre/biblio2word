function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function parseAuthors(authorsText) {
  const normalized = authorsText
    .replace(/\s+&\s+/g, " | ")
    .replace(/\s+and\s+/gi, " | ")
    .replace(/\s+\|\s+/g, " | ")
    .trim();

  if (!normalized) return [];

  return normalized.split("|").map((chunk) => {
    const trimmed = chunk.trim().replace(/[\.,]+$/g, "");
    const match = trimmed.match(/^([^,]+),\s*(.+)$/);
    if (!match) {
      return { family: trimmed, given: "" };
    }
    return {
      family: match[1].trim(),
      given: match[2].replace(/\./g, "").trim(),
    };
  });
}

export function parseOscolaEntry(entry) {
  const cleaned = cleanText(entry);
  const yearMatch = cleaned.match(/\b(\d{4})\b/);
  const year = yearMatch ? yearMatch[1] : "";

  let authorsText = "";
  let title = "";
  let remainder = cleaned;

  const firstComma = cleaned.indexOf(",");
  if (firstComma !== -1) {
    authorsText = cleaned.slice(0, firstComma).trim();
    remainder = cleaned.slice(firstComma + 1).trim();
  }

  const titleEnd = remainder.indexOf("(");
  if (titleEnd !== -1) {
    title = remainder.slice(0, titleEnd).replace(/[\.,]+$/g, "").trim();
  } else {
    const dotEnd = remainder.indexOf(".");
    title = dotEnd !== -1 ? remainder.slice(0, dotEnd).trim() : remainder;
  }

  return {
    authors: parseAuthors(authorsText),
    year,
    title,
    containerTitle: "",
    volume: "",
    issue: "",
    page: "",
    doi: "",
    url: "",
    sourceType: "book",
  };
}
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

function parseContainerDetails(text) {
  const result = {
    containerTitle: "",
    volume: "",
    issue: "",
    page: "",
  };

  if (!text) return result;

  const containerParts = text.split(",").map((part) => part.trim());
  result.containerTitle = containerParts.shift() || "";

  const rest = containerParts.join(", ");
  const volIssueMatch = rest.match(/(\d+)\s*\((\d+)\)/);
  if (volIssueMatch) {
    result.volume = volIssueMatch[1];
    result.issue = volIssueMatch[2];
  } else {
    const volMatch = rest.match(/\b(\d+)\b/);
    if (volMatch) result.volume = volMatch[1];
  }

  const pageMatch = rest.match(/(\d+\s*[-–]\s*\d+)/);
  if (pageMatch) result.page = pageMatch[1].replace(/\s+/g, "");

  return result;
}

export function parseVancouverEntry(entry) {
  const cleaned = cleanText(entry).replace(/^\d+\.?\s*/, "");
  const parts = cleaned.split(".").map((part) => part.trim()).filter(Boolean);

  const authorsText = parts[0] || "";
  const title = parts[1] || "";
  const remainder = parts.slice(2).join(". ");

  const yearMatch = remainder.match(/\b(\d{4})\b/);
  const year = yearMatch ? yearMatch[1] : "";

  let doi = "";
  let url = "";
  const doiMatch = remainder.match(/doi:\s*([^\s]+)/i);
  if (doiMatch) {
    doi = doiMatch[1].replace(/[\.,]+$/g, "");
  }

  const urlMatch = remainder.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    url = urlMatch[0].replace(/[\.,]+$/g, "");
  }

  const { containerTitle, volume, issue, page } = parseContainerDetails(remainder.replace(/\.+$/, ""));

  return {
    authors: parseAuthors(authorsText),
    year,
    title,
    containerTitle,
    volume,
    issue,
    page,
    doi,
    url,
    sourceType: "article-journal",
  };
}
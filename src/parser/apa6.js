export function splitEntries(input) {
  const lines = input.split(/\r?\n/);
  const entries = [];
  let buffer = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (buffer.length) {
        entries.push(buffer.join(" ").trim());
        buffer = [];
      }
      continue;
    }
    buffer.push(trimmed);
  }

  if (buffer.length) {
    entries.push(buffer.join(" ").trim());
  }

  return entries.filter(Boolean);
}

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

export function parseApa6Entry(entry) {
  const cleaned = cleanText(entry);
  const yearMatch = cleaned.match(/\((\d{4})(?:[a-z])?\)/);
  const year = yearMatch ? yearMatch[1] : "";

  let authorsText = "";
  let remainder = cleaned;
  if (yearMatch && yearMatch.index !== undefined) {
    authorsText = cleaned.slice(0, yearMatch.index).replace(/[\.,]+$/g, "").trim();
    remainder = cleaned.slice(yearMatch.index + yearMatch[0].length).trim();
  }

  remainder = remainder.replace(/^\./, "").trim();

  let title = "";
  let afterTitle = remainder;
  const titleEnd = remainder.indexOf(".");
  if (titleEnd !== -1) {
    title = remainder.slice(0, titleEnd).trim();
    afterTitle = remainder.slice(titleEnd + 1).trim();
  } else {
    title = remainder;
    afterTitle = "";
  }

  let doi = "";
  let url = "";
  const doiMatch = afterTitle.match(/doi:\s*([^\s]+)/i);
  if (doiMatch) {
    doi = doiMatch[1].replace(/[\.,]+$/g, "");
    afterTitle = afterTitle.replace(doiMatch[0], "").trim();
  }

  const urlMatch = afterTitle.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    url = urlMatch[0].replace(/[\.,]+$/g, "");
    afterTitle = afterTitle.replace(urlMatch[0], "").trim();
  }

  const { containerTitle, volume, issue, page } = parseContainerDetails(afterTitle.replace(/\.+$/, ""));

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
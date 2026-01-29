import { escapeXml, buildTag } from "./xml.js";

function normalizeSourceType(type) {
  switch (type) {
    case "article-journal":
      return "JournalArticle";
    case "book":
      return "Book";
    case "chapter":
      return "BookSection";
    default:
      return "Misc";
  }
}

function buildAuthorXml(authors) {
  if (!authors || !authors.length) return "";
  const persons = authors
    .map((author) => {
      const family = escapeXml(author.family || "");
      const given = escapeXml(author.given || "");
      return `      <b:Person>\n        <b:Last>${family}</b:Last>\n        <b:First>${given}</b:First>\n      </b:Person>`;
    })
    .join("\n");

  return `  <b:Author>\n    <b:NameList>\n${persons}\n    </b:NameList>\n  </b:Author>`;
}

function extractYear(item) {
  const year = item.issued?.["date-parts"]?.[0]?.[0];
  return year ? String(year) : "";
}

export function cslJsonToWordSourceXml(item, { tag } = {}) {
  const authorFamily = item.author?.[0]?.family || "";
  const year = extractYear(item);
  const title = item.title || "";
  const sourceTag = tag || buildTag({ authorFamily, year, title });

  const fields = [
    `<b:Tag>${escapeXml(sourceTag)}</b:Tag>`,
    `<b:SourceType>${normalizeSourceType(item.type)}</b:SourceType>`,
    title ? `<b:Title>${escapeXml(title)}</b:Title>` : "",
    item["container-title"] ? `<b:JournalName>${escapeXml(item["container-title"])}</b:JournalName>` : "",
    year ? `<b:Year>${escapeXml(year)}</b:Year>` : "",
    item.volume ? `<b:Volume>${escapeXml(item.volume)}</b:Volume>` : "",
    item.issue ? `<b:Issue>${escapeXml(item.issue)}</b:Issue>` : "",
    item.page ? `<b:Pages>${escapeXml(item.page)}</b:Pages>` : "",
    item.DOI ? `<b:DOI>${escapeXml(item.DOI)}</b:DOI>` : "",
    item.URL ? `<b:URL>${escapeXml(item.URL)}</b:URL>` : "",
  ].filter(Boolean);

  const authorXml = buildAuthorXml(item.author);

  return `<b:Source>\n${fields.map((line) => `  ${line}`).join("\n")}\n${authorXml ? `${authorXml}\n` : ""}</b:Source>`;
}

export function ensureUniqueTags(items) {
  const used = new Map();
  return items.map((item) => {
    const baseTag = buildTag({
      authorFamily: item.author?.[0]?.family || "",
      year: extractYear(item),
      title: item.title || "",
    });
    const count = used.get(baseTag) || 0;
    used.set(baseTag, count + 1);
    const tag = count === 0 ? baseTag : `${baseTag}-${count + 1}`;
    return { item, tag };
  });
}
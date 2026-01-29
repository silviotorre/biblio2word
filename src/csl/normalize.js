export function toCslJson(parsed, index = 0) {
  const issued = parsed.year ? { "date-parts": [[Number(parsed.year)]] } : undefined;

  return {
    id: `item-${index + 1}`,
    type: parsed.sourceType || "article-journal",
    title: parsed.title || "",
    "container-title": parsed.containerTitle || "",
    volume: parsed.volume || "",
    issue: parsed.issue || "",
    page: parsed.page || "",
    DOI: parsed.doi || "",
    URL: parsed.url || "",
    author: parsed.authors || [],
    issued,
  };
}
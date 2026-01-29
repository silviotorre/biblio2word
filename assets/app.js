import { splitEntries, parseApa6Entry } from "../src/parser/apa6.js";
import { toCslJson } from "../src/csl/normalize.js";
import { cslJsonToWordSourceXml, ensureUniqueTags } from "../src/word/mapping.js";
import { wrapSourcesXml } from "../src/word/xml.js";

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const fullXml = document.getElementById("fullXml");
const styleSelect = document.getElementById("styleSelect");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

function parseEntries(style, entries) {
  switch (style) {
    case "apa6":
    default:
      return entries.map((entry) => parseApa6Entry(entry));
  }
}

function convert() {
  const entries = splitEntries(inputText.value);
  if (!entries.length) {
    outputText.value = "";
    return;
  }

  const parsed = parseEntries(styleSelect.value, entries);
  const cslItems = parsed.map((item, index) => toCslJson(item, index));
  const tagged = ensureUniqueTags(cslItems);

  const sourcesXml = tagged.map(({ item, tag }) => cslJsonToWordSourceXml(item, { tag })).join("\n");
  outputText.value = fullXml.checked ? wrapSourcesXml(sourcesXml) : sourcesXml;
}

async function copyOutput() {
  const text = outputText.value.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    outputText.select();
    document.execCommand("copy");
  }
}

function downloadOutput() {
  const text = outputText.value.trim();
  if (!text) return;
  const blob = new Blob([text], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fullXml.checked ? "sources.xml" : "sources-nodes.xml";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

inputText.addEventListener("input", convert);
fullXml.addEventListener("change", convert);
styleSelect.addEventListener("change", convert);
copyBtn.addEventListener("click", copyOutput);
downloadBtn.addEventListener("click", downloadOutput);

convert();
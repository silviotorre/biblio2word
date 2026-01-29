import assert from "node:assert/strict";
import { cslJsonToWordSourceXml } from "../src/word/mapping.js";
import { buildTag, escapeXml } from "../src/word/xml.js";

function testEscapeXml() {
  const escaped = escapeXml("A & B < C > D \" E ' F");
  assert.equal(escaped, "A &amp; B &lt; C &gt; D &quot; E &apos; F");
}

function testBuildTag() {
  const tag = buildTag({ authorFamily: "Rossi", year: "2019", title: "Titolo articolo" });
  assert.equal(tag.startsWith("Rossi2019"), true);
}

function testMapping() {
  const item = {
    type: "article-journal",
    title: "A & B",
    "container-title": "Journal",
    issued: { "date-parts": [[2020]] },
    volume: "12",
    issue: "3",
    page: "45-67",
    DOI: "10.1000/xyz",
    URL: "https://example.com",
    author: [{ family: "Rossi", given: "Mario" }],
  };

  const xml = cslJsonToWordSourceXml(item, { tag: "Rossi2020A" });
  assert.match(xml, /<b:SourceType>JournalArticle<\/b:SourceType>/);
  assert.match(xml, /<b:Title>A &amp; B<\/b:Title>/);
  assert.match(xml, /<b:Author>/);
}

function run() {
  testEscapeXml();
  testBuildTag();
  testMapping();
  console.log("All tests passed");
}

run();
# biblio2word

Convertitore di citazioni bibliografiche (es. APA) in **Word Bibliography XML (OOXML)** secondo lo schema:
`http://schemas.openxmlformats.org/officeDocument/2006/bibliography`

Obiettivo: incollare una o più bibliografie in input e ottenere:
- singoli nodi `<b:Source>` copiabili
- opzionalmente un file completo `<b:Sources>` pronto per Word

## Funzionalità
- Input: uno o più riferimenti bibliografici (inizialmente APA, poi estendibile)
- Output: XML compatibile con Word (OOXML Bibliography)
- Modalità:
  - `Sources`: genera solo i nodi `<b:Source>`
  - `File completo`: genera wrapper `<?xml...?><b:Sources ...>...</b:Sources>`
- Generazione `Tag` univoco (configurabile)
- Escape XML automatico

## Standard intermedio
La normalizzazione dei dati avviene tramite **CSL-JSON** (Citation Style Language JSON), usato da Zotero/Pandoc/citeproc.

Pipeline:


Testo libero (APA/altro)
→ parsing/normalizzazione
→ CSL-JSON
→ mapping CSL-JSON → Word OOXML Bibliography
→ XML finale


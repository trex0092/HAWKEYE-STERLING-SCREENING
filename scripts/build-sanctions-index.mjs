// Build a compact, keyless sanctions/PEP index from the FREE, openly-licensed
// OpenSanctions data exports. Runs at build time (see package.json "build") and
// writes src/lib/data/generated/sanctions-index.tsv.gz, which the screening
// route loads in-process at runtime — no API key, no runtime network.
//
// Resilient by design: every download is best-effort with a timeout. On any
// failure (offline/CI/blocked egress) it still writes a valid (possibly empty)
// index and exits 0, so the build never breaks — the app simply reports "not
// screened" until a real index is present. Set SKIP_SANCTIONS_INDEX=1 to skip
// downloads entirely (used by CI to stay fast and hermetic).
//
// Data: OpenSanctions (https://www.opensanctions.org) — free downloads.

import { createWriteStream, mkdirSync } from "node:fs";
import { createGzip } from "node:zlib";
import path from "node:path";

const BASE =
  process.env.OPENSANCTIONS_DATA_BASE || "https://data.opensanctions.org/datasets/latest";
const OUT_DIR = path.join(process.cwd(), "src/lib/data/generated");
const OUT_FILE = path.join(OUT_DIR, "sanctions-index.tsv.gz");
const TIMEOUT_MS = Number(process.env.SANCTIONS_INDEX_TIMEOUT_MS || 180_000);
const MAX_ENTRIES = Number(process.env.SANCTIONS_INDEX_MAX || 1_500_000);

// [dataset code, default topic]. The dataset code doubles as the chip label via
// the runtime CODE_BY_DATASET map (OFAC/UN/EU/UK/INTERPOL).
const SOURCES = [
  ["us_ofac_sdn", "sanction"],
  ["us_ofac_cons", "sanction"],
  ["un_sc_sanctions", "sanction"],
  ["eu_fsf", "sanction"],
  ["gb_hmt_sanctions", "sanction"],
  ["interpol_red_notices", "crime"],
  ["peps", "role.pep"],
];

const clean = (s) => (s || "").replace(/[\t\r\n]+/g, " ").trim();

/** Stream a CSV URL, invoking onRow(rowArray) for each data row. */
async function streamCsv(url, onHeader, onRow) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "HawkeyeSterlingScreening/1.0 (+build)" },
    });
    if (!res.ok || !res.body) return { ok: false, status: res.status };

    const dec = new TextDecoder("utf-8");
    let field = "";
    let row = [];
    let inQuotes = false;
    let quoteClosing = false;
    let headerSeen = false;
    let count = 0;

    const endRow = () => {
      row.push(field);
      field = "";
      if (!headerSeen) {
        headerSeen = true;
        onHeader(row);
      } else if (row.length > 1 || row[0] !== "") {
        onRow(row);
        count++;
      }
      row = [];
    };

    for await (const chunk of res.body) {
      const text = dec.decode(chunk, { stream: true });
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoteClosing) {
          quoteClosing = false;
          if (c === '"') {
            field += '"';
            continue;
          }
          inQuotes = false;
        }
        if (inQuotes) {
          if (c === '"') quoteClosing = true;
          else field += c;
          continue;
        }
        if (c === '"') inQuotes = true;
        else if (c === ",") {
          row.push(field);
          field = "";
        } else if (c === "\n") endRow();
        else if (c !== "\r") field += c;
      }
    }
    if (field !== "" || row.length) endRow();
    return { ok: true, count };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const gzip = createGzip();
  const sink = createWriteStream(OUT_FILE);
  gzip.pipe(sink);
  const done = new Promise((resolve, reject) => {
    sink.on("finish", resolve);
    sink.on("error", reject);
  });

  let total = 0;

  if (process.env.SKIP_SANCTIONS_INDEX === "1") {
    console.log("[sanctions-index] SKIP_SANCTIONS_INDEX=1 → writing empty index.");
  } else {
    for (const [dataset, defaultTopic] of SOURCES) {
      if (total >= MAX_ENTRIES) break;
      const url = `${BASE}/${dataset}/targets.simple.csv`;
      let cols = null;
      const idxOf = (...names) => {
        if (!cols) return -1;
        for (const n of names) {
          const i = cols.indexOf(n);
          if (i !== -1) return i;
        }
        return -1;
      };
      let cName, cAlias, cSchema, cCountry, cDatasets, cTopics;

      const res = await streamCsv(
        url,
        (header) => {
          cols = header.map((h) => clean(h).toLowerCase());
          cName = idxOf("name", "caption");
          cAlias = idxOf("aliases", "alias");
          cSchema = idxOf("schema");
          cCountry = idxOf("countries", "country");
          cDatasets = idxOf("datasets", "dataset");
          cTopics = idxOf("topics");
        },
        (r) => {
          if (total >= MAX_ENTRIES) return;
          const name = clean(cName >= 0 ? r[cName] : "");
          if (!name) return;
          const aliases =
            cAlias >= 0 && r[cAlias]
              ? r[cAlias].split(";").map(clean).filter(Boolean).join("|")
              : "";
          const schema = clean(cSchema >= 0 ? r[cSchema] : "") || "Entity";
          const country = cCountry >= 0 && r[cCountry] ? clean(r[cCountry].split(";")[0]) : "";
          const datasets =
            cDatasets >= 0 && r[cDatasets]
              ? r[cDatasets].split(";").map(clean).filter(Boolean).join(",")
              : dataset;
          const topics =
            cTopics >= 0 && r[cTopics]
              ? r[cTopics].split(";").map(clean).filter(Boolean).join(",")
              : defaultTopic;
          gzip.write([name, aliases, schema, country, datasets, topics].join("\t") + "\n");
          total++;
        },
      );

      if (res.ok) console.log(`[sanctions-index] ${dataset}: ${res.count} rows`);
      else console.warn(`[sanctions-index] ${dataset}: skipped (${res.status || res.error})`);
    }
  }

  gzip.end();
  await done;
  console.log(
    `[sanctions-index] wrote ${total} entries → ${path.relative(process.cwd(), OUT_FILE)}`,
  );
}

main().catch((err) => {
  // Never fail the build over screening data; degrade to "not screened".
  console.warn("[sanctions-index] non-fatal error:", err?.message || err);
  process.exit(0);
});

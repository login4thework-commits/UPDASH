import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import XLSX from "xlsx";

const workbookPath = path.resolve("data/source.xlsx");
const outputPath = path.resolve("data/assemblies.json");
const electionPath = path.resolve("data/UP");

const workbook = XLSX.readFile(workbookPath);
const sheet = workbook.Sheets.Sheet1;

if (!sheet) {
  throw new Error("Sheet1 was not found in data/source.xlsx");
}

const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
const electionRows = parse(fs.readFileSync(electionPath, "utf8"), {
  columns: true,
  skip_empty_lines: true
});

const parseNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeCasteName = (value) => {
  const caste = String(value || "").trim();
  if (caste === "Jatav") {
    return "Jatav / Chamar";
  }
  return caste;
};

const assembliesMap = new Map();
const electionMap = new Map();

for (const row of rows) {
  const acNumber = parseNumber(row["AC Number"]);
  const assemblyName = String(row["AC Name"] || "").trim();

  if (!assemblyName) {
    continue;
  }

  const key = `${acNumber}-${assemblyName}`;

  if (!assembliesMap.has(key)) {
    assembliesMap.set(key, {
      id: key,
      acNumber,
      assemblyName,
      district: String(row["District"] || "").trim(),
      zone: String(row["Zone"] || "").trim(),
      partyDistrict: String(row["Party District"] || "").trim(),
      totalPopulation: parseNumber(row["Total population"]),
      casteRows: []
    });
  }

  assembliesMap.get(key).casteRows.push({
    caste: normalizeCasteName(row["Caste "]),
    category: String(row["Category"] || "").trim(),
    castePopulation: parseNumber(row["Caste Population"]),
    percentage: parseNumber(row["Percentage"])
  });
}

for (const row of electionRows) {
  const acNumber = parseNumber(row["Constituency_No"]);
  const year = parseNumber(row["Year"]);

  // Keep only the modern post-delimitation assembly map.
  // Older rows reuse constituency numbers for different names, which can
  // attach the wrong history to the current assembly.
  if (!acNumber || !year || year < 2012) {
    continue;
  }

  if (!electionMap.has(acNumber)) {
    electionMap.set(acNumber, new Map());
  }

  const yearlyMap = electionMap.get(acNumber);

  if (!yearlyMap.has(year)) {
    yearlyMap.set(year, []);
  }

  yearlyMap.get(year).push({
    year,
    position: parseNumber(row["Position"]),
    candidate: String(row["Candidate"] || "").trim(),
    party: String(row["Party"] || "").trim(),
    votes: parseNumber(row["Votes"]),
    voteShare: parseNumber(row["Vote_Share_Percentage"]),
    turnout: parseNumber(row["Turnout_Percentage"]),
    margin: parseNumber(row["Margin"]),
    marginPercentage: parseNumber(row["Margin_Percentage"])
  });
}

const summarizeElectionResult = (year, candidates) => {
  const sorted = [...candidates].sort((left, right) => left.position - right.position);
  const winner = sorted.find((candidate) => candidate.position === 1) || sorted[0];
  const runnerUp = sorted.find((candidate) => candidate.position === 2) || null;

  return {
    year,
    winner: winner?.candidate || "",
    winnerParty: winner?.party || "",
    winnerVotes: winner?.votes || 0,
    winnerVoteShare: winner?.voteShare || 0,
    runnerUp: runnerUp?.candidate || "",
    runnerUpParty: runnerUp?.party || "",
    runnerUpVotes: runnerUp?.votes || 0,
    margin:
      winner?.margin ||
      Math.max((winner?.votes || 0) - (runnerUp?.votes || 0), 0),
    marginPercentage: winner?.marginPercentage || 0,
    turnout: winner?.turnout || 0
  };
};

const buildElectionYearGroup = (year, candidates) => {
  const sorted = [...candidates].sort((left, right) => left.position - right.position);

  return {
    year,
    summary: summarizeElectionResult(year, candidates),
    candidates: sorted.map((candidate) => ({
      position: candidate.position,
      candidate: candidate.candidate,
      party: candidate.party,
      votes: candidate.votes,
      voteShare: candidate.voteShare,
      turnout: candidate.turnout,
      margin: candidate.margin,
      marginPercentage: candidate.marginPercentage
    }))
  };
};

const assemblies = [...assembliesMap.values()]
  .map((assembly) => ({
    ...assembly,
    electionResults: [...(electionMap.get(assembly.acNumber)?.entries() || [])]
      .map(([year, candidates]) => buildElectionYearGroup(year, candidates))
      .sort((left, right) => right.year - left.year),
    casteRows: assembly.casteRows
      .filter((row) => row.caste && row.castePopulation > 0)
      .sort((left, right) => right.percentage - left.percentage)
      .map((row, index) => ({
        ...row,
        rank: index + 1
      }))
  }))
  .sort((left, right) => left.acNumber - right.acNumber);

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      totalAssemblies: assemblies.length,
      assemblies
    },
    null,
    2
  )
);

console.log(`Wrote ${assemblies.length} assemblies to ${outputPath}`);

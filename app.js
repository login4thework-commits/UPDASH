const searchElement = document.querySelector("#assembly-search");
const selectElement = document.querySelector("#assembly-select");
const historyPartySelectElement = document.querySelector("#history-party-select");
const historyRuleSelectElement = document.querySelector("#history-rule-select");
const metaTextElement = document.querySelector("#meta-text");
const rowCountElement = document.querySelector("#row-count");
const tableBodyElement = document.querySelector("#table-body");
const allianceResultsBodyElement = document.querySelector("#alliance-results-body");
const secPartyResultsBodyElement = document.querySelector("#sec-party-results-body");
const historyFilterBodyElement = document.querySelector("#history-filter-body");
const historyFilterCountElement = document.querySelector("#history-filter-count");
const historyPaginationElement = document.querySelector("#history-pagination");
const electionRowCountElement = document.querySelector("#election-row-count");
const electionResultsContainerElement = document.querySelector("#election-results-container");

const DEFAULT_HISTORY_PAGE_SIZE = 5;
let historyFilterPage = 1;
let historyShowAll = false;
let printExpandedRows = [];

const fields = {
  assemblyName: document.querySelector("#assembly-name"),
  mlaName: document.querySelector("#mla-name"),
  partyName: document.querySelector("#party-name"),
  partyCard: document.querySelector("#party-name")?.closest(".snapshot-card"),
  topCaste: document.querySelector("#top-caste"),
  latestMargin: document.querySelector("#latest-margin"),
  latestTurnout: document.querySelector("#latest-turnout"),
  district: document.querySelector("#district-name"),
  zone: document.querySelector("#zone-name"),
  totalPopulation: document.querySelector("#total-population")
};

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0
});

const percentFormatter = new Intl.NumberFormat("en-IN", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
});
const plainPercentFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const isHighlighted = (row) => row.percentage > 0.05;
const cleanLabel = (value) => String(value || "").replace(/^\d+\.\s*/, "").trim();
const getPartyClass = (party) => {
  const normalized = String(party || "").trim().toUpperCase();
  if (normalized === "SP") return "party-sp";
  if (normalized === "INC") return "party-inc";
  if (normalized === "BJP") return "party-bjp";
  if (normalized === "BSP") return "party-bsp";
  return "";
};

const allianceResults = [
  { alliance: "NDA", party: "BJP", popularVote: 38051721, votePercent: 41.29, contested: 376, won: 255, seatChange: -57 },
  { alliance: "NDA", party: "AD(S)", popularVote: 1493181, votePercent: 1.62, contested: 17, won: 12, seatChange: 3 },
  { alliance: "NDA", party: "NISHAD", popularVote: 840584, votePercent: 0.91, contested: 10, won: 6, seatChange: 5 },
  { alliance: "NDA Total", party: "Total", popularVote: 40385487, votePercent: 43.82, contested: 403, won: 273, seatChange: -52 },
  { alliance: "SP+", party: "SP", popularVote: 29543934, votePercent: 32.06, contested: 347, won: 111, seatChange: 64 },
  { alliance: "SP+", party: "RLD", popularVote: 2630168, votePercent: 2.85, contested: 33, won: 8, seatChange: 8 },
  { alliance: "SP+", party: "SBSP", popularVote: 1252925, votePercent: 1.36, contested: 19, won: 6, seatChange: 2 },
  { alliance: "SP+", party: "AD(K)", popularVote: 258103, votePercent: 0.28, contested: 6, won: 1, seatChange: 0 },
  { alliance: "SP+", party: "NCP", popularVote: 44180, votePercent: 0.05, contested: 1, won: 0, seatChange: 0 },
  { alliance: "SP+ Total", party: "Total", popularVote: 33729510, votePercent: 36.6, contested: 402, won: 125, seatChange: 71 },
  { alliance: "BSP", party: "BSP", popularVote: 11873137, votePercent: 12.88, contested: 403, won: 1, seatChange: -18 },
  { alliance: "UPA", party: "INC", popularVote: 2151234, votePercent: 2.33, contested: 399, won: 2, seatChange: -5 },
  { alliance: "BPM", party: "AIMIM", popularVote: 450929, votePercent: 0.49, contested: 94, won: 0, seatChange: 0 },
  { alliance: "None", party: "JD(L)", popularVote: 191874, votePercent: 0.21, contested: 16, won: 2, seatChange: 2 },
  { alliance: "Independent", party: "IND", popularVote: 1024193, votePercent: 1.11, contested: 1025, won: 0, seatChange: -3 }
];

const secRecognizedPartyResults = [
  { index: 1, party: "भारतीय जनता पार्टी", mayorWon: 17, corporatorWon: 813, nagarPalikaChairWon: 89, nagarPalikaMemberWon: 1360, nagarPanchayatChairWon: 191, nagarPanchayatMemberWon: 1403 },
  { index: 2, party: "समाजवादी पार्टी", mayorWon: 0, corporatorWon: 191, nagarPalikaChairWon: 35, nagarPalikaMemberWon: 425, nagarPanchayatChairWon: 79, nagarPanchayatMemberWon: 485 },
  { index: 3, party: "बहुजन समाज पार्टी", mayorWon: 0, corporatorWon: 85, nagarPalikaChairWon: 16, nagarPalikaMemberWon: 191, nagarPanchayatChairWon: 37, nagarPanchayatMemberWon: 215 },
  { index: 4, party: "भारतीय राष्ट्रीय कांग्रेस", mayorWon: 0, corporatorWon: 77, nagarPalikaChairWon: 4, nagarPalikaMemberWon: 91, nagarPanchayatChairWon: 14, nagarPanchayatMemberWon: 77 },
  { index: 5, party: "ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन", mayorWon: 0, corporatorWon: 19, nagarPalikaChairWon: 3, nagarPalikaMemberWon: 33, nagarPanchayatChairWon: 2, nagarPanchayatMemberWon: 23 },
  { index: 6, party: "राष्ट्रीय लोक दल", mayorWon: 0, corporatorWon: 10, nagarPalikaChairWon: 7, nagarPalikaMemberWon: 40, nagarPanchayatChairWon: 7, nagarPanchayatMemberWon: 38 },
  { index: 7, party: "आम आदमी पार्टी", mayorWon: 0, corporatorWon: 8, nagarPalikaChairWon: 3, nagarPalikaMemberWon: 30, nagarPanchayatChairWon: 6, nagarPanchayatMemberWon: 61 },
  { index: 8, party: "Other", mayorWon: 0, corporatorWon: 1, nagarPalikaChairWon: 0, nagarPalikaMemberWon: 9, nagarPanchayatChairWon: 5, nagarPanchayatMemberWon: 16 }
];

const renderAllianceResults = () => {
  allianceResultsBodyElement.innerHTML = allianceResults
    .map(
      (row) => `
        <tr class="${row.party === "Total" ? "alliance-total-row" : ""}">
          <td>${row.alliance}</td>
          <td class="${getPartyClass(row.party)}">${row.party}</td>
          <td>${numberFormatter.format(row.contested)}</td>
          <td>${numberFormatter.format(row.won)}</td>
          <td>${numberFormatter.format(row.popularVote)}</td>
          <td>${plainPercentFormatter.format(row.votePercent)}%</td>
          <td>${row.seatChange > 0 ? "+" : ""}${row.seatChange}</td>
        </tr>
      `
    )
    .join("");
};

const renderSecPartyResults = () => {
  secPartyResultsBodyElement.innerHTML = secRecognizedPartyResults
    .map(
      (row) => `
        <tr>
          <td class="compact-index-col">${row.index}</td>
          <td>${row.party}</td>
          <td>${numberFormatter.format(row.mayorWon)}</td>
          <td>${numberFormatter.format(row.corporatorWon)}</td>
          <td>${numberFormatter.format(row.nagarPalikaChairWon)}</td>
          <td>${numberFormatter.format(row.nagarPalikaMemberWon)}</td>
          <td>${numberFormatter.format(row.nagarPanchayatChairWon)}</td>
          <td>${numberFormatter.format(row.nagarPanchayatMemberWon)}</td>
        </tr>
      `
    )
    .join("");
};

const getRecentElections = (assembly, count) =>
  (assembly?.electionResults || [])
    .filter((result) => [2022, 2017, 2012].includes(result.year))
    .slice(0, count);

const getHistoryStatusLabel = (rule) => {
  if (rule === "won_last_3") return "Won last 3";
  if (rule === "won_last_2") return "Won last 2";
  if (rule === "lost_last_3") return "Lost last 3";
  return "Lost last 2";
};

const renderHistoryFilter = (assemblies) => {
  const party = historyPartySelectElement.value;
  const rule = historyRuleSelectElement.value;

  if (!party) {
    historyFilterCountElement.textContent = "0 assemblies";
    historyPaginationElement.innerHTML = "";
    historyFilterBodyElement.innerHTML =
      '<tr><td colspan="3" class="empty-state">Select a party to view filtered assembly results.</td></tr>';
    return;
  }

  const requiredCount = rule.endsWith("_3") ? 3 : 2;
  const wantsWon = rule.startsWith("won");
  const pageSize = historyShowAll ? Number.POSITIVE_INFINITY : DEFAULT_HISTORY_PAGE_SIZE;

  const matches = assemblies
    .map((assembly) => {
      const recent = getRecentElections(assembly, requiredCount);

      if (recent.length < requiredCount) {
        return null;
      }

      const allMatch = recent.every((result) => result.summary.winnerParty === party);
      const noneMatch = recent.every((result) => result.summary.winnerParty !== party);
      const isMatch = wantsWon ? allMatch : noneMatch;

      if (!isMatch) {
        return null;
      }

      return {
        assemblyName: assembly.assemblyName,
        acNumber: assembly.acNumber,
        status: getHistoryStatusLabel(rule),
        recent
      };
    })
    .filter(Boolean);

  if (!matches.length) {
    historyFilterCountElement.textContent = "0 assemblies";
    historyPaginationElement.innerHTML = "";
    historyFilterBodyElement.innerHTML =
      '<tr><td colspan="3" class="empty-state">No assemblies match this party and condition.</td></tr>';
    return;
  }

  const totalPages =
    pageSize === Number.POSITIVE_INFINITY
      ? 1
      : Math.ceil(matches.length / pageSize);
  historyFilterPage = Math.min(historyFilterPage, totalPages);
  const startIndex = pageSize === Number.POSITIVE_INFINITY ? 0 : (historyFilterPage - 1) * pageSize;
  const visibleMatches =
    pageSize === Number.POSITIVE_INFINITY
      ? matches
      : matches.slice(startIndex, startIndex + pageSize);

  historyFilterCountElement.textContent = `${matches.length} assemblies`;

  historyFilterBodyElement.innerHTML = visibleMatches
    .map(
      (match) => `
        <tr>
          <td>AC ${match.acNumber} - ${match.assemblyName}</td>
          <td>
            ${match.recent
              .map(
                (result) =>
                  `<div class="history-result-line"><strong>${result.year}</strong>: ${result.summary.winner} <span class="${getPartyClass(result.summary.winnerParty)}">${result.summary.winnerParty}</span></div>`
              )
              .join("")}
          </td>
          <td class="mobile-hide">${match.status}</td>
        </tr>
      `
    )
    .join("");

  historyPaginationElement.innerHTML =
    totalPages <= 1 || pageSize === Number.POSITIVE_INFINITY
      ? matches.length > DEFAULT_HISTORY_PAGE_SIZE
        ? `
          <button class="page-button" type="button" data-page-action="toggle-all">
            ${historyShowAll ? "Show Paged" : "Show All"}
          </button>
        `
        : ""
      : `
        <button class="page-button" type="button" data-page-action="prev" ${historyFilterPage === 1 ? "disabled" : ""}>
          Previous
        </button>
        <span class="page-status">Page ${historyFilterPage} of ${totalPages}</span>
        <button class="page-button" type="button" data-page-action="next" ${historyFilterPage === totalPages ? "disabled" : ""}>
          Next
        </button>
        <button class="page-button" type="button" data-page-action="toggle-all">
          Show All
        </button>
      `;
};

const setSnapshot = (assembly) => {
  const latestElection =
    assembly?.electionResults?.find((result) => result.year === 2022) ||
    assembly?.electionResults?.[0];
  const topCaste = assembly?.casteRows?.[0];

  fields.assemblyName.textContent = assembly?.assemblyName || "-";
  fields.mlaName.textContent = latestElection?.summary?.winner || "-";
  fields.partyName.textContent = latestElection?.summary?.winnerParty || "-";
  const partyClass = getPartyClass(latestElection?.summary?.winnerParty);
  fields.partyName.className = `party-badge ${partyClass}`.trim();
  fields.partyCard.className = `snapshot-card party-card ${partyClass}`.trim();
  fields.topCaste.textContent = topCaste
    ? `${topCaste.caste} (${percentFormatter.format(topCaste.percentage)})`
    : "-";
  fields.latestMargin.textContent = latestElection
    ? `${plainPercentFormatter.format(latestElection.summary.marginPercentage)}%`
    : "-";
  fields.latestTurnout.textContent = latestElection
    ? `${plainPercentFormatter.format(latestElection.summary.turnout)}%`
    : "-";
  fields.district.textContent = assembly?.district || "-";
  fields.zone.textContent = assembly ? cleanLabel(assembly.zone) : "-";
  fields.totalPopulation.textContent = assembly
    ? numberFormatter.format(assembly.totalPopulation)
    : "-";
};

const renderTable = (rows) => {
  if (!rows.length) {
    tableBodyElement.innerHTML =
      '<tr><td colspan="5" class="empty-state">No caste rows found for this assembly.</td></tr>';
    rowCountElement.textContent = "0 rows";
    return;
  }

  const totals = rows.reduce(
    (summary, row) => ({
      castePopulation: summary.castePopulation + row.castePopulation,
      percentage: summary.percentage + row.percentage
    }),
    { castePopulation: 0, percentage: 0 }
  );

  tableBodyElement.innerHTML = rows
    .map(
      (row) => `
        <tr class="${isHighlighted(row) ? "highlight-row" : ""}">
          <td>${row.rank}</td>
          <td class="${isHighlighted(row) ? "highlight-cell" : ""}">${row.caste}</td>
          <td class="${isHighlighted(row) ? "highlight-pill-cell" : ""}">${percentFormatter.format(row.percentage)}</td>
          <td>${row.category || "-"}</td>
          <td>${numberFormatter.format(row.castePopulation)}</td>
        </tr>
      `
    )
    .join("")
    .concat(`
      <tr class="total-row">
        <td colspan="3">Total</td>
        <td>${percentFormatter.format(totals.percentage)}</td>
        <td>${numberFormatter.format(totals.castePopulation)}</td>
      </tr>
    `);

  rowCountElement.textContent = `${rows.length} rows`;
};

const renderElectionTable = (rows) => {
  if (!rows.length) {
    electionResultsContainerElement.innerHTML = `
      <div class="table-wrap">
        <table>
          <tbody>
            <tr>
              <td class="empty-state">No election results found for this assembly.</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    electionRowCountElement.textContent = "0 years";
    return;
  }

  electionResultsContainerElement.innerHTML = rows
    .map(
      (yearGroup, index) => `
        <section class="year-block" data-year-index="${index}">
          <div class="year-block-header">
            <div>
              <p class="eyebrow">Year ${yearGroup.year}</p>
              <h3>Election Results ${yearGroup.year}</h3>
            </div>
            <div class="year-summary">
              <span class="year-summary-label">Winner</span>
              <span>${yearGroup.summary.winner || "-"}</span>
              <span class="${getPartyClass(yearGroup.summary.winnerParty)}">${yearGroup.summary.winnerParty || "-"}</span>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Candidate</th>
                  <th>Party</th>
                  <th>Votes</th>
                  <th>Vote Share</th>
                  <th>Margin %</th>
                  <th>Turnout</th>
                </tr>
              </thead>
              <tbody>
                ${yearGroup.candidates
                  .map((candidate, candidateIndex) => {
                    const hiddenClass = candidateIndex >= 4 ? "candidate-row-hidden" : "";
                    return `
                      <tr class="${candidate.position === 1 ? "winner-row" : ""} ${hiddenClass}" ${candidateIndex >= 4 ? 'data-extra-row="true"' : ""}>
                        <td>${candidate.position || "-"}</td>
                        <td>${candidate.candidate || "-"}</td>
                        <td class="${getPartyClass(candidate.party)}">${candidate.party || "-"}</td>
                        <td>${numberFormatter.format(candidate.votes)}</td>
                        <td>${plainPercentFormatter.format(candidate.voteShare)}%</td>
                        <td>${plainPercentFormatter.format(candidate.marginPercentage)}%</td>
                        <td>${plainPercentFormatter.format(candidate.turnout)}%</td>
                      </tr>
                    `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          ${
            yearGroup.candidates.length > 4
              ? `
                <button class="view-more-button" type="button" data-view-more>
                  View More
                </button>
              `
              : ""
          }
        </section>
      `
    )
    .join("");

  electionRowCountElement.textContent = `${rows.length} years`;
};

const renderAssembly = (assembly) => {
  setSnapshot(assembly);
  renderTable(assembly?.casteRows || []);
  renderElectionTable(assembly?.electionResults || []);

  if (assembly) {
    metaTextElement.textContent = `AC ${assembly.acNumber} • ${assembly.partyDistrict || assembly.district}`;
  }
};

const bootstrap = async () => {
  try {
    renderAllianceResults();
    renderSecPartyResults();
    const response = await fetch("./data/assemblies.json");

    if (!response.ok) {
      throw new Error(`Failed to load data (${response.status})`);
    }

    const payload = await response.json();
    const assemblies = payload.assemblies || [];

    if (!assemblies.length) {
      throw new Error("No assemblies were found in the data file.");
    }

    metaTextElement.textContent = `${payload.totalAssemblies} assemblies loaded from local spreadsheet data.`;

    const assembliesById = new Map(
      assemblies.map((assembly) => [assembly.id, assembly])
    );

    const parties = [...new Set(
      assemblies
        .flatMap((assembly) => (assembly.electionResults || []).map((result) => result.summary.winnerParty))
        .filter(Boolean)
    )].sort();

    historyPartySelectElement.innerHTML = [
      '<option value="">Select Party</option>',
      ...parties.map((party) => `<option value="${party}">${party}</option>`)
    ].join("");

    const renderAssemblyOptions = (query = "") => {
      const normalizedQuery = query.trim().toLowerCase();
      const filteredAssemblies = normalizedQuery
        ? assemblies.filter(
            (assembly) =>
              assembly.assemblyName.toLowerCase().includes(normalizedQuery) ||
              String(assembly.acNumber).includes(normalizedQuery)
          )
        : assemblies;

      selectElement.innerHTML = filteredAssemblies
        .map(
          (assembly) =>
            `<option value="${assembly.id}">AC ${assembly.acNumber} - ${assembly.assemblyName}</option>`
        )
        .join("");

      if (!filteredAssemblies.length) {
        selectElement.innerHTML = '<option value="">No matching assembly found</option>';
        setSnapshot(null);
        tableBodyElement.innerHTML =
          '<tr><td colspan="5" class="empty-state">No caste rows found for this assembly.</td></tr>';
        electionResultsContainerElement.innerHTML = `
          <div class="table-wrap">
            <table>
              <tbody>
                <tr>
                  <td class="empty-state">No election results found for this assembly.</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        rowCountElement.textContent = "0 rows";
        electionRowCountElement.textContent = "0 years";
        return;
      }

      if (!filteredAssemblies.some((assembly) => assembly.id === selectElement.value)) {
        selectElement.value = filteredAssemblies[0].id;
      }

      renderAssembly(assembliesById.get(selectElement.value));
      renderHistoryFilter(assemblies);
    };

    const renderSelectedAssembly = () => {
      historyPartySelectElement.value = "";
      historyRuleSelectElement.value = "won_last_3";
      renderAssembly(assembliesById.get(selectElement.value));
      renderHistoryFilter(assemblies);
    };

    electionResultsContainerElement.addEventListener("click", (event) => {
      const button = event.target.closest("[data-view-more]");

      if (!button) {
        return;
      }

      const yearBlock = button.closest(".year-block");

      if (!yearBlock) {
        return;
      }

      const extraRows = yearBlock.querySelectorAll('[data-extra-row="true"]');
      const isExpanded = yearBlock.dataset.expanded === "true";

      extraRows.forEach((row) => {
        row.classList.toggle("candidate-row-hidden", isExpanded);
      });

      yearBlock.dataset.expanded = isExpanded ? "false" : "true";
      button.textContent = isExpanded ? "View More" : "View Less";
    });

    searchElement.addEventListener("input", () => {
      renderAssemblyOptions(searchElement.value);
    });
    historyPartySelectElement.addEventListener("change", () => {
      historyFilterPage = 1;
      historyShowAll = false;
      renderHistoryFilter(assemblies);
    });
    historyRuleSelectElement.addEventListener("change", () => {
      historyFilterPage = 1;
      historyShowAll = false;
      renderHistoryFilter(assemblies);
    });
    historyPaginationElement.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page-action]");

      if (!button || button.hasAttribute("disabled")) {
        return;
      }

      if (button.dataset.pageAction === "prev") {
        historyFilterPage = Math.max(1, historyFilterPage - 1);
      }

      if (button.dataset.pageAction === "next") {
        historyFilterPage += 1;
      }

      if (button.dataset.pageAction === "toggle-all") {
        historyShowAll = !historyShowAll;
        historyFilterPage = 1;
      }

      renderHistoryFilter(assemblies);
    });
    selectElement.addEventListener("change", renderSelectedAssembly);
    renderAssemblyOptions();
  } catch (error) {
    renderAllianceResults();
    renderSecPartyResults();
    setSnapshot(null);
    tableBodyElement.innerHTML = `<tr><td colspan="5" class="empty-state">${error.message}</td></tr>`;
    electionResultsContainerElement.innerHTML = `
      <div class="table-wrap">
        <table>
          <tbody>
            <tr>
              <td class="empty-state">${error.message}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    historyFilterCountElement.textContent = "0 assemblies";
    historyPaginationElement.innerHTML = "";
    historyFilterBodyElement.innerHTML = `<tr><td colspan="3" class="empty-state">${error.message}</td></tr>`;
    metaTextElement.textContent =
      "Data could not be loaded. Run the data build step again if needed.";
  }
};

bootstrap();

window.addEventListener("beforeprint", () => {
  printExpandedRows = [];

  document.querySelectorAll('[data-extra-row="true"]').forEach((row) => {
    const wasHidden = row.classList.contains("candidate-row-hidden");
    printExpandedRows.push({ row, wasHidden });
    row.classList.remove("candidate-row-hidden");
  });

  document.querySelectorAll("[data-view-more]").forEach((button) => {
    button.style.display = "none";
  });
});

window.addEventListener("afterprint", () => {
  printExpandedRows.forEach(({ row, wasHidden }) => {
    row.classList.toggle("candidate-row-hidden", wasHidden);
  });

  document.querySelectorAll("[data-view-more]").forEach((button) => {
    button.style.display = "";
  });
});

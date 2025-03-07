document.addEventListener("DOMContentLoaded", function () {
  // Load and display affiliate history
  loadAffiliateHistory();

  // Set up event listeners
  document.getElementById("clearBtn").addEventListener("click", clearHistory);
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document
    .getElementById("filterInput")
    .addEventListener("input", filterHistory);

  // Refresh data when the sidebar gains focus
  window.addEventListener("focus", loadAffiliateHistory);

  // Set up storage listener to update when new affiliates are detected
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (
      namespace === "local" &&
      (changes.affiliateHistory || changes.currentAffiliate)
    ) {
      loadAffiliateHistory();
    }
  });
});

function loadAffiliateHistory() {
  chrome.storage.local.get(["affiliateHistory", "currentAffiliate"], (data) => {
    // Update current affiliate section
    updateCurrentAffiliate(data.currentAffiliate);

    // Update history list
    const history = data.affiliateHistory || [];
    updateHistoryList(history);

    // Update stats
    updateStats(history);
  });
}

function updateCurrentAffiliate(currentAffiliate) {
  const container = document.getElementById("currentAffiliate");

  if (currentAffiliate) {
    container.className = "current-affiliate";
    container.innerHTML = `
        <h3>Current Page Affiliate</h3>
        <p><span class="label">Program:</span> ${currentAffiliate.program}</p>
        <p><span class="label">Partner ID:</span> ${currentAffiliate.partner}</p>
        <p><span class="label">Domain:</span> ${currentAffiliate.domain}</p>
      `;
  } else {
    container.className = "current-affiliate none";
    container.innerHTML = `<p>No affiliate link detected on current page.</p>`;
  }
}

function updateHistoryList(history) {
  const filterValue = document
    .getElementById("filterInput")
    .value.toLowerCase();
  const historyList = document.getElementById("historyList");

  if (history.length === 0) {
    historyList.innerHTML = `
        <div class="empty-state">
          <p>No affiliate links detected yet.</p>
          <p>Browse the web and detected links will appear here.</p>
        </div>
      `;
    return;
  }

  // Filter history items
  const filteredHistory = history.filter((item) => {
    const searchText =
      `${item.domain} ${item.program} ${item.partner} ${item.pageTitle}`.toLowerCase();
    return searchText.includes(filterValue);
  });

  if (filteredHistory.length === 0) {
    historyList.innerHTML = `
        <div class="empty-state">
          <p>No results match your filter.</p>
        </div>
      `;
    return;
  }

  // Create history items
  historyList.innerHTML = filteredHistory
    .map((item) => {
      // Get appropriate badge class
      let badgeClass = "generic";
      if (item.program.toLowerCase().includes("amazon")) {
        badgeClass = "amazon";
      } else if (item.program.toLowerCase().includes("commission")) {
        badgeClass = "commission";
      }

      // Format timestamp
      const date = new Date(item.timestamp);
      const formattedDate =
        date.toLocaleDateString() + " " + date.toLocaleTimeString();

      return `
        <div class="history-item" data-id="${item.id}">
          <h3 title="${item.pageTitle}">${item.pageTitle}</h3>
          <p>
            <span class="program-badge ${badgeClass}">${item.program}</span>
          </p>
          <p><span class="label">Partner:</span> ${item.partner}</p>
          <p><span class="label">Domain:</span> ${item.domain}</p>
          <p><a href="${item.url}" target="_blank">${truncateUrl(
        item.url
      )}</a></p>
          <p class="timestamp">${formattedDate}</p>
        </div>
      `;
    })
    .join("");
}

function updateStats(history) {
  // Update total count
  document.getElementById("totalCount").textContent = history.length;

  // Count Amazon links
  const amazonCount = history.filter((item) =>
    item.program.toLowerCase().includes("amazon")
  ).length;
  document.getElementById("amazonCount").textContent = amazonCount;

  // Find top program
  const programCounts = {};
  history.forEach((item) => {
    programCounts[item.program] = (programCounts[item.program] || 0) + 1;
  });

  let topProgram = "-";
  let topCount = 0;

  Object.entries(programCounts).forEach(([program, count]) => {
    if (count > topCount) {
      topCount = count;
      topProgram = program;
    }
  });

  document.getElementById("topProgram").textContent =
    topProgram !== "-" ? topProgram.split(" ")[0] : "-"; // Show just first word for space reasons
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all affiliate history?")) {
    chrome.storage.local.set({ affiliateHistory: [] }, () => {
      loadAffiliateHistory();
    });
  }
}

function exportData() {
  chrome.storage.local.get("affiliateHistory", (data) => {
    const history = data.affiliateHistory || [];

    // Format data for export
    const exportData = {
      exportDate: new Date().toISOString(),
      totalLinks: history.length,
      affiliateLinks: history,
    };

    // Create download link
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "affiliate-history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });
}

function filterHistory() {
  loadAffiliateHistory();
}

function truncateUrl(url) {
  const maxLength = 40;
  return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
}

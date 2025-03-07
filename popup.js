document.addEventListener("DOMContentLoaded", function () {
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0].url;
    const affiliateInfo = detectAffiliateFromUrl(currentUrl);

    const container = document.getElementById("affiliateContent");

    if (affiliateInfo) {
      container.innerHTML = `
          <div class="affiliate-info">
            <strong>Affiliate Detected</strong><br>
            Program: ${affiliateInfo.program}<br>
            Partner ID: ${affiliateInfo.partner}<br>
            Domain: ${affiliateInfo.domain}
          </div>
        `;
    } else {
      container.innerHTML = `
          <div class="no-affiliate">
            No affiliate link detected on this page.
          </div>
        `;
    }
  });

  // Settings event handlers
  document
    .getElementById("notificationsEnabled")
    .addEventListener("change", function () {
      chrome.storage.sync.set({ notificationsEnabled: this.checked });
    });

  document
    .getElementById("clearHistory")
    .addEventListener("click", function () {
      chrome.storage.sync.remove("affiliateHistory", function () {
        alert("Affiliate history cleared");
      });
    });

  // Load saved settings
  chrome.storage.sync.get("notificationsEnabled", function (data) {
    if (data.notificationsEnabled !== undefined) {
      document.getElementById("notificationsEnabled").checked =
        data.notificationsEnabled;
    }
  });
});

// Import the detection function from background.js
function detectAffiliateFromUrl(url) {
  // Common affiliate parameter patterns
  const patterns = [
    { param: "ref", name: "Generic Referral" },
    { param: "aff", name: "Generic Affiliate" },
    { param: "affiliate", name: "Generic Affiliate" },
    { param: "affid", name: "Generic Affiliate ID" },
    { param: "tag", name: "Amazon Associates" },
    { param: "cjevent", name: "Commission Junction" },
    { param: "clickid", name: "ClickBank" },
    { param: "partnerId", name: "Generic Partner" },
    { param: "utm_source", name: "UTM Tracking" },
    { param: "irclickid", name: "Impact Radius" },
  ];

  // Extract domain for display
  let domain = new URL(url).hostname;

  // Special case checks for major affiliate programs
  if (url.includes("amazon.com") && url.includes("tag=")) {
    const tagMatch = url.match(/tag=([^&]+)/);
    if (tagMatch) {
      return {
        program: "Amazon Associates",
        partner: tagMatch[1],
        domain: domain,
      };
    }
  }

  // Check for common affiliate parameters
  const urlObj = new URL(url);
  for (const pattern of patterns) {
    if (urlObj.searchParams.has(pattern.param)) {
      return {
        program: pattern.name,
        partner: urlObj.searchParams.get(pattern.param),
        domain: domain,
      };
    }
  }

  // Check for affiliate subdomains
  if (
    domain.startsWith("go.") ||
    domain.startsWith("click.") ||
    domain.startsWith("track.") ||
    domain.includes(".redirect.") ||
    domain.includes(".clicks.")
  ) {
    return {
      program: "Redirect Service",
      partner: "Unknown",
      domain: domain,
    };
  }

  return null;
}

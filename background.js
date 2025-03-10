chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ affiliateHistory: [] });
});

// Open sidebar when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Track navigation and detect affiliate links
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    // Only process main frame
    const url = details.url;
    const affiliateInfo = detectAffiliateFromUrl(url);

    if (affiliateInfo) {
      // Set badge to show affiliate detected
      chrome.action.setBadgeText({
        text: "AFF",
        tabId: details.tabId,
      });
      chrome.action.setBadgeBackgroundColor({
        color: "#4CAF50",
        tabId: details.tabId,
      });

      // Add to history with timestamp and page title
      chrome.tabs.get(details.tabId, (tab) => {
        const pageTitle = tab.title || url;

        // Add to storage with timestamp
        chrome.storage.local.get("affiliateHistory", (data) => {
          const history = data.affiliateHistory || [];

          // Create history entry with timestamp
          const entry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            url: url,
            pageTitle: pageTitle,
            program: affiliateInfo.program,
            partner: affiliateInfo.partner,
            domain: affiliateInfo.domain,
          };

          // Add to history (most recent first)
          history.unshift(entry);

          // Keep only last 100 entries
          const trimmedHistory = history.slice(0, 100);

          // Save updated history
          chrome.storage.local.set({
            affiliateHistory: trimmedHistory,
            currentAffiliate: entry,
          });
        });

        // Open sidebar automatically when affiliate is detected
        chrome.sidePanel.open({ tabId: details.tabId });

        // Notify content script to show indicator
        chrome.tabs.sendMessage(details.tabId, {
          action: "showAffiliateIndicator",
          data: affiliateInfo,
        });
      });
    } else {
      // Clear badge if no affiliate
      chrome.action.setBadgeText({
        text: "",
        tabId: details.tabId,
      });

      // Update current affiliate to null
      chrome.storage.local.set({ currentAffiliate: null });
    }
  }
});

function detectAffiliateFromUrl(url) {
  try {
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
      { param: "subid", name: "Generic Sub ID" },
      { param: "sub_id", name: "Generic Sub ID" },
      { param: "pid", name: "Generic Publisher ID" },
      { param: "sid", name: "Generic Session ID" },
      { param: "aid", name: "Affiliate ID" },
      { param: "pubid", name: "Generic Publisher ID" },
      { param: "pub", name: "Generic Publisher" },
      { param: "refid", name: "Referral ID" },
      { param: "cmp", name: "Campaign Tracking" },
      { param: "campaign", name: "Campaign Tracking" },
      { param: "gclid", name: "Google Ads Click ID" },
      { param: "fbclid", name: "Facebook Click ID" },
      { param: "msclkid", name: "Microsoft Ads Click ID" },
      { param: "ebaycampid", name: "eBay Partner Network" },
      { param: "admitad_uid", name: "Admitad Tracking" },
      { param: "awinmid", name: "Awin Merchant ID" },
      { param: "adref", name: "Ad Tracking Reference" },
      { param: "trk", name: "Tracking Parameter" },
      { param: "clickref", name: "Click Reference" },
      { param: "rdid", name: "Redirection ID" },
      { param: "refer", name: "Referral Parameter" },
      { param: "hop", name: "ClickBank Hop ID" },
      { param: "click", name: "Click Tracking" },
      { param: "afftrack", name: "Affiliate Tracking" },
      { param: "aff_source", name: "Affiliate Source" },
      { param: "aff_sub", name: "Affiliate Sub Parameter" },
      { param: "aff_sub2", name: "Affiliate Sub Parameter 2" },
      { param: "aff_sub3", name: "Affiliate Sub Parameter 3" },
      { param: "aff_sub4", name: "Affiliate Sub Parameter 4" },
      { param: "aff_sub5", name: "Affiliate Sub Parameter 5" },
    ];

    // Extract domain for display
    let domain = new URL(url).hostname;

    // Special case checks for major affiliate programs
    if (url.includes("amazon") && url.includes("tag=")) {
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

    // Check for affiliate networks by domain
    const affiliateNetworks = [
      { domain: /amazon\..*\/.*tag=/, name: "Amazon Associates" },
      { domain: /click\.linksynergy\.com/, name: "Rakuten Marketing" },
      { domain: /go\.skimresources\.com/, name: "SkimLinks" },
      { domain: /anrdoezrs\.net/, name: "Commission Junction" },
      { domain: /track\.webgains\.com/, name: "Webgains" },
      { domain: /shareasale\.com/, name: "ShareASale" },
      { domain: /prf\.hn/, name: "Pepperjam" },
      { domain: /awin1\.com/, name: "Awin" },
      { domain: /impactradius\./, name: "Impact Radius" },
      { domain: /partnerize\.com/, name: "Partnerize" },
      { domain: /cj\.com/, name: "CJ Affiliate" },
      { domain: /admitad\./, name: "Admitad" },
      { domain: /ebay\..*campid=/, name: "eBay Partner Network" },
    ];

    for (const network of affiliateNetworks) {
      if (network.domain.test(url)) {
        return {
          program: network.name,
          partner: "Unknown",
          domain: domain,
        };
      }
    }

    // Detect affiliate subdomains
    if (
      /^(go|click|track|aff|redirect|partners|refer)\./.test(domain) ||
      /\.clicks?\./.test(domain) ||
      /\.redirect\./.test(domain)
    ) {
      return {
        program: "Affiliate Redirect",
        partner: "Unknown",
        domain: domain,
      };
    }

    return null;
  } catch (error) {
    console.error("Error detecting affiliate:", error);
    return null;
  }
}

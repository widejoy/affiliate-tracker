let affiliateIndicator = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showAffiliateIndicator") {
    showAffiliateIndicator(message.data);
  }
  return true;
});

function showAffiliateIndicator(affiliateInfo) {
  // Remove any existing indicator
  if (affiliateIndicator) {
    document.body.removeChild(affiliateIndicator);
  }

  // Create a small indicator in the corner
  affiliateIndicator = document.createElement("div");

  // Style the indicator
  Object.assign(affiliateIndicator.style, {
    position: "fixed",
    top: "10px",
    right: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "5px 10px",
    borderRadius: "3px",
    zIndex: "999999",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    fontSize: "12px",
    fontFamily: "Arial, sans-serif",
    cursor: "pointer",
  });

  // Add the content
  affiliateIndicator.textContent = `Affiliate: ${affiliateInfo.program}`;

  // Add click handler to open sidebar
  affiliateIndicator.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openSidebar" });
  });

  // Add to the DOM
  document.body.appendChild(affiliateIndicator);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (affiliateIndicator && affiliateIndicator.parentNode) {
      document.body.removeChild(affiliateIndicator);
      affiliateIndicator = null;
    }
  }, 5000);
}

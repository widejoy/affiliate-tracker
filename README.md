# Affiliate Link Detector Browser Extension  

## 📌 Overview  
Affiliate Link Detector is a browser extension that helps users identify and track affiliate links when browsing the web. It automatically detects affiliate parameters in URLs, highlights detected links, and maintains a history of visited affiliate links.  

## 🚀 Features  
- **Automatic Detection**: Identifies affiliate links using common tracking parameters and known affiliate networks.  
- **Badge Indicator**: Displays a badge on the extension icon when an affiliate link is detected.  
- **History Tracking**: Saves detected affiliate links with timestamps and page titles for future reference.  
- **Sidebar View**: Opens a side panel showing the detected affiliate program details.  
- **Affiliate Indicator**: Notifies the user when an affiliate link is present on a webpage.  

## 🔧 Installation  
1. Clone the repository:  
   ```sh
   git clone https://github.com/yourusername/affiliate-link-detector.git
   cd affiliate-link-detector
2. Open Chrome Extensions (chrome://extensions/).
3. Enable Developer mode (toggle in the top-right corner).
4. Click Load unpacked and select the project folder.
5. The extension is now installed and ready to use!

## 🛠️ How It Works
1. The extension listens for navigation events and checks if the URL contains known affiliate parameters or affiliate network domains.
2. If an affiliate link is detected, the extension:
    - Updates the browser action badge (AFF in green).
    - Saves the link to local storage.
    - Opens the sidebar automatically.
    - Sends a message to the content script to show an on-page indicator.
3. If no affiliate link is found, the badge is cleared.

# 💡 Contributing
We welcome contributions! 🎉

## 🔹 How to Contribute
1. Fork the repository.
2. Create a new branch:
   git checkout -b feature/your-feature-name
3. Make your changes and commit using Conventional Commits.
4. Push the branch and create a pull request.

## ✨ Recommended Setup
We recommend using the Conventional Commits VS Code extension for standardized commit messages.

## 📜 License
This project is open-source and available under the MIT License.

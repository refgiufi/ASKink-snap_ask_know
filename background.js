// ASKink Extension - Background Script

// Background script for ASKink Extension
// Handles permissions and assists with screenshot capture

chrome.runtime.onInstalled.addListener(() => {
    console.log('ASKink extension installed');
});

// Handle any additional background tasks if needed
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup, but we can add additional logic here if needed
    console.log('Extension icon clicked on tab:', tab.url);
});

// Listen for messages from popup (if needed for future features)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'captureTab') {
        // Alternative method to capture tab if needed
        chrome.tabs.captureVisibleTab(message.windowId, {
            format: 'png',
            quality: 90
        }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                const base64Data = dataUrl.split(',')[1];
                sendResponse({ screenshot: base64Data });
            }
        });
        return true; // Keep the message channel open for async response
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('ASKink extension started');
});
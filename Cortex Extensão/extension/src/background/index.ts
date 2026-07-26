console.log('Cortex Background Service Worker Initialized');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Cortex Extension Installed');
  
  // Configura o comportamento do Side Panel
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

// Garante que o Side Panel abra ao clicar no ícone
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

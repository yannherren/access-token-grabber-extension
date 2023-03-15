
let authorizationToken: string | undefined = '';

chrome.webRequest.onSendHeaders.addListener(
    async (req) => {
      if (req.requestHeaders) {
        authorizationToken = req.requestHeaders.find(it => it.name === 'authorization')?.value;
        if (!authorizationToken) {
            return;
        }
        await chrome.action.setBadgeText({ text: '1'});
        await chrome.storage.local.set({ latestAuthToken: authorizationToken })
      }
    },
    {urls: [ "<all_urls>" ]},
    ['requestHeaders']
)
import {jwtDecode} from "jwt-decode";

let authorizationToken: string | undefined = '';

chrome.webRequest.onSendHeaders.addListener(
    async (req) => {
        const onData = await chrome.storage.local.get('on')
        const headerNameData = await chrome.storage.local.get('headerName')
        if (onData['on']) {
            if (req.requestHeaders) {
                const headerName =  (headerNameData['headerName'] ? headerNameData['headerName'] : 'authorization');
                authorizationToken = req.requestHeaders.find(it => it.name === headerName)?.value;
                if (!authorizationToken) {
                    return;
                }
                const token = jwtDecode(authorizationToken);
                const expirationDate = token.exp ? token.exp * 1000 : 0;
                const url = req.url;
                await chrome.action.setBadgeText({text: '1'});
                await chrome.storage.local.set({latestAuthToken: authorizationToken, url, expirationDate})
            }
        } else {
            await chrome.storage.local.set({latestAuthToken: ''})
        }
    },
    {urls: ["<all_urls>"]},
    ['requestHeaders']
)

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        chrome.tabs.create({ url: "install.html" });
        chrome.storage.local.set({ on: true });
    }
    if (details.reason === "update") {
        const currentVersion = chrome.runtime.getManifest().version;

        chrome.storage.local.get("lastVersion", (data) => {
            const lastVersion = data.lastVersion;

            if (lastVersion !== currentVersion) {
                chrome.tabs.create({ url: "update.html" });
                chrome.storage.local.set({ lastVersion: currentVersion });
            }
        });
    }
});

chrome.runtime.setUninstallURL("https://herrenio.formaloo.co/mhnrbp");

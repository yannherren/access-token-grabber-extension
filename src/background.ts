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
                await chrome.action.setBadgeText({text: '1'});
                await chrome.storage.local.set({latestAuthToken: authorizationToken})
            }
        } else {
            await chrome.storage.local.set({latestAuthToken: ''})
        }
    },
    {urls: ["<all_urls>"]},
    ['requestHeaders']
)
// disclaimer: with help from claude

const mockStorage: Record<string, any> = {};

const chromeStorageLocal = {
    get: jest.fn((keys: string | string[] | null, callback?: (items: Record<string, any>) => void) => {
        let result: Record<string, any> = {};

        if (typeof keys === 'string') {
            result = { [keys]: mockStorage[keys] };
        } else if (Array.isArray(keys)) {
            keys.forEach(key => {
                result[key] = mockStorage[key];
            });
        } else {
            result = { ...mockStorage };
        }

        if (callback) {
            setTimeout(() => {
                callback(result);
            }, 0);
            return undefined;
        }

        return Promise.resolve(result);
    }),

    set: jest.fn((items: Record<string, any>, callback?: () => void) => {
        Object.assign(mockStorage, items);

        if (callback) {
            setTimeout(() => {
                callback();
            }, 0);
            return undefined;
        }

        return Promise.resolve();
    }),

    clear: jest.fn((callback?: () => void) => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

        if (callback) {
            setTimeout(() => {
                callback();
            }, 0);
            return undefined;
        }

        return Promise.resolve();
    })
};

const chromeAction = {
    setBadgeText: jest.fn(() => Promise.resolve())
};

type WebRequestCallback = (details: chrome.webRequest.WebRequestHeadersDetails) => void;
let webRequestListeners: WebRequestCallback[] = [];

const chromeWebRequest = {
    onSendHeaders: {
        addListener: jest.fn((callback: WebRequestCallback) => {
            webRequestListeners.push(callback);
        }),
        removeListener: jest.fn((callback: WebRequestCallback) => {
            webRequestListeners = webRequestListeners.filter(cb => cb !== callback);
        })
    }
};

type InstalledCallback = (details: chrome.runtime.InstalledDetails) => void;
let installedListeners: InstalledCallback[] = [];

const chromeRuntime = {
    onInstalled: {
        addListener: jest.fn((callback: InstalledCallback) => {
            installedListeners.push(callback);
        })
    },
    setUninstallURL: jest.fn(),
    getManifest: jest.fn(() => ({ version: '1.0.0' }))
};

const chromeTabs = {
    create: jest.fn(() => Promise.resolve())
};

(global as any).chrome = {
    storage: {
        local: chromeStorageLocal
    },
    action: chromeAction,
    webRequest: chromeWebRequest,
    runtime: chromeRuntime,
    tabs: chromeTabs
};

export const mockHelpers = {
    setStorageValue: (key: string, value: any) => {
        mockStorage[key] = value;
    },
    getStorageValue: (key: string) => mockStorage[key],
    clearStorage: () => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    },
    triggerWebRequest: (details: Partial<chrome.webRequest.WebRequestHeadersDetails>) => {
        type DocumentLifecycle = "prerender" | "active" | "cached" | "pending_deletion";
        type FrameType = "outermost_frame" | "fenced_frame" | "sub_frame";

        const fullDetails: chrome.webRequest.WebRequestHeadersDetails = {
            requestId: '1',
            url: 'https://example.com',
            method: 'GET',
            frameId: 0,
            parentFrameId: -1,
            tabId: 1,
            type: 'xmlhttprequest' as chrome.webRequest.ResourceType,
            timeStamp: Date.now(),
            initiator: 'https://example.com',
            documentId: 'doc1',
            documentLifecycle: 'active' as DocumentLifecycle,
            frameType: 'outermost_frame' as FrameType,
            ...details
        };
        webRequestListeners.forEach(listener => listener(fullDetails));
    },
    triggerInstalled: (reason: 'install' | 'update') => {
        installedListeners.forEach(listener =>
            listener({ reason } as chrome.runtime.InstalledDetails)
        );
    },
    resetAllMocks: () => {
        jest.clearAllMocks();
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
        webRequestListeners = [];
        installedListeners = [];
    }
};

beforeEach(() => {
    mockHelpers.resetAllMocks();
});
// disclaimer: with help from claude

// @ts-ignore
import { mockHelpers } from './setup';
const jwt = require('jsonwebtoken');

describe('Chrome Extension Background Script', () => {

    let token = ''
    let expiresAt = 0

    beforeEach(() => {
        expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
        token = 'Bearer ' + jwt.sign({ exp: expiresAt, claims: 'user' }, 'secret')
        jest.resetModules();
        mockHelpers.resetAllMocks();
    });

    describe('Positive tests - webRequest handler', () => {

        test('should save authorization token if extension is active', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: token,
                url: "https://example.com",
                expirationDate: expiresAt
            });
            expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
        });

        test('should use custom header name if configured', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('headerName', 'x-custom-auth');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: jwt.sign({}, 'ignored') },
                    { name: 'x-custom-auth', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: token,
                url: "https://example.com",
                expirationDate: expiresAt
            });
        });

        test('should use default header "authorization" if no custom header is defined', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('headerName', '');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: token,
                url: "https://example.com",
                expirationDate: expiresAt
            });
        });

        test('should refresh token on multiple requests', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: jwt.sign({}, 'ignored') }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(chrome.storage.local.set).toHaveBeenLastCalledWith({
                latestAuthToken: token,
                url: "https://example.com",
                expirationDate: expiresAt
            });
        });
    });

    describe('Negative tests - webRequest handler', () => {

        test('should not save token if extension is deactivated', async () => {
            mockHelpers.setStorageValue('on', false);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: jwt.sign({}, 'ignored') }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: ''
            });
            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
        });

        test('should do nothing if no request headers are available', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: undefined
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
        });

        test('should do nothing if authorization header is missing', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'content-type', value: 'application/json' },
                    { name: 'accept', value: '*/*' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
            expect(chrome.storage.local.set).not.toHaveBeenCalledWith(
                expect.objectContaining({ latestAuthToken: expect.any(String) })
            );
        });

        test('should do nothing if authorization header is empty', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: '' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
        });

        test('should do nothing if authorization header is undefined', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
        });

        test('should leave token empty if extension is deactivated', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            mockHelpers.setStorageValue('on', false);
            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(chrome.storage.local.set).toHaveBeenLastCalledWith({
                latestAuthToken: ''
            });
        });
    });

    describe('Positive tests - onInstalled Handler', () => {

        test('should open install.html if newly installed', async () => {
            require('../src/background');

            mockHelpers.triggerInstalled('install');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'install.html' });
            expect(chrome.storage.local.set).toHaveBeenCalledWith({ on: true });
        });

        test('should activate extension automatically if newly installed', async () => {
            require('../src/background');

            mockHelpers.triggerInstalled('install');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({ on: true });
        });

        test('should open update.html on version change', async () => {
            mockHelpers.setStorageValue('lastVersion', '0.9.0');
            (chrome.runtime.getManifest as jest.Mock).mockReturnValue({ version: '1.0.0' });
            require('../src/background');

            mockHelpers.triggerInstalled('update');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.tabs.create).toHaveBeenCalledWith({ url: 'update.html' });
            expect(chrome.storage.local.set).toHaveBeenCalledWith({ lastVersion: '1.0.0' });
        });

        test('should set uninstall url', () => {
            require('../src/background');

            expect(chrome.runtime.setUninstallURL).toHaveBeenCalledWith(
                'https://herrenio.formaloo.co/mhnrbp'
            );
        });
    });

    describe('Negative tests - onInstalled handler', () => {

        test('should not open update.html if version is the same', async () => {
            mockHelpers.setStorageValue('lastVersion', '1.0.0');
            (chrome.runtime.getManifest as jest.Mock).mockReturnValue({ version: '1.0.0' });
            require('../src/background');

            mockHelpers.triggerInstalled('update');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.tabs.create).not.toHaveBeenCalledWith({ url: 'update.html' });
        });

        test('should not open install.html on update', async () => {
            mockHelpers.setStorageValue('lastVersion', '0.9.0');
            (chrome.runtime.getManifest as jest.Mock).mockReturnValue({ version: '1.0.0' });
            require('../src/background');

            mockHelpers.triggerInstalled('update');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.tabs.create).not.toHaveBeenCalledWith({ url: 'install.html' });
        });

        test('should not set on, on update', async () => {
            mockHelpers.setStorageValue('lastVersion', '0.9.0');
            require('../src/background');

            mockHelpers.triggerInstalled('update');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).not.toHaveBeenCalledWith({ on: true });
        });
    });

    describe('Edge Cases', () => {

        test('should be able to cope with emtpy requestHeaders array', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: []
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
        });

        test('should match case sensitive names', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'Authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).not.toHaveBeenCalledWith({
                latestAuthToken: 'Bearer uppercase-token'
            });
        });

        test('should be able to cope with undefined storage values', async () => {
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
        });

        test('should be able to cope with null header name and use the default one', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('headerName', null);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: token,
                url: "https://example.com",
                expirationDate: expiresAt
            });
        });
    });

    describe('Positive/Negative tests - urlFilter', () => {

        test('should save token if url matches urlFilter regex', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('urlFilter', '^https://example\\.com.*');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                url: 'https://example.com/api/data',
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: token,
                url: 'https://example.com/api/data',
                expirationDate: expiresAt
            });
            expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
        });

        test('should not save token if url does not match urlFilter regex', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('urlFilter', '^https://only-this-domain\\.com.*');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                url: 'https://example.com/api/data',
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
            expect(chrome.storage.local.set).not.toHaveBeenCalledWith(
                expect.objectContaining({ latestAuthToken: expect.any(String) })
            );
        });

        test('should save token regardless of url if urlFilter is empty', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('urlFilter', '');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                url: 'https://any-random-domain.io/xyz',
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: token,
                url: 'https://any-random-domain.io/xyz',
                expirationDate: expiresAt
            });
            expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
        });

        test('should not save token and not throw if urlFilter is an invalid regex', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('urlFilter', '(unclosed[');
            require('../src/background');

            expect(() => {
                mockHelpers.triggerWebRequest({
                    url: 'https://example.com/api/data',
                    requestHeaders: [
                        { name: 'authorization', value: token }
                    ]
                });
            }).not.toThrow();

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
        });

        test('should support wildcard/subdomain matching via urlFilter regex', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('urlFilter', '^https://.*\\.example\\.com/.*');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                url: 'https://api.example.com/v1/users',
                requestHeaders: [
                    { name: 'authorization', value: token }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: token,
                url: 'https://api.example.com/v1/users',
                expirationDate: expiresAt
            });
            expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
        });
    });
});
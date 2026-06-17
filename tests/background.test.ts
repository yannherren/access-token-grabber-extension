// @ts-ignore
import { mockHelpers } from './setup';


describe('Chrome Extension Background Script', () => {

    beforeEach(() => {
        mockHelpers.resetAllMocks();
        jest.resetModules();
    });

    describe('Positive tests - webRequest handler', () => {

        test('should save authorization token if extension is active', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: 'Bearer test-token-123' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: 'Bearer test-token-123'
            });
            expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
        });

        test('should use custom header name if configured', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('headerName', 'x-custom-auth');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: 'should-be-ignored' },
                    { name: 'x-custom-auth', value: 'custom-token-456' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: 'custom-token-456'
            });
        });

        test('should use default header "authorization" if no custom header is defined', async () => {
            mockHelpers.setStorageValue('on', true);
            mockHelpers.setStorageValue('headerName', '');
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: 'default-auth-token' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: 'default-auth-token'
            });
        });

        test('should refresh token on multiple requests', async () => {
            mockHelpers.setStorageValue('on', true);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: 'token-1' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: 'token-2' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            expect(chrome.storage.local.set).toHaveBeenLastCalledWith({
                latestAuthToken: 'token-2'
            });
        });
    });

    describe('Negative tests - webRequest handler', () => {

        test('should not save token if extension is deactivated', async () => {
            mockHelpers.setStorageValue('on', false);
            require('../src/background');

            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: 'Bearer should-not-save' }
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
                    { name: 'authorization', value: 'Bearer active-token' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 50));

            mockHelpers.setStorageValue('on', false);
            mockHelpers.triggerWebRequest({
                requestHeaders: [
                    { name: 'authorization', value: 'Bearer should-clear' }
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
                    { name: 'Authorization', value: 'Bearer uppercase-token' }
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
                    { name: 'authorization', value: 'Bearer token' }
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
                    { name: 'authorization', value: 'Bearer null-header-test' }
                ]
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(chrome.storage.local.set).toHaveBeenCalledWith({
                latestAuthToken: 'Bearer null-header-test'
            });
        });
    });
});
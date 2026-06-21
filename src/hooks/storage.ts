import {useState} from "react";

export type Storage = RuntimeStorage & OptionsStorage;

export interface RuntimeStorage {
    latestAuthToken?: string
    url?: string;
}

export interface OptionsStorage {
    headerName?: string;
    bearerRemoval?: boolean;
    on?: boolean;
}

type UseStorageHook = [
        Storage | undefined,
    (storage: RuntimeStorage) => Promise<void>,
    (options: OptionsStorage) => Promise<void>,
    () => Promise<void>
];

export function useStorage(): UseStorageHook {
    const [storage, setStorage] = useState<Storage>()

    async function loadStorage() {
        const loadedStorage = await getItems()
        setStorage(loadedStorage);
    }

    async function updateRuntimeStorage(storage: RuntimeStorage) {
        await _optimisticUpdate(storage);
    }

    async function updateOptions(options: OptionsStorage) {
        await _optimisticUpdate(options);
    }

    async function _optimisticUpdate(items: OptionsStorage | RuntimeStorage) {
        setStorage(prevState => ({ ...prevState, ...items }))
        await setItems(items)
    }

    return [storage, updateRuntimeStorage, updateOptions, loadStorage]
}

async function getItems(): Promise<Storage> {
    return chrome.storage.local.get();
}

async function setItems(values: any): Promise<void> {
    return chrome.storage.local.set(values)
}
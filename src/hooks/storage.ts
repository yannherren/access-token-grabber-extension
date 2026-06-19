import {useState} from "react";

export interface Storage {
    latestAuthToken: string
    url: string;
    options: OptionsStorage;
}

export interface OptionsStorage {
    headerName: string;
    bearerRemoval: string;
}

export function useStorage() {
    const [storage, setStorage] = useState<Storage>()

    async function loadStorage() {
        // load storage
    }

    function updateStorage(storage: Storage) {
        // update storage
    }

    function updateOptions(options: OptionsStorage) {
        // update options
    }

    return [storage, updateStorage, updateOptions, loadStorage]
}

async function getItem(key: string) {
    return chrome.storage.local.get().then(it => it[key])
}
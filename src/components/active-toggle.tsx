import React, {useEffect, useState} from "react";

interface Props {
    onToggle: (listening: boolean) => void
}

export const ActiveToggle = ({onToggle}: Props) => {

    const [listening, setListening] = useState<null | boolean>(null);

    useEffect(() => {
        chrome.storage.local.get('on').then(val => {
            toggleListening(val['on'])
        })
    }, []);

    useEffect(() => {
        if (listening === null) {
            return
        }

        if (listening) {
            chrome.action.setIcon({path: '/on.png'})
            chrome.storage.local.set({on: true})
        } else {
            chrome.action.setIcon({path: '/off.png'});
            chrome.action.setBadgeText({text: ''});
            chrome.storage.local.set({latestAuthToken: ''})
            chrome.storage.local.set({on: false})
        }
    }, [listening])

    const toggleListening = (listening: boolean) => {
        setListening(listening);
        onToggle(listening);
    }

    return <>
        {listening ?
            <button className={"toggle-button"} onClick={() => toggleListening(false)}>
                <img src="on-button.png" alt="on"/>
            </button> :

            <button className={"toggle-button"} onClick={() => toggleListening(true)}>
                <img src="off-button.png" alt="on"/>
            </button>
        }
    </>
}
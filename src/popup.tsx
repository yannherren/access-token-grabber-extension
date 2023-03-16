import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import styles from "./popup.module.css"
import {clipboard} from "@extend-chrome/clipboard";

const Popup = () => {

    const [tokenCopied, setTokenCopied] = useState(false);
    const [headerName, setHeaderName] = useState('authorization');
    const [listening, setListening] = useState<null | boolean>(null);

    useEffect(() => {
        setTimeout(() => {
            chrome.storage.local.set({headerName})
        }, 200)
    }, [headerName])

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

    useEffect(() => {
        chrome.storage.local.get('headerName').then(val => {
            setHeaderName(val['headerName'])
        })
        chrome.storage.local.get('on').then(val => {
            setListening(val['on'])
        })
        chrome.storage.local.get('latestAuthToken').then(async (entries) => {
            if (entries.latestAuthToken) {
                const token = entries.latestAuthToken
                await clipboard.writeText(token);
                await chrome.storage.local.set({latestAuthToken: undefined})
                setTokenCopied(true)
            } else {
                setTokenCopied(false);
            }
        })
    }, []);


    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Access Token Grabber</h1>
            <div>
                <span>Listening for tokens:</span>
                <br/><br/>
                {listening ?
                    <button className={styles.on} onClick={() => setListening(false)}>ON</button>
                    : <button className={styles.off} onClick={() => setListening(true)}>OFF</button>
                }
            </div>
            <div className={styles.section}>
                <span>Look for header named:</span>
                <br/><br/>
                <input className={styles.input} value={headerName} onChange={(e) => setHeaderName(e.target.value)}/>
            </div>
            <div className={styles.message}>
                {tokenCopied ?
                    <div className={styles.success}>
                        <span className={styles.thumb}>👍</span>
                        <br/>
                        <span>Copied the latest token to your clipboard, use it wisely!</span>
                    </div>
                    :
                    listening ?
                        <span>Seems like there is no token available yet! Try to make a web request to receive a token.</span>
                        : ''
                }
            </div>
        </div>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>,
    document.getElementById("root")
);

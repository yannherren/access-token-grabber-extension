import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import styles from "./popup.module.css"
import {clipboard} from "@extend-chrome/clipboard";

const Popup = () => {
    const [tokenCopied, setTokenCopied] = useState(false);
    const [headerName, setHeaderName] = useState('Authorization');
    const [listening, setListening] = useState<null | boolean>(null);
    const [bearerRemoval, setBearerRemoval] = useState<null | boolean>(null);

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
        if (bearerRemoval === null) {
            return
        }
        if (bearerRemoval) {
            chrome.storage.local.set({bearerRemoval: true})
        } else {
            chrome.storage.local.set({bearerRemoval: false})
        }
    }, [bearerRemoval]);

    useEffect(() => {
        chrome.storage.local.get('headerName').then(val => {
            setHeaderName(val['headerName'])
        })
        chrome.storage.local.get('on').then(val => {
            setListening(val['on'])
        })
        chrome.storage.local.get('bearerRemoval').then(val => {
            const removeBearer = val['bearerRemoval'];
            setBearerRemoval(removeBearer)

            chrome.storage.local.get('latestAuthToken').then(async (entries) => {
                if (entries.latestAuthToken) {
                    let token: string = entries.latestAuthToken;
                    if (removeBearer) {
                        token = token.replace("Bearer ", "").replace("bearer ", "");
                    }

                    await clipboard.writeText(token);
                    await chrome.storage.local.set({latestAuthToken: undefined})
                    setTokenCopied(true)
                } else {
                    setTokenCopied(false);
                }
            })
        })
    }, []);


    return (
        <div className={styles.container}>
            <div className={styles.bar}>
                <img src="logo-full.png" alt="logo"/>

                {listening ?
                    <button className={styles["toggle-button"]} onClick={() => setListening(false)}>
                        <img src="on-button.png" alt="on"/>
                    </button> :

                    <button className={styles["toggle-button"]} onClick={() => setListening(true)}>
                        <img src="off-button.png" alt="on"/>
                    </button>
                }
            </div>

            <div className={styles.content}>
                <div className={styles["option"]}>
                    <div className={styles.label}>
                        <img src="key.png" alt="key"/>
                        <span>Header name (e.g. Authorization)</span>
                    </div>
                    <input className={styles.input} value={headerName} onChange={(e) => setHeaderName(e.target.value)}/>
                </div>
                <div className={styles["option"] + " " + styles["inline-option"]}>
                    <div className={styles.label + " " + styles.bearer}>
                        <img src="remove.png" alt="key"/>
                        <span>Remove "Bearer" prefix</span>
                    </div>
                    {bearerRemoval ?
                        <button className={styles["toggle-button"]} onClick={() => setBearerRemoval(false)}>
                            <img src="on-button.png" alt="on"/>
                        </button> :

                        <button className={styles["toggle-button"]} onClick={() => setBearerRemoval(true)}>
                            <img src="off-button.png" alt="on"/>
                        </button>
                    }
                </div>
                <div className={styles.message}>
                    {tokenCopied ?
                        <div className={styles.success}>
                            <img src="done.png" alt="done"/>
                            <span>The most recent token has been copied to your clipboard. Handle it with care.</span>
                        </div>
                        :
                        listening ?
                            <span className={styles.waiting}>Seems like there is no token available yet! Try to make a web request to receive a token. 🤔</span>
                            : <span className={styles.waiting}>Token detection is turned off. 😴</span>
                    }
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>
);

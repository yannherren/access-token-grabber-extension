import styles from "../styles/options.module.css";
import React, {useEffect, useState} from "react";
import {clipboard} from "@extend-chrome/clipboard";

interface Props {
    tokenCopied: (copied: boolean) => void
}

export const Options = ({tokenCopied}: Props) => {
    const [headerName, setHeaderName] = useState('Authorization');
    const [bearerRemoval, setBearerRemoval] = useState<null | boolean>(null);


    useEffect(() => {
        setTimeout(() => {
            chrome.storage.local.set({headerName})
        }, 200)
    }, [headerName])


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
                    tokenCopied(true)
                } else {
                    tokenCopied(false);
                }
            })
        })
    }, []);


    return <>
        <div className={styles["option"]}>
            <div className={styles.label}>
                <img src="key.png" alt="key"/>
                <span>Header name (e.g. Authorization)</span>
            </div>
            <input className={"input"} value={headerName} onChange={(e) => setHeaderName(e.target.value)}/>
        </div>
        <div className={styles["option"] + " " + styles["inline-option"]}>
            <div className={styles.label + " " + styles.bearer}>
                <img src="remove.png" alt="key"/>
                <span>Remove "Bearer" prefix</span>
            </div>
            {bearerRemoval ?
                <button className={"toggle-button"} onClick={() => setBearerRemoval(false)}>
                    <img src="on-button.png" alt="on"/>
                </button> :

                <button className={"toggle-button"} onClick={() => setBearerRemoval(true)}>
                    <img src="off-button.png" alt="on"/>
                </button>
            }
        </div>
    </>
}
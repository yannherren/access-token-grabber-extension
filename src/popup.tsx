import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import styles from "./popup.module.css"
import {clipboard} from "@extend-chrome/clipboard";

const Popup = () => {
    const [tokenCopied, setTokenCopied] = useState(false);

    useEffect(() => {
        chrome.storage.local.get('latestAuthToken').then(async (entries) => {
            if (entries.latestAuthToken) {
                const token = entries.latestAuthToken
                await clipboard.writeText(token);
                await chrome.storage.local.set({ latestAuthToken: undefined })
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
                <span>Look for header named:</span>
                <br /><br />
                <input value="authorization"/>
            </div>
            <div className={styles.message}>
                {tokenCopied ?
                    <span>✅ Copied the latest token to your clipboard, use it wisely! 😃</span>
                    :
                    <span>Seems like there is no token available yet! Try to make a web request to receive a token.</span>
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

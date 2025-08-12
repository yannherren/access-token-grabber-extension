import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import styles from "./styles/popup.module.css"
import {ActiveToggle} from "./components/active-toggle";
import {Options} from "./components/options";
import './global.css'
import {Inspect} from "./components/inspect";

const Popup = () => {
    const [listening, setListening] = useState<null | boolean>(null);
    const [tokenCopied, setTokenCopied] = useState(false);

    return (
        <div className={styles.container}>
            <div className={styles.bar}>
                <img src="logo-full.png" alt="logo"/>
                <ActiveToggle onToggle={(currentlyListening) => setListening(currentlyListening)}></ActiveToggle>
            </div>

            <div className={styles.content}>
                <Options tokenCopied={(copied) => setTokenCopied(copied)}></Options>
                <div className={styles.message}>
                    {tokenCopied ?
                        <>
                            <div className={styles.success}>
                                <img src="done.png" alt="done"/>
                                <span>The most recent token has been copied to your clipboard. Handle it with care.</span>
                            </div>
                            <Inspect></Inspect>
                        </>
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

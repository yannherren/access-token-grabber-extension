import styles from "../styles/options.module.css";
import React from "react";
import {OptionsStorage, Storage} from "../hooks/storage";
import {ActiveToggle} from "./active-toggle";


interface Props {
    storage: Storage
    updateOptions: (values: OptionsStorage) => void
}

export const Options = ({storage, updateOptions}: Props) => {
    return <div className={styles.options}>
        <div className={styles["option"]}>
            <div className={styles.label}>
                <img src="key.png" alt="key"/>
                <span>Header name (e.g. Authorization)</span>
            </div>
            <input className={"input"} value={storage.headerName}
                   onChange={(e) => updateOptions({headerName: e.target.value})}/>
        </div>
        <div className={styles["option"]}>
            <div className={styles.label}>
                <img src="url.png" alt="key"/>
                <span>URL filter (Regex)</span>
            </div>
            <input className={"input"} value={storage.urlFilter}
                   onChange={(e) => updateOptions({urlFilter: e.target.value})}/>
        </div>
        <div className={styles["option"] + " " + styles["inline-option"] + " " + styles['toggle-option']}>
            <div className={styles.label + " " + styles.bearer}>
                <img src="remove.png" alt="key"/>
                <span>Remove "Bearer" prefix</span>
            </div>
            <ActiveToggle value={storage.bearerRemoval ?? false}
                          onToggle={value => updateOptions({bearerRemoval: value})}/>
        </div>

        <div className={styles["option"] + " " + styles["inline-option"] + " " + styles.tutorial}>
            <div className={styles.label + " " + styles.bearer}>
                <img src="question.png" alt="key"/>
                <a
                    href={chrome.runtime.getURL('install.html')}
                    target="_blank"
                    rel="noopener noreferrer"
                >Show me how Access Token Grabber works</a>
            </div>
        </div>
    </div>
}
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
                <span>Header name (e.g. Authorization)</span> Storage
            </div>
            <input className={"input"} value={storage.headerName}
                   onChange={(e) => updateOptions({headerName: e.target.value})}/>
        </div>
        <div className={styles["option"] + " " + styles["inline-option"]}>
            <div className={styles.label + " " + styles.bearer}>
                <img src="remove.png" alt="key"/>
                <span>Remove "Bearer" prefix</span>
            </div>
            <ActiveToggle value={storage.bearerRemoval ?? false}
                          onToggle={value => updateOptions({bearerRemoval: value})}/>
        </div>
    </div>
}
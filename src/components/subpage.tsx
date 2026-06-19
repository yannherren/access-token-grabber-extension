import styles from "../styles/subpage.module.css";
import React from "react"

interface Props {
    children: any
    back: () => void
}

export const Subpage = ({ children, back }: Props) => {

    return <div className={styles.page}>
        <div className={styles.bar}>
            <button className={"back-button"} onClick={() => back()}>
                <img src="back.png" alt="on"/>
            </button>
            <span className={styles["bar-title"]}>Options</span>
        </div>
        <div className={styles.content}>
            {children}
        </div>
    </div>
}
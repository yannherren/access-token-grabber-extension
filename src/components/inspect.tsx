import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import styles from '../styles/inspect.module.css'


export const Inspect = () => {

    const [open, setOpen] = useState(false);
    const [rawTokenDetails, setRawTokenDetails] = useState('');
    const [tokenDetails, setTokenDetails] = useState({});
    const [faultyToken, setFaultyToken] = useState(false);

    useEffect(() => {
        chrome.storage.local.get('latestAuthToken').then(async (entries) => {
            if (entries.latestAuthToken) {
                let token: string = entries.latestAuthToken;
                let tokenDetails = ''
                try {
                    tokenDetails = jwtDecode(token);
                } catch (e) {
                    setFaultyToken(true)
                    return
                }
                setTokenDetails(tokenDetails)
                setRawTokenDetails(JSON.stringify(tokenDetails))
            }
        });
    }, []);

    const copyValue = (value: string) => {
        let transformedValue = value.startsWith('"') ? value.substring(1) : value;
        transformedValue = transformedValue.endsWith('"') ? transformedValue.substring(0, value.length - 2) : transformedValue;
        navigator.clipboard.writeText(transformedValue);
    }

    return !faultyToken ? <>
        <details className={styles.details}>
            <summary>Inspect JWT token</summary>
            <div className={styles.properties}>
                {
                    Object.entries(tokenDetails).map(([key, value]) => {
                        const rawValue = JSON.stringify(value)
                        return <>
                                <div data-content={key}>{key}</div>
                                <div data-content={rawValue} className={/^(true|false)$/.test(rawValue) ? styles.bool : ''} onClick={() => copyValue(rawValue)}>
                                    {rawValue}
                                    <span className={styles.copy}>
                                        <img src="copy.png" height={12}/>
                                    </span>
                                </div>
                            </>
                        }
                    )
                }
            </div>
        </details>
    </> : ''
}
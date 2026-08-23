import React, {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import styles from '../styles/inspect.module.css'
import {RuntimeStorage} from "../hooks/storage";

const BASE_CURL_REQUEST = 'curl -X GET "REQ_URL" \\\n' +
    '  -H "Authorization: Bearer BEARER_TOKEN"'

interface Props {
    storage: RuntimeStorage
}

export const Inspect = ({storage}: Props) => {

    const [tokenDetails, setTokenDetails] = useState({});
    const [faultyToken, setFaultyToken] = useState(false);
    const [copiedCurl, setCopiedCurl] = useState(false);

    useEffect(() => {
        if (storage.latestAuthToken) {
            let tokenDetails = ''
            try {
                tokenDetails = jwtDecode(storage.latestAuthToken);
                console.log(tokenDetails)
            } catch (e) {
                setFaultyToken(true)
                return
            }
            setTokenDetails(tokenDetails)
        }
    }, [storage]);

    const buildCurlRequest = (bearer: string, url: string) => {
        const token = bearer.replace("Bearer ", "")
        return BASE_CURL_REQUEST
            .replace("REQ_URL", url)
            .replace("BEARER_TOKEN", token);
    }

    const copyCurl = () => {
        if (!storage.latestAuthToken || !storage.url) return;
        const request = buildCurlRequest(storage.latestAuthToken, storage.url);
        navigator.clipboard.writeText(request);
        setCopiedCurl(true);

    }

    const copyValue = (value: string) => {
        let transformedValue = value.startsWith('"') ? value.substring(1) : value;
        transformedValue = transformedValue.endsWith('"') ? transformedValue.substring(0, value.length - 2) : transformedValue;
        navigator.clipboard.writeText(transformedValue);
    }

    return !faultyToken ? <>

        <div className={styles.subtitle}>Decoded token properties</div>

        <div className={styles.properties}>
            {
                Object.entries(tokenDetails).map(([key, value]) => {
                        const rawValue = JSON.stringify(value)
                        return <>
                            <div data-content={key}>{key}</div>
                            <div data-content={rawValue} className={/^(true|false)$/.test(rawValue) ? styles.bool : ''}
                                 onClick={() => copyValue(rawValue)}>
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
        <div className={styles.token}>
            <details>
                <summary className={styles.subtitle}>Show raw token</summary>
                <div className={styles['token-content']}>
                    {storage.latestAuthToken}
                </div>
            </details>
        </div>
        <div className={styles.interaction}>
            <button className="secondary-button" onClick={copyCurl}>
                <img src={copiedCurl ? 'done.png' : 'copy.png'} height={14}/>
                Copy authenticated cURL request</button>
            <a className="secondary-button" href="https://www.jwt.io/" target="_blank">
                <img src="external.png" height={12}/>
                Open JWT.io Debugger
            </a>
        </div>
    </> : ''
}
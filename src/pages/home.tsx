import React, {useEffect, useState} from "react";
import {ActiveToggle} from "../components/active-toggle";
import styles from '../styles/home.module.css'
import {Storage} from "../hooks/storage";
import {Route} from "../routes";


interface Props {
    storage: Storage
    navigate: (route: Route) => void
    setOn: (on: boolean) => void
}

export const Home = ({storage, navigate, setOn}: Props) => {

    const [validDuration, setValidDuration] = useState('');
    const [valid, setValid] = useState(true);

    const isValid = () => {
        const current_time = new Date()
        const expDate = storage.expirationDate ?? 0;
        const difference = expDate - current_time.getTime()
        return difference > 0;
    }

    const getValidDuration = () => {
        const current_time = new Date()
        const expDate = storage.expirationDate ?? 0;
        const difference = expDate - current_time.getTime()
        const secondsDiff = difference / 1000;
        const seconds = Math.floor(secondsDiff % 60)
        const minutes = Math.floor(secondsDiff / 60)
        return String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0')
    }

    const refreshValidDuration = () => {
        if (storage.expirationDate) {
            setValidDuration(getValidDuration())
            setValid(isValid())
        }
    }

    useEffect(() => {
        refreshValidDuration()
        setInterval(() => refreshValidDuration(), 1000)
    }, []);


    return (
        <>
            <div className={styles.bar}>
                <img className={styles.logo} src="logo-full.png" alt="logo"/>
                <div className={styles.options}>
                    {/*<div className={styles.expiration}>*/}
                    {/*    <img src="clock.png" height={12}/>*/}
                    {/*    {validDuration}*/}
                    {/*</div>*/}
                    <button className={styles.settings} onClick={() => navigate(Route.Options)}>
                        <img src="settings.png" height={16}/>
                    </button>
                    <ActiveToggle
                        value={storage?.on ? storage.on : false}
                        onToggle={(on) => setOn(on)}></ActiveToggle>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.message}>
                    {storage?.latestAuthToken ?
                        <>
                            <div className={styles.success}>
                                <img src="done.png" alt="done"/>
                                <span>The most recent token has been copied to your clipboard. Handle it with care.</span>
                            </div>

                            <div className={styles.details}>
                                <div className={styles['details-title']}>Token details</div>
                                <div className={styles['interaction-item']}>
                                    <div className={styles.item}>
                                        <img src="key.png" height={12}/>
                                        <span className={styles.truncated}>{storage.latestAuthToken}</span>
                                    </div>
                                    <div className={styles['interaction-controls']}>
                                        <img src="copy.png" height={16}/>
                                        <img src="inspect.png" height={16} onClick={() => navigate(Route.Inspect)}/>
                                    </div>
                                </div>
                                <div className={styles.item}>
                                    <img src="url.png" height={12}/>
                                    <span>{storage.url}</span>
                                </div>
                                <div className={styles.item}>
                                    <img src="clock.png" height={12}/>
                                    {valid ?
                                        <span>Expires in {validDuration}</span> :
                                        <span>Token expired</span>
                                    }
                                </div>
                            </div>

                            {/*<Inspect></Inspect>*/}
                        </>
                        :
                        storage?.on ?
                            <span className={styles.waiting}>Seems like there is no token available yet! Try to make a web request to receive a token. 🤔</span>
                            : <span className={styles.waiting}>Token detection is turned off. 😴</span>
                    }

                    {/*<div className={styles.expiration}>Expires in: <span>{validDuration}</span></div>*/}
                    {/*<div className={styles.url}>*/}
                    {/*    <img src="url.png" height={12}/>*/}
                    {/*    <span>{storage.url}</span>*/}
                    {/*</div>*/}





                    {/*<span onClick={() => navigate(Route.Options)}>Options</span>*/}

                </div>
            </div>
        </>

    );
}
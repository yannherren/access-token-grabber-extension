import React, {useState} from "react";
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

    return (
        <>
            <div className={styles.bar}>
                <img className={styles.logo} src="logo-full.png" alt="logo"/>
                <ActiveToggle
                    value={storage?.on ? storage.on : false}
                    onToggle={(on) => setOn(on)}></ActiveToggle>
            </div>

            <div className={styles.content}>
                <div className={styles.message}>
                    {storage?.latestAuthToken ?
                        <>
                            <div className={styles.success}>
                                <img src="done.png" alt="done"/>
                                <span>The most recent token has been copied to your clipboard. Handle it with care.</span>
                            </div>
                            {/*<Inspect></Inspect>*/}
                        </>
                        :
                        storage?.on ?
                            <span className={styles.waiting}>Seems like there is no token available yet! Try to make a web request to receive a token. 🤔</span>
                            : <span className={styles.waiting}>Token detection is turned off. 😴</span>
                    }

                    <span onClick={() => navigate(Route.Options)}>Options</span>
                </div>
            </div>
        </>

    );
}
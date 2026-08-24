import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import styles from "./styles/popup.module.css"
import {Options} from "./components/options";
import './global.css'
import {Subpage} from "./components/subpage";
import {useStorage} from "./hooks/storage";
import {Home} from "./pages/home";
import {Route} from "./routes";
import {clipboard} from "@extend-chrome/clipboard";
import {transformToken} from "./utils/token";
import {Inspect} from "./components/inspect";

const Popup = () => {

    const [route, setRoute] = useState<Route>(Route.Home)
    const [storage, updateRuntimeStorage, updateOptions, loadStorage] = useStorage();

    const [outAnimationClass, setOutAnimationClass] = useState<any>()

    const changeRoute = (route: Route, animationClass: any) => {
        const animationDurationMs = 200;
        setOutAnimationClass(animationClass);
        setTimeout(() => {
            setOutAnimationClass("");
            setRoute(route);
        }, animationDurationMs)
    }

    const setOn = (on: boolean) => {
        if (on) {
            chrome.action.setIcon({path: '/on.png'})
            updateOptions({on: true})
            chrome.storage.local.set({on: true})
        } else {
            chrome.action.setIcon({path: '/off.png'});
            chrome.action.setBadgeText({text: ''});
            updateOptions({on: false})
            updateRuntimeStorage({latestAuthToken: '', url: ''})
        }
    }

    const copyLatestToken = (removeBearer: boolean) => {
        if (storage?.latestAuthToken) {
            const token = transformToken(storage.latestAuthToken, removeBearer);
            clipboard.writeText(token)
        }
    }

    useEffect(() => {
        loadStorage();
    }, []);

    useEffect(() => {
        copyLatestToken(storage?.bearerRemoval ?? false);
    }, [storage?.latestAuthToken]);

    switch (route) {
        case Route.Home:
            // Shady setting the height here explicitly but otherwise animations won't work properly
            return <div className={styles.container} style={{'height': storage?.on ? storage.latestAuthToken ? '265px' : '162px' : '141px'}}>
                <div className={outAnimationClass}>
                    {storage ?
                        <Home storage={storage} navigate={route => changeRoute(route, styles["out-left"])}
                              setOn={setOn}/> : ''}
                </div>
            </div>
        case Route.Options:
            return <div className={styles.container} style={{'height': '295px'}}>
                <div className={outAnimationClass}>
                    <Subpage back={() => changeRoute(Route.Home, styles["out-right"])} title="Options">
                        { storage ? <Options storage={storage} updateOptions={updateOptions}></Options> : ''}
                    </Subpage>
                </div>

            </div>
        case Route.Inspect:
            return <div className={styles.container} style={{'height': '507px'}}>
                <div className={outAnimationClass}>
                    <Subpage back={() => changeRoute(Route.Home, styles["out-right"])} title="Inspect">
                        { storage ? <Inspect storage={storage}></Inspect> : ''}
                    </Subpage>
                </div>

            </div>

    }
};

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>
);

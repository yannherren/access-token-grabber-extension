import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import styles from "./styles/popup.module.css"
import {Options} from "./components/options";
import './global.css'
import {Subpage} from "./components/subpage";
import {useStorage} from "./hooks/storage";
import {Home} from "./pages/home";
import {Route} from "./routes";

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

    useEffect(() => {
        loadStorage();
    }, []);

    switch (route) {
        case Route.Home:
            return <div className={styles.container}>
                <div className={outAnimationClass}>
                    {storage ?
                        <Home storage={storage} navigate={route => changeRoute(route, styles["out-left"])}
                              setOn={setOn}/> : ''}
                </div>
            </div>
        case Route.Options:
            return <div className={styles.container}>
                <div className={outAnimationClass}>
                    <Subpage back={() => changeRoute(Route.Home, styles["out-right"])}>
                        <Options tokenCopied={(copied) => {
                        }}></Options>
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

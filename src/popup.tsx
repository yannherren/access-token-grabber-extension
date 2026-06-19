import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import styles from "./styles/popup.module.css"
import {ActiveToggle} from "./components/active-toggle";
import {Options} from "./components/options";
import './global.css'
import {Subpage} from "./components/subpage";

enum Route {
    Home,
    Options
}

const Popup = () => {
    const [listening, setListening] = useState<null | boolean>(null);
    const [tokenCopied, setTokenCopied] = useState(false);

    const [route, setRoute] = useState<Route>(Route.Home)

    const [outAnimationClass, setOutAnimationClass] = useState<any>()

    const changeRoute = (route: Route, animationClass: any) => {
        const animationDurationMs = 200;
        setOutAnimationClass(animationClass);
        setTimeout(() => {
            setOutAnimationClass("");
            setRoute(route);
        }, animationDurationMs)
    }

    // TODO make setting state
    // TODO separate settings manager
    // => maybe custom hook useStorage() -> custom useState()


    switch (route) {
        case Route.Home:
            return (
                <div className={styles.container + " "}>
                    <div className={outAnimationClass}>

                        <div className={styles.bar}>
                            <img src="logo-full.png" alt="logo"/>
                            <ActiveToggle
                                onToggle={(currentlyListening) => setListening(currentlyListening)}></ActiveToggle>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.message}>
                                {tokenCopied ?
                                    <>
                                        <div className={styles.success}>
                                            <img src="done.png" alt="done"/>
                                            <span>The most recent token has been copied to your clipboard. Handle it with care.</span>
                                        </div>
                                        {/*<Inspect></Inspect>*/}
                                    </>
                                    :
                                    listening ?
                                        <span className={styles.waiting}>Seems like there is no token available yet! Try to make a web request to receive a token. 🤔</span>
                                        : <span className={styles.waiting}>Token detection is turned off. 😴</span>
                                }

                                <span onClick={() => changeRoute(Route.Options, styles["out-left"])}>Options</span>
                            </div>
                        </div>
                    </div>

                </div>
            );
        case Route.Options:
            return <div className={styles.container}>
                <div className={outAnimationClass}>
                    <Subpage back={() => changeRoute(Route.Home, styles["out-right"])}>
                        <Options tokenCopied={(copied) => setTokenCopied(copied)}></Options>
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

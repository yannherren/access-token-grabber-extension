import React from "react";

interface Props {
    value: boolean
    onToggle: (value: boolean) => void
}

export const ActiveToggle = ({onToggle, value}: Props) => {
    return <>
        {value ?
            <button className={"toggle-button"} onClick={() => onToggle(false)}>
                <img src="on-button.png" alt="on"/>
            </button> :
            <button className={"toggle-button"} onClick={() => onToggle(true)}>
                <img src="off-button.png" alt="on"/>
            </button>
        }
    </>
}
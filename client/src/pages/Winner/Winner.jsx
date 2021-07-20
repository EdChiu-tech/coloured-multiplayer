import React from 'react'
import { useHistory } from "react-router-dom"
import "./Winner.scss"


function Winner({children, socket, onShow}) {
    const history = useHistory();


    const goBack = () => {
        history.replace("/");
        onShow(false);
        socket.disconnect();
        socket.connect();
    };

    return (
        <div className="winner">
            <div className="winner__content-container nes-container is-round is-dark">
            <h1 className="winner__content">{children}</h1>
            <button className="winner__reset nes-btn is-primary" type="click" onClick={goBack}>Restart?</button>
            </div>
        </div>
    )
}

export default Winner

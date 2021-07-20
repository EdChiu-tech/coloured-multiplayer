import React from 'react'
import "./Winner.scss"


function Winner(props) {

    return (
        <div className="winner">
            <div className="winner__content">
            <h1>{props.children}</h1>
            <button>Restart?</button>
            </div>
        </div>
    )
}

export default Winner

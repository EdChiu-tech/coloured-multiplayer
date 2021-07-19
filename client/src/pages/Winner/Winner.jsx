import React from 'react'
import "./Winner.scss"


function Winner(props) {

    return (
        <div className="winner">
            <h1>{props.children}</h1>
            <button>Restart?</button>
        </div>
    )
}

export default Winner

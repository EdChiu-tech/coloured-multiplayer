import React from 'react'
import "./Timer.scss"


function Timer({gameState}) {

    return (
        <>
            <p className="timer__text">⏳ {gameState.countdown || 'GAME OVER'}</p>
        </>
    )
}

export default Timer


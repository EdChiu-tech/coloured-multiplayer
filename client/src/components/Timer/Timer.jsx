import React from 'react'
import "./Timer.scss"


function Timer({ socket, gameState }) {
    const player = (gameState.players || []).find(player => player.id === socket.id)
    return (
        <>
            {player
                ? (<p className="timer__text">({player.avatar}) ⏳ {gameState.countdown || 'GAME OVER'}</p>)
                : (<p className="timer__text">⏳ {gameState.countdown || 'GAME OVER'}</p>)
            }
        </>
    )
}

export default Timer


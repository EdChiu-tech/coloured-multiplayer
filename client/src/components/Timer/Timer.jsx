import React from 'react'

function Timer({gameState}) {

    return (
        <div>
            <p style={{ fontSize: 50, textAlign: 'center' }}>⏳ {gameState.countdown || 'GAME OVER'}</p>
        </div>
    )
}

export default Timer

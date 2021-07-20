import React, { useEffect, useState } from 'react'
import { useHistory } from "react-router-dom"
import "./Start.scss"

function Start({socket}) {
    let history = useHistory();
    const [isGameReady, setGameReady] = useState(false)

    const onClickReady = (e) => {
        e.preventDefault()
        socket.emit('ready_up', true)
    }

    socket.on('connected', () => console.log('CONNECTED!'))
    socket.on('game_ready', () => setGameReady(true))

    socket.on('start_game', () => {
        // show game
        history.push('/game')
    })

    return (
        <div className="start">
            <h1>Coloured</h1>
            {isGameReady 
                ? (
                    <>
                        <p>Ready to play</p>
                        <form className="start__form">
                            <button className="start__join" type="click"
                            onClick={onClickReady}>Ready Up</button>
                        </form>
                    </>
                )
                : <p>Waiting for other players...</p>
                }
        </div>
    )
}

export default Start

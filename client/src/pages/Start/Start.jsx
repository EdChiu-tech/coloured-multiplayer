import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import "./Start.scss"

function Start({socket}) {
    let history = useHistory();
    const [isGameReady, setGameReady] = useState(false)
    // const [gameIsFullAlert, setGameIsFullAlert] = useState (false)

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


    useEffect(() => {
        socket.on('room_is_full_alert', () => alert("Game is full! Joining as spectator!"), console.log("room full"))
    }, [])


    return (
        <div className="nes-container with-title is-centered is-dark is-rounded start">
            <h1 className="title start__title">Coloured</h1>
            {isGameReady 
                ? (
                    <div>
                        <p>Ready to play</p>
                        <form className="start__form">
                            <button className="nes-btn is-primary" type="click"
                            onClick={onClickReady}>Ready Up</button>
                        </form>
                    </div>
                )
                : <p>Waiting for other players...</p>
                }
        </div>
    )
}

export default Start

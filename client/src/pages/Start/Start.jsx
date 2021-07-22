import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import "./Start.scss"

function Start({socket, gameState}) {
    let history = useHistory();
    const [isGameReady, setGameReady] = useState(false)
    const [playerIsReady, setPlayerReady] = useState(false)
    const [disableReadyButton, setDisableReadyButton] = useState(false)
    // const [gameIsFullAlert, setGameIsFullAlert] = useState (false)

    const onClickReady = (e) => {
        e.preventDefault()
        setPlayerReady(!playerIsReady)
        socket.emit('ready_up', !playerIsReady)  
    }
        console.log(playerIsReady)

    socket.on('ready_status_received', playerIsReady)
    socket.on('connected', () => console.log('CONNECTED!'))
    socket.on('game_ready', () => setGameReady(true))
    socket.on('start_game', () => {
        // show game
        history.push('/game')
        setDisableReadyButton(true)
    })


    useEffect(() => {
        socket.on('room_is_full_alert', () => alert("Game is full! Joining as spectator!"), console.log("room full"))
    }, [])

    const displayReadyStatus = (gameState.players || []).map((player, index) =>{
        if(player.ready === true){
        return <p className="ready__status-true">{player.avatar}Ready</p>
        } else{
            return <p className="ready__status-false">{player.avatar}Not Ready</p>
        }
    })

    return (
        <div className="nes-container with-title is-centered is-dark is-rounded start">
            <h1 className="title start__title">Coloured</h1>
            {isGameReady 
                ? (
                    <div>
                        <p>Ready to play</p>
                        <p>{displayReadyStatus}</p>
                        <form className="start__form">
                            <button className="nes-btn is-primary"
                            // disabled={disableReadyButton? true: false}
                            type="click"
                            onClick={onClickReady}
                            >Ready Up</button>
                        </form>
                    </div>
                )
                : <p>Waiting for other players...</p>
                }
        </div>
    )
}

export default Start

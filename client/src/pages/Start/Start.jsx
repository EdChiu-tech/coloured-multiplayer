import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom"
import "./Start.scss"

function Start({socket, gameState, isPlayer}) {
    let history = useHistory();
    const [isGameReady, setGameReady] = useState(false)
    const [isPlayerReady, setPlayerReady] = useState(false)
    const [disableReadyButton, setDisableReadyButton] = useState(false)
    const [players, setPlayers] = useState([])
    // const [gameIsFullAlert, setGameIsFullAlert] = useState (false)

    const onClickReady = (e) => {
        e.preventDefault()
        socket.emit('ready_up', true)  
        setPlayerReady(true)
        // socket.emit('ready_up', !isPlayerReady)  
    }

    useEffect(() => {
        // TODO - remove listeners and re-add
        socket.on('player_statuses', players => setPlayers(players))

        socket.on('slots_filled', () => setGameReady(true))
        socket.on('start_game', () => {
            // show game
            history.push('/game')
            setDisableReadyButton(true)
        })
        // socket.on('room_is_full_alert', () => alert("Game is full! Joining as spectator!"), console.log("room full"))
    }, [])

    const playerReadyStatuses = players.map((player, index) =>{
        if(player.ready === true){
            if(player.id === socket.id) {
                return <p className="ready__status-true">{'-> ' + player.avatar}Ready</p>
            } else {
                return <p className="ready__status-true">{player.avatar}Ready</p>
            }
        } else{
            return <p className="ready__status-false">{player.avatar}Not Ready</p>
        }
    })

    const allPlayersReady = players.every(player => player.ready === true)

    let readyStateMessage = 'Click ready button'
    if (isPlayerReady && allPlayersReady) {
        readyStateMessage = 'Starting game...'
    } else if (isPlayerReady && !allPlayersReady) {
        readyStateMessage = 'Waiting for other players...'
    }

    return (
        <div className="nes-container with-title is-centered is-dark is-rounded start">
            <h1 className="title start__title">Coloured</h1>
            {isGameReady 
                ? 
                    isPlayer 
                        ? 
                        (
                            <div>
                                <p>{readyStateMessage}</p>
                                { isPlayerReady ? (<p>{playerReadyStatuses}</p>) : null }
                                <form className="start__form">
                                    <button className="nes-btn is-primary"
                                    // disabled={disableReadyButton? true: false}
                                    type="click"
                                    onClick={onClickReady}
                                    >Ready Up</button>
                                </form>
                            </div>
                        )
                        :
                        (
                            <p>You are currently a spectator</p>
                        )
                : <p>Waiting for other players...</p>
                }
        </div>
    )
}

export default Start

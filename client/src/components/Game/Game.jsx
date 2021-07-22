import React, { useEffect, useState } from 'react'
import GameBoard from "../GameBoard/GameBoard"
import Timer from "../Timer/Timer"
import "./Game.scss"

function Game({ socket, gameState }) {
    // const [gameState, setGameState] = useState({})

    //shows modal when timer is 0 and set the winning player to be the one with the highest player count

    // useEffect(() => {
    //     socket.on('sync_game_state', serverSideGameState => {
    //         setGameState(serverSideGameState)
    //     })
    // }, [])

    return (
        <>
            <Timer gameState={gameState} socket={socket} />
            <GameBoard gameState={gameState} socket={socket} />
            {gameState.players ? (
                <div className="score">
                    {
                        gameState.players.map(player => {
                            const { avatar, tileCount } = player
                            return (<p>{`${avatar}${tileCount}`}</p>)
                        })
                    }
                </div>
            ) : null}
        </>
    );
}

export default Game;
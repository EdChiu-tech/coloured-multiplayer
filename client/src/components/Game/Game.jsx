import React, { useEffect, useState } from 'react'
import GameBoard from "../GameBoard/GameBoard"
import Timer from "../Timer/Timer"

function Game({ socket }) {
    const [gameState, setGameState] = useState({})

    //shows modal when timer is 0 and set the winning player to be the one with the highest player count

    useEffect(() => {
        socket.on('sync_game_state', serverSideGameState => {
            setGameState(serverSideGameState)
        })
    }, [])

    return (
        <>
            <Timer gameState={gameState} socket={socket} />
            <GameBoard gameState={gameState} socket={socket} />
            {gameState.players ? (
                <div>
                    <p>{`${gameState.players[0].avatar}${gameState.players[0].tileCount}`}</p>
                    <p>{`${gameState.players[1].avatar}${gameState.players[1].tileCount}`}</p>
                    {/* <p>{`${gameState.players[2].avatar}${gameState.players[2].tileCount}`}</p>
                    <p>{`${gameState.players[3].avatar}${gameState.players[3].tileCount}`}</p> */}
                </div>
            ) : null}
        </>
    );
}

export default Game;
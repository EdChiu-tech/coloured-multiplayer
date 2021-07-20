import React, { useEffect, useState } from 'react'
import GameBoard from "../GameBoard/GameBoard"
import Timer from "../Timer/Timer"


function Game({ socket }) {
    const [gameState, setGameState] = useState({})


//shows modal when timer is 0 and set the winning player to be the one with the highest player count


    useEffect(() => {
        socket.on('sync_game_state', serverSideGameState => {
            // if (serverSideGameState.countdown === 0) {
            //     showWinnerModal(serverSideGameState.players)
            // }
            setGameState(serverSideGameState)
        })            
    },[])

    const tileCounts = (gameState.players || []).map((player, index) => {
        return `Player ${player.avatar}: ${player.tileCount}`
    }).join(', ')

    return (
        <>
            <Timer gameState={gameState} socket={socket}/>
            <GameBoard gameState={gameState} socket={socket} />
            <h1>{tileCounts}</h1>
        </>
    );
}

export default Game;
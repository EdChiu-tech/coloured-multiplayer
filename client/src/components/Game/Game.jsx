import React, { useEffect, useState } from 'react'
import GameBoard from "../GameBoard/GameBoard"
import Timer from "../Timer/Timer"
import Winner from "../../pages/Winner/Winner"

function Game({ socket }) {
    const [gameState, setGameState] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [winningPlayer, setWinningPlayer] = useState(null)


//shows modal when timer is 0 and set the winning player to be the one with the highest player count
    const showWinnerModal = (players) => {
        let playerWithHighestTileCount
        for (let player of players){ 
            if(!playerWithHighestTileCount) {
                playerWithHighestTileCount = player 
            } else if (player.tileCount > playerWithHighestTileCount.tileCount){
                playerWithHighestTileCount = player 
            }
        }
        setWinningPlayer(playerWithHighestTileCount)
        setShowModal(true);
    }

    useEffect(() => {
        socket.on('sync_game_state', serverSideGameState => {
            if (serverSideGameState.countdown === 0) {
                showWinnerModal(serverSideGameState.players)

            }
            setGameState(serverSideGameState)
        })            
    },[])

    const tileCounts = (gameState.players || []).map((player, index) => {
        return `Player ${index+1}: ${player.tileCount}`
    }).join(', ')

    return (
        <div>
            <Timer gameState={gameState} socket={socket}/>
            <GameBoard gameState={gameState} socket={socket} />
            { showModal ? <Winner>{winningPlayer.avatar}</Winner> : null }
            <h1>{tileCounts}</h1>
        </div>
    );
}

export default Game;
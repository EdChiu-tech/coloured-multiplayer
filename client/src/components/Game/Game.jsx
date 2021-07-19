import React, { useEffect, useState } from 'react'
import GameBoard from "../GameBoard/GameBoard"
import Timer from "../Timer/Timer"
import Winner from "../../pages/Winner/Winner"

function Game({ socket }) {
    const [gameState, setGameState] = useState({})
    const [showModal, setShowModal] = useState(false)

    const [winningPlayer, setWinningPlayer] = useState(null)

    const showWinnerModal = (players) => {
        let playerWithHighestTileCount

        console.log(JSON.stringify(players))

        for (let player of players){ // gameState.players = [{ name:'g', tileCount: 2}, { name: 'edward', tileCount: 3}]
            if(!playerWithHighestTileCount) {
                playerWithHighestTileCount = player // [{ name:'g', tileCount: 2}
            } else if (player.tileCount > playerWithHighestTileCount.tileCount){
                playerWithHighestTileCount = player //  { name: 'edward', tileCount: 3 }
            }
        }

        setWinningPlayer(playerWithHighestTileCount)
        setShowModal(true);
    }

    useEffect(() => {
        socket.on('sync_game_state', serverSideGameState => {
            console.log('sync_game_state', serverSideGameState)
            if (serverSideGameState.countdown === 0) showWinnerModal(serverSideGameState.players)
            setGameState(serverSideGameState)
        })
    }, [])

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
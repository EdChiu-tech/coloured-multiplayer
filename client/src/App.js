import React, { useEffect, useState } from 'react'
import { BrowserRouter, Switch, Route, useHistory } from "react-router-dom";
import { io } from "socket.io-client";
import Game from "./components/Game/Game"
import Start from "./pages/Start/Start"
import BGVideo from "./components/BGVideo/BGVideo"
import Winner from "./pages/Winner/Winner"
import './App.scss';

const socket = io('ws://localhost:8080')


function App() {
  const [showModal, setShowModal] = useState(false)
  const [winningPlayer, setWinningPlayer] = useState(null)


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
    })            
},[])

  return (
    <div className="App">
      <BrowserRouter>
          <BGVideo />
          { showModal ? <Winner onShow={show => {setShowModal(show)}} socket={socket}> {`The Winner is:${winningPlayer.avatar}`}</Winner > : null }
        <Switch>
          <Route exact path="/"
            render={() => <Start socket={socket} />}
          />
          <Route exact path="/game"
            render={() => <Game socket={socket} />}
          />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;

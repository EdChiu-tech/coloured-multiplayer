import { BrowserRouter, Switch, Route } from "react-router-dom";
import { io } from "socket.io-client";
import Game from "./components/Game/Game"
import Start from "./pages/Start/Start"
import BGVideo from "./components/BGVideo/BGVideo"
import './App.scss';

const socket = io('ws://localhost:8080')

function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <BGVideo />
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

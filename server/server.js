const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors')

const deepClone = obj => JSON.parse(JSON.stringify(obj))

require("dotenv").config();
const port = process.env.PORT ||8080;

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    }
});


app.use(cors({ origin: '*' }))
app.use(express.static("public"))

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

// initialBoard: Array(GameBoardSize).fill().map(() => Array(GameBoardSize).fill(null)),

const GameBoardSize = 10;

/**
 *  id: null,
        color: '#332c50',
        x: GameBoardSize-1,
        y: 0,
        joined: false,
        tileCount: 0
 */
const PLAYER_CONSTANTS = [
    {
        avatar: '🐶',
        color: '#46878f',
        x: 0,
        y: 0
    },
    {
        avatar: '🐱',
        color: '#332c50',
        x: GameBoardSize-1,
        y: 0
    },
    // {
    //     avatar: '🏎',
    //     color: '#e2f3e4',
    //     x: GameBoardSize-1,
    //     y: GameBoardSize-1
    // },
    // {
    //     avatar: '🍜',
    //     color: '#94e344',
    //     x: 0,
    //     y: GameBoardSize-1
    // }
]

const INITIAL_GAME_STATE = {
    countdown: 5,
    players: PLAYER_CONSTANTS.map((constants, index) => {
        return {
            ...constants,
            index,
            id: null,
            joined: false,
            ready: false,
            tileCount: 0 
        }
    }),
    matrix: Array(GameBoardSize).fill().map(() => Array(GameBoardSize).fill({}))
}

let gameState = deepClone(INITIAL_GAME_STATE)

// class GameState {
//     constructor() {
//         this._players = []
//         this._matrix = [[]]
//     }

//     haveAllPlayersJoin() {
//         return this._players.every(player => player.joined === true)
//     }

//     addPlayer(socketId) {
//         console.log('Set player', socketId, 's joined status to true\n\n')
//         const index = this._players.findIndex(player => player.joined === false)
//         if (index >= 0) { // if there is still free slot
//             this._players[index].joined = true
//             this._players[index].id = socketId

//             this.updateMatrix(this._players[index])
//         }
//     }
// }

io.on('connection', (socket) => {
    console.log('A new user has connected:', socket.id);

    /* PLAYER JOINING CODE */
    setPlayerJoined(socket.id)
    if (gameState.players.every(player => player.joined === true)) {
        io.emit("game_ready", true)
    }

    socket.on('ready_up', () => {
        const playerThatsReady = gameState.players.find(player => player.id === socket.id) 
        console.log('Player', playerThatsReady.id, 'is ready')
        playerThatsReady.ready = true

        // SHOULD ONLY RUN ONCE
        if(gameState.players.every(player => player.ready)) {
            io.emit('start_game', true)

            // Begin countdown
            io.emit('sync_game_state', gameState)
            interval = setInterval(() => {
                gameState.countdown--
                if (gameState.countdown === 0) {
                    clearInterval(interval)
                }
                io.emit('sync_game_state', gameState)
            }, 1000)
        }
    })

    socket.on('move', msg => {
        console.log('Received move message from:', socket.id, msg)
        // arguably slow if you had 10000 players
        const playerThatMoved = gameState.players.find(player => player.id === socket.id) // ugly code
        if (!playerThatMoved) return // if spectator, ignore

        if (msg === "ArrowUp") {
            if (playerThatMoved.y > 0) playerThatMoved.y--
        } else if (msg === "ArrowDown") {
            if (playerThatMoved.y < GameBoardSize - 1) playerThatMoved.y++
        } else if (msg === "ArrowRight") {
            if (playerThatMoved.x < GameBoardSize - 1) playerThatMoved.x++
        } else if (msg === "ArrowLeft") {
            if (playerThatMoved.x > 0) playerThatMoved.x--
        }

        updateMatrix(playerThatMoved)
        io.emit('sync_game_state', gameState)
    })

    function updateMatrix(playerThatMoved) {
        const { x, y, color, index } = playerThatMoved
        
        const cell = gameState.matrix[y][x] // default value is {}

        if (cell.playerIndex === undefined) {
            // if no one has walked over it
            gameState.players[index].tileCount++
        } else if (cell.playerIndex !== index) {
            // stepped over someones existing tile
            gameState.players[index].tileCount++
            gameState.players[cell.playerIndex].tileCount--
        }

        // { playerIndex: '0', color: 'red' } means player 0(red) has been there
        gameState.matrix[y][x] = { playerIndex: index, color }
    }

    function setPlayerLeft(socketId) {
        const index = gameState.players.findIndex(player => player.id === socketId)
        if (index >= 0) { // if there is still free slot
            gameState.players[index].joined = false
            gameState.players[index].id = null
            console.log('Player has left', socketId)
        } else {
            console.log('Spectator left')
        }
    }

    function setPlayerJoined(socketId) {
        console.log('Set player', socketId, 's joined status to true\n\n')
        const index = gameState.players.findIndex(player => player.joined === false)
        if (index >= 0) { // if there is still free slot
            gameState.players[index].joined = true
            gameState.players[index].id = socketId

            updateMatrix(gameState.players[index])
        }
    }

    socket.on('disconnect', () => {
        setPlayerLeft(socket.id)

        const joinedPlayer = gameState.players.find(player => player.joined === true) 
        if (joinedPlayer === undefined) {
            gameState = deepClone(INITIAL_GAME_STATE)
        }
        // console.log('Player has left, we should see joined: false', JSON.stringify(gameState.players, null, 2))
    })
});

server.listen(8080, () => {
    console.log(`server is running on :${port}`);
});
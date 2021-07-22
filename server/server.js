const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors')
const { cloneDeep, isEmpty } = require("lodash");

require("dotenv").config();

const port = process.env.PORT || 8080;

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

app.use(cors({ origin: '*' }))
app.use(express.static("public"))

const GameBoardSize = 20;

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
        x: GameBoardSize - 1,
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
    countdown: 15,
    players: PLAYER_CONSTANTS.map((constants, index) => {
        return {
            ...constants,
            index,
            id: null,
            joined: false,
            ready: false,
            tileCount: 0,
        }
    }),
    spectators: [],
    matrix: Array(GameBoardSize).fill().map(() => Array(GameBoardSize).fill({}))
}

// clone of the initial game state to not modify original
let gameState = cloneDeep(INITIAL_GAME_STATE)

function updateMatrix(playerThatMoved) {
    const { x, y, color, index } = playerThatMoved
    const cell = gameState.matrix[y][x] // default value is {}, y and x for playThatMoved

    if (cell.playerIndex === undefined) { //checks if cell is empty object, if so, returns true
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

function setPlayerJoined(socketId) {
    console.log('Set player', socketId, 's joined status to true\n\n')
    //find empty player slot and occupy slot
    const index = gameState.players.findIndex(player => player.joined === false)
    gameState.players[index].joined = true
    gameState.players[index].id = socketId
    updateMatrix(gameState.players[index])
}

function setPlayerLeft(socketId) {
    // find index of player that has an id in slot
    const index = gameState.players.findIndex(player => player.id === socketId)
    if(index >= 0) {
        gameState.players[index].joined = false
        gameState.players[index].id = null
        console.log('Player has left', socketId)
    } else {
        console.log('Spectator left')
    }
}

function addSpectator(socketId) {
    gameState.spectators.push(socketId)
}

io.disconnectSockets();
io.on('connection', (socket) => {
    console.log('A new user has connected:', socket.id);

    // PLAYER JOINING CODE 
    const hasFreeSlot = gameState.players.find(player => player.joined === false)
    if (hasFreeSlot) {
        setPlayerJoined(socket.id)
        socket.emit('is_player_status', true)
    } else {
        addSpectator(socket.id)
        socket.emit('is_player_status', false)
    }

    // once all player slots are filled, game is ready 
    if (gameState.players.every(player => player.joined === true)) {
        io.emit("slots_filled", true)
    }

    // finds player that clicked the ready button and sets their ready status to true, will run each button press
    socket.on('ready_up', (isReady) => {
        const player = gameState.players.find(player => player.id === socket.id)
        // const spectator = gameState.spectators.find(socketId => socketId === socket.id)

        // if (spectator) {
        //     console.log("spectators cannot press ready")
        //     socket.emit('room_is_full_alert', true)
        // } else 
        if (player) {
            console.log('Player', player.id, 'set their ready status to', isReady)
            player.ready = true // isReady
            // socket.emit('ready_status_received', isReady)
        } else {
            throw new Error('User is neither player or spectator (should never happen)')
        }

        // SHOULD ONLY RUN ONCE
        if(gameState.players.every(player => player.ready)) {
            io.emit('start_game', true)

            // Begin countdown
            io.emit('sync_game_state', gameState)
            interval = setInterval(() => {
                if (gameState.countdown < 0) {
                    throw new Error('THIS SHOULD NEVER HAPPEN, SOMETHING IS WRONG WITH MY CODE!')
                }

                gameState.countdown--
                io.emit('sync_game_state', gameState)
                if (gameState.countdown === 0) {
                    clearInterval(interval)
                    io.disconnectSockets();

                    gameState = cloneDeep(INITIAL_GAME_STATE)
                }
            }, 1000)
        }
    })

    socket.on('move', msg => {
        console.log('Received move message from:', socket.id, msg)
        const playerThatMoved = gameState.players.find(player => player.id === socket.id)
        
        if (playerThatMoved) {
            if (msg === "ArrowUp") {
                if (playerThatMoved.y > 0) playerThatMoved.y--
            } else if (msg === "ArrowDown") {
                if (playerThatMoved.y < GameBoardSize - 1) playerThatMoved.y++
            } else if (msg === "ArrowRight") {
                if (playerThatMoved.x < GameBoardSize - 1) playerThatMoved.x++
            } else if (msg === "ArrowLeft") {
                if (playerThatMoved.x > 0) playerThatMoved.x--
            }
        }

        updateMatrix(playerThatMoved)
        io.emit('sync_game_state', gameState)
    })

    socket.on('disconnect', () => {
        setPlayerLeft(socket.id)
        const joinedPlayer = gameState.players.find(player => player.joined === true)
        if (joinedPlayer === undefined) {
            gameState = cloneDeep(INITIAL_GAME_STATE)
        }
    })
});

server.listen(port, () => {
    console.log(`server is running on :${port}`);
});

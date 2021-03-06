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


// Manually disconnect players
app.get('/disconnect', (req, res) => {
    io.disconnectSockets();
    res.status(200).send("players disconnected manually")
    // res.sendStatus(200)
})

const GameBoardSize = 15;

const PLAYER_CONSTANTS = [
    {
        avatar: '🐶',
        color: '#D0F4F8',
        x: 0,
        y: 0
    },
    {
        avatar: '🐱',
        color: '#70B0C0',
        x: GameBoardSize - 1,
        y: 0
    },
    {
        avatar: '🐘',
        color: '#3C3468',
        x: GameBoardSize-1,
        y: GameBoardSize-1
    },
    {
        avatar: '🍜',
        color: '#1C0820',
        x: 0,
        y: GameBoardSize-1
    }
]

const INITIAL_GAME_STATE = {
    countdown: 30,
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
    matrix: Array(GameBoardSize).fill().map(() => Array(GameBoardSize).fill({}))
}

const TRANSITION_DELAY = 3000

// clone of the initial game state to not modify original
let gameState = cloneDeep(INITIAL_GAME_STATE)

const updateMatrix = (playerThatMoved) => {
    if(playerThatMoved === undefined) return
    const { x, y, color, index } = playerThatMoved
    const cell = gameState.matrix[y][x] // default value is {}, y and x for playThatMoved

    if (cell.playerIndex === undefined) { //checks if cell is empty object, if so, returns true
        // if no one has walked over cell
        gameState.players[index].tileCount++
    } else if (cell.playerIndex !== index) {
        // stepped over someone's existing cell
        gameState.players[index].tileCount++
        gameState.players[cell.playerIndex].tileCount--
    }

    // { playerIndex: '0', color: 'red' } means player 0(red) has been there
    gameState.matrix[y][x] = { playerIndex: index, color }
}

const setPlayerJoined = (socketId) => {
    console.log('Set player', socketId, 's joined status to true\n\n')
    // find empty player slot and occupy slot
    const index = gameState.players.findIndex(player => player.joined === false)
    gameState.players[index].joined = true
    gameState.players[index].id = socketId
    updateMatrix(gameState.players[index])
}

const setPlayerLeft = (socketId) => {
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

io.on('connection', (socket) => {
    console.log('A new user has connected:', socket.id);

    // PLAYER JOINING CODE 
    const hasFreeSlot = gameState.players.find(player => player.joined === false)
    if (hasFreeSlot) {
        setPlayerJoined(socket.id)
        socket.emit('is_player_status', true)
    } else {
        socket.emit('is_player_status', false)
    }

    // once all player slots are filled, game is ready 
    if (gameState.players.every(player => player.joined === true)) {
        io.emit("slots_filled", true)
    }

    // finds player that clicked the ready button and sets their ready status to true, will run each button press
    socket.on('ready_up', (isReady) => {
        const player = gameState.players.find(player => player.id === socket.id)
        if (player) {
            // Ignore players that already pressed ready (or just disable the button on frontend)
            if (player.ready === true) return

            console.log('Player', player.id, 'set their ready status to', isReady)
            player.ready = true // isReady
            // socket.emit('ready_status_received', isReady)
        } else {
            throw new Error('User is neither player or spectator (should never happen)')
        }

        io.emit('player_statuses', gameState.players)

        // SHOULD ONLY RUN ONCE
        if(gameState.players.every(player => player.ready)) {
            io.emit('game_start_timer', true)
            setTimeout(() => {
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
            }, TRANSITION_DELAY)
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
    console.log(`websocket server is running on :${port}`);
});

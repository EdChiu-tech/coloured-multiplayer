import React, { useEffect, useState } from 'react'
import "./GameBoard.scss"

const GameBoard = ({ gameState, socket }) => {

    const [renderedBoard, setRenderedBoard] = useState(null);

    const renderServerBoard = ({ matrix, players }) => { // matrix is [[{ color }, {color}, ...], ....]
        if (matrix == null) return null
        return matrix.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
                {row.map((cell, colIndex) => {
                    const { color, playerIndex } = cell
                    if (color == null) {
                        return <div
                            key={colIndex} className="cell--inactive"></div>
                    }
                    // referring to the player within the cell
                    const { x, y, avatar } = players[playerIndex]
                    if (y === rowIndex && x === colIndex) {
                        // current position of player
                        return <div
                            key={colIndex} className="cell--online-player" style={{ 'backgroundColor': color}}>{avatar}</div>
                    }
                    // cells that the player has "converted"
                    else {
                        return <div
                            key={colIndex}
                            className="cell--player-moved" style={{ 'backgroundColor': color }}></div>
                    }
                })}
            </div>
        ))
    };

    useEffect(() => {
        window.onkeyup = (e) => {
            // Movement logic based on coordinates, will not move beyond the grid
            socket.emit('move', e.key)
        }
    }, [])


    // render the gameboard based on server's game state
    useEffect(() => {
        if (!gameState.matrix) return
        setRenderedBoard(renderServerBoard(gameState))
    }, [gameState])


    return (
        <div className="gameBoard">
            {renderedBoard}
        </div>
    )
}

export default GameBoard


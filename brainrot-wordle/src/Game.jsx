import { useState } from "react"
import './Game.css'

function Game() {
    const [chosenWord] = useState("BOMBOCLAUT")
    const [guesses, setGuesses] = useState(Array(6).fill(""))
    const [currentGuess, setCurrentGuess] = useState("")
    const [currentRow, setCurrentRow] = useState(0)

    const WORD_LENGTH = chosenWord.length

    const handleKeyup = (e) => {
        if (currentRow >= 6) return; 

        if (e.key === 'Enter') {
            if (currentGuess.length === WORD_LENGTH) {
                const newGuesses = [...guesses];
                newGuesses[currentRow] = currentGuess;
                setGuesses(newGuesses);
                setCurrentRow(currentRow + 1);
                setCurrentGuess("");
            }
        } else if (e.key === 'Backspace') {
            setCurrentGuess(currentGuess.slice(0, -1));
        } else if (currentGuess.length < WORD_LENGTH && e.key.match(/^[a-zA-Z]$/)) {
            setCurrentGuess(currentGuess + e.key.toUpperCase());
        }
    };

    const grid = guesses.map((guess, i) => {
        const row = []
        for (let j = 0; j < WORD_LENGTH; j++ ) {
            let letter = i === currentRow ? currentGuess[j] : guess[j]
            let className = "cell"

            if (i < currentRow) {
                if (letter === chosenWord[j]) {
                    className += " correct"
                } else if (chosenWord.includes(letter)) {
                    className += " present"
                } else {
                    className += " absent"
                }
            }

            row.push(
                <div key={j} className={className}>
                    {letter || ""}
                </div>
            )
        }
    return <div key={i} className="row">{row}</div>
    })

    return (
        <>
            <h1 className="title">Brainrot Wordle</h1>
            <div className="game" onKeyUp={handleKeyup} tabIndex="0">
                <div className="grid">{grid}</div>
            </div>
        </>
    )
}


export default Game

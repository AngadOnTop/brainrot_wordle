import { useEffect, useState } from "react"
import words from "./words.js"
import './Game.css'

function Game() {
    const [chosenWord] = useState(() => {
        const randomIndex = Math.floor(Math.random() * words.length)
        console.log(words[randomIndex])
        return words[randomIndex]
    })
    const [guesses, setGuesses] = useState(Array(6).fill(""))
    const [currentGuess, setCurrentGuess] = useState("")
    const [currentRow, setCurrentRow] = useState(0)

    const WORD_LENGTH = chosenWord.length

    useEffect(() => {
        const handleKeyup = (e) => {
            if (currentRow >= 6) return;

            if (e.key === 'Enter') {
                const nonSpaceLength = chosenWord.replace(/\s/g, '').length;
                if (currentGuess.length === nonSpaceLength) {
                    let formattedGuess = '';
                    let guessIndex = 0;
                    
                    for (let i = 0; i < WORD_LENGTH; i++) {
                        if (chosenWord[i] === ' ') {
                            formattedGuess += ' ';
                        } else {
                            formattedGuess += currentGuess[guessIndex];
                            guessIndex++;
                        }
                    }

                    const newGuesses = [...guesses];
                    newGuesses[currentRow] = formattedGuess;
                    setGuesses(newGuesses);
                    setCurrentRow(currentRow + 1);
                    setCurrentGuess("");
                }
            } else if (e.key === 'Backspace') {
                setCurrentGuess(currentGuess.slice(0, -1));
            } else if (e.key.match(/^[a-zA-Z]$/)) {
                const nonSpaceLength = chosenWord.replace(/\s/g, '').length;
                if (currentGuess.length < nonSpaceLength) {
                    setCurrentGuess(currentGuess + e.key.toUpperCase());
                }
            }
        };

        window.addEventListener('keyup', handleKeyup);
        return () => window.removeEventListener('keyup', handleKeyup);
    }, [currentGuess, currentRow, chosenWord, guesses, WORD_LENGTH]);

    const grid = guesses.map((guess, i) => {
        const row = [];
        let guessIndex = 0;
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            let letter;
            if (i === currentRow) {
                if (chosenWord[j] === ' ') {
                    letter = ' ';
                } else if (guessIndex < currentGuess.length) {
                    letter = currentGuess[guessIndex++];
                } else {
                    letter = '';
                }
            } else {
                letter = guess[j];
            }

            let className = "cell";
            if (chosenWord[j] === ' ') {
                className += " space";
            }

            if (i < currentRow) {
                if (letter === chosenWord[j]) {
                    className += " correct";
                } else if (chosenWord.includes(letter)) {
                    className += " present";
                } else {
                    className += " absent";
                }
            }

            row.push(
                <div key={j} className={className}>
                    {letter || ""}
                </div>
            );
        }
        return <div key={i} className="row">{row}</div>;
    })

    return (
        <>
            <h1 className="title">Brainrot Wordle</h1>
            <div className="game">
                <div className="grid">{grid}</div>
            </div>
        </>
    )
}

export default Game

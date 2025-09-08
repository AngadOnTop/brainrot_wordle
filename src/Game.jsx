import { useEffect, useState } from "react"
import GENZ_DICTIONARY from "./words.js"
import './Game.css'

function Game() {
    const [chosenWordKey, setChosenWordKey] = useState(() => {
        const keys = Object.keys(GENZ_DICTIONARY)
        const randomIndex = Math.floor(Math.random() * keys.length)
        console.log(keys[randomIndex])
        return keys[randomIndex]
    })
    const [guesses, setGuesses] = useState(Array(6).fill(""))
    const [currentGuess, setCurrentGuess] = useState("")
    const [currentRow, setCurrentRow] = useState(0)
    const [revealedRow, setRevealedRow] = useState(-1)
    const [hintStage, setHintStage] = useState(0)

    const WORD_LENGTH = chosenWordKey.length

    const processInput = (inputKey) => {
        if (currentRow >= 6) return;

        if (inputKey === 'Enter') {
            const targetLength = chosenWordKey.replace(/\s/g, '').length;
            if (currentGuess.length === targetLength) {
                let formattedGuess = '';
                let guessCursor = 0;

                for (let i = 0; i < WORD_LENGTH; i++) {
                    if (chosenWordKey[i] === ' ') {
                        formattedGuess += ' ';
                    } else {
                        formattedGuess += currentGuess[guessCursor];
                        guessCursor++;
                    }
                }

                const nextGuesses = [...guesses];
                nextGuesses[currentRow] = formattedGuess;
                setGuesses(nextGuesses);
                setRevealedRow(currentRow);
                setCurrentRow(currentRow + 1);
                setCurrentGuess("");

                const revealDurationMs = 600 + 90 * WORD_LENGTH;
                window.setTimeout(() => setRevealedRow(-1), revealDurationMs);
            }
        } else if (inputKey === 'Backspace') {
            setCurrentGuess(currentGuess.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(inputKey)) {
            const targetLength = chosenWordKey.replace(/\s/g, '').length;
            if (currentGuess.length < targetLength) {
                setCurrentGuess(currentGuess + inputKey.toUpperCase());
            }
        }
    };

    useEffect(() => {
        const handleKeyup = (e) => {
            processInput(e.key);
        };

        window.addEventListener('keyup', handleKeyup);
        return () => window.removeEventListener('keyup', handleKeyup);
    }, [currentGuess, currentRow, chosenWordKey, guesses, WORD_LENGTH]);

    const computeLetterStatuses = () => {
        const statusByLetter = {};
        for (let i = 0; i < currentRow; i++) {
            const guessRow = guesses[i] || '';
            for (let j = 0; j < WORD_LENGTH; j++) {
                const letter = guessRow[j];
                if (!letter || letter === ' ') continue;

                let status = 'absent';
                if (letter === chosenWordKey[j]) {
                    status = 'correct';
                } else if (chosenWordKey.includes(letter)) {
                    status = 'present';
                }

                const previous = statusByLetter[letter];
                if (previous === 'correct') continue;
                if (previous === 'present' && status === 'absent') continue;
                statusByLetter[letter] = status;
            }
        }
        return statusByLetter;
    };

    const grid = guesses.map((guess, i) => {
        const row = [];
        let guessIndex = 0;
        
        for (let j = 0; j < WORD_LENGTH; j++) {
            let letter;
            if (i === currentRow) {
                if (chosenWordKey[j] === ' ') {
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
            if (chosenWordKey[j] === ' ') {
                className += " space";
            }

            if (i < currentRow) {
                if (letter === chosenWordKey[j]) {
                    className += " correct";
                } else if (chosenWordKey.includes(letter)) {
                    className += " present";
                } else {
                    className += " absent";
                }
            }

            row.push(
                <div key={j} className={className} style={{ "--idx": j }}>
                    {letter || ""}
                </div>
            );
        }
        const rowClassName = `row${i === revealedRow ? ' reveal' : ''}`;
        return <div key={i} className={rowClassName}>{row}</div>;
    })

    const onKeyClick = (value) => {
        processInput(value);
    };

    const hasWon = guesses.includes(chosenWordKey);
    const hasLost = currentRow >= 6 && !hasWon;

    const handleHint = () => {
        if (hasWon || hasLost) return;
        if (hintStage === 0) {
            const nonSpaceIndices = [];
            for (let i = 0; i < chosenWordKey.length; i++) {
                if (chosenWordKey[i] !== ' ') nonSpaceIndices.push(i);
            }
            const targetLength = nonSpaceIndices.length;
            if (currentGuess.length >= targetLength) return;
            const revealChar = chosenWordKey[nonSpaceIndices[currentGuess.length]];
            setCurrentGuess(currentGuess + revealChar.toUpperCase());
            setHintStage(1);
        } else if (hintStage === 1) {
            setHintStage(2);
        }
    };

    const resetGame = () => {
        const keys = Object.keys(GENZ_DICTIONARY)
        const randomIndex = Math.floor(Math.random() * keys.length)
        const nextWord = keys[randomIndex]
        console.log(nextWord)
        setChosenWordKey(nextWord)
        setGuesses(Array(6).fill(""))
        setCurrentGuess("")
        setCurrentRow(0)
        setRevealedRow(-1)
        setHintStage(0)
    };

    const letterStatuses = computeLetterStatuses();

    const firstRowKeys = ['Q','W','E','R','T','Y','U','I','O','P'];
    const secondRowKeys = ['A','S','D','F','G','H','J','K','L'];
    const thirdRowKeys = ['Enter','Z','X','C','V','B','N','M','Backspace'];

    const renderKey = (keyLabel) => {
        const isLetter = /^[A-Z]$/.test(keyLabel);
        const letterKey = isLetter ? keyLabel : undefined;
        const statusClass = letterKey ? (letterStatuses[letterKey] || '') : '';
        const wideClass = (keyLabel === 'Enter' || keyLabel === 'Backspace') ? ' wide' : '';
        const display = keyLabel === 'Backspace' ? '⌫' : keyLabel;
        return (
            <button
                key={keyLabel}
                className={`key ${statusClass}${wideClass}`}
                onClick={() => onKeyClick(keyLabel)}
                aria-label={keyLabel}
            >
                {display}
            </button>
        );
    };

    return (
        <>
            <div className="topbar">
                <div className="brand">made by Angad (Xoro88)</div>
                <button
                    className={`hint-btn${hintStage > 0 ? ' used' : ''}`}
                    onClick={handleHint}
                    disabled={hintStage >= 2 || hasWon || hasLost}
                    aria-label="Reveal one letter"
                    title={hintStage >= 2 ? 'Hints used' : (hintStage === 1 ? 'Reveal description' : 'Reveal one letter')}
                    data-tip={hintStage >= 2 ? 'Hints used' : (hintStage === 1 ? 'Reveals a short description' : 'LOL is it that hard to guess the word?, ok here is a hint, but only 1 :)')}
                >
                    💡 Hint
                </button>
            </div>
            <h1 className="title">Brainrot Wordle</h1>
            {hintStage === 2 && (
                <div className="banner banner-hint">
                    {GENZ_DICTIONARY[chosenWordKey]}
                </div>
            )}
            {hasLost && (
                <div className="banner banner-loss">
                    <span>Out of tries. Solution:</span>
                    <strong className="solution">{chosenWordKey}</strong>
                </div>
            )}
            <div className="game">
                <div className="grid">{grid}</div>
            </div>
            {(hasWon || hasLost) && (
                <div className="actions">
                    <button className="btn" onClick={resetGame}>New Game</button>
                </div>
            )}
            <div className="keyboard">
                <div className="keyboard-row">
                    {firstRowKeys.map(renderKey)}
                </div>
                <div className="keyboard-row">
                    {secondRowKeys.map(renderKey)}
                </div>
                <div className="keyboard-row">
                    {thirdRowKeys.map(renderKey)}
                </div>
            </div>
        </>
    )
}

export default Game

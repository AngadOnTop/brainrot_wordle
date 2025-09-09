import { useEffect, useRef, useState } from "react"
import GENZ_DICTIONARY from "./words.js"
import './Game.css'

function Game() {
    // Web Audio: simple sound engine
    const audioContextRef = useRef(null)

    const ensureAudioContext = () => {
        if (!audioContextRef.current) {
            const Ctor = window.AudioContext || window.webkitAudioContext
            audioContextRef.current = new Ctor()
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume()
        }
        return audioContextRef.current
    }

    const playTone = (frequency, durationMs, {
        type = 'sine',
        gain = 0.08,
        attackMs = 3,
        decayMs = 60,
        releaseMs = 40
    } = {}) => {
        const ctx = ensureAudioContext()
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

        const now = ctx.currentTime
        const attack = attackMs / 1000
        const decay = decayMs / 1000
        const release = releaseMs / 1000
        const total = durationMs / 1000

        gainNode.gain.cancelScheduledValues(now)
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(gain, now + attack)
        gainNode.gain.linearRampToValueAtTime(gain * 0.7, now + attack + decay)
        gainNode.gain.setValueAtTime(gain * 0.7, now + total - release)
        gainNode.gain.linearRampToValueAtTime(0.0001, now + total)

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.start(now)
        oscillator.stop(now + total)
    }

    // Fun SFX helpers
    const createNoiseBurst = (durationMs, {
        type = 'white',
        gain = 0.06,
        filterType = 'bandpass',
        startFreq = 1400,
        endFreq = 600
    } = {}) => {
        const ctx = ensureAudioContext()
        const duration = durationMs / 1000
        const bufferSize = Math.floor(ctx.sampleRate * duration)
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1
            data[i] = white
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer

        const filter = ctx.createBiquadFilter()
        filter.type = filterType
        filter.frequency.setValueAtTime(startFreq, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(Math.max(60, endFreq), ctx.currentTime + duration)

        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(gain, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)

        source.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)
        source.start()
        source.stop(ctx.currentTime + duration)
    }

    const playBlip = (frequency, durationMs, {
        gain = 0.07,
        detuneCents = 8,
        type = 'triangle'
    } = {}) => {
        const ctx = ensureAudioContext()
        const now = ctx.currentTime

        const makeVoice = (detuneSign) => {
            const osc = ctx.createOscillator()
            const g = ctx.createGain()
            osc.type = type
            const jitter = (Math.random() * 12 - 6) // +-6 cents random
            osc.frequency.setValueAtTime(frequency, now)
            osc.detune.setValueAtTime((detuneSign * detuneCents) + jitter, now)
            const dur = durationMs / 1000
            g.gain.setValueAtTime(0, now)
            g.gain.linearRampToValueAtTime(gain, now + 0.02)
            g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
            osc.connect(g)
            g.connect(ctx.destination)
            osc.start(now)
            osc.stop(now + dur)
        }

        makeVoice(-1)
        makeVoice(1)
    }

    // Event sounds (playful)
    const playKeyClick = () => {
        // short bandpass noise + tiny blip
        createNoiseBurst(70, { gain: 0.05, filterType: 'bandpass', startFreq: 2200, endFreq: 1200 })
        playBlip(480 + Math.random() * 60, 90, { type: 'triangle', gain: 0.045 })
    }

    const playBackspace = () => {
        // lowpass noise swoop down
        createNoiseBurst(110, { gain: 0.06, filterType: 'lowpass', startFreq: 900, endFreq: 220 })
        playBlip(140, 120, { type: 'sawtooth', gain: 0.04 })
    }

    const playEnterSubmit = () => {
        // small ascending arp
        const notes = [523, 659, 784] // C5 E5 G5
        notes.forEach((f, i) => {
            setTimeout(() => playBlip(f, 140, { gain: 0.06, type: 'triangle' }), i * 90)
        })
    }

    const playHintSound = () => {
        // twinkle up
        const a = 740 + Math.random() * 30
        const b = a * 1.25
        playBlip(a, 120, { gain: 0.05 })
        setTimeout(() => playBlip(b, 140, { gain: 0.05 }), 80)
    }

    const playWinJingle = () => {
        // cheerful arp with 5 notes
        const seq = [659, 740, 880, 987, 1319] // E5 A5 A#5 B5 E6ish
        seq.forEach((f, i) => {
            setTimeout(() => {
                playBlip(f, i === seq.length - 1 ? 240 : 160, { gain: 0.07, type: 'triangle' })
            }, i * 120)
        })
    }

    const playLossBuzz = () => {
        // descending glide
        const ctx = ensureAudioContext()
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(320, now)
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4)
        g.gain.setValueAtTime(0.08, now)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.46)
    }

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
                playEnterSubmit()
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

                // Immediate win/loss sounds based on this submission
                if (formattedGuess === chosenWordKey) {
                    playWinJingle()
                } else if (currentRow === 5) {
                    playLossBuzz()
                }

                const revealDurationMs = 600 + 90 * WORD_LENGTH;
                window.setTimeout(() => setRevealedRow(-1), revealDurationMs);
            }
        } else if (inputKey === 'Backspace') {
            playBackspace()
            setCurrentGuess(currentGuess.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(inputKey)) {
            const targetLength = chosenWordKey.replace(/\s/g, '').length;
            if (currentGuess.length < targetLength) {
                playKeyClick()
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
            playHintSound()
        } else if (hintStage === 1) {
            setHintStage(2);
            playHintSound()
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
                    data-tip={hintStage >= 2 ? 'Hints used' : (hintStage === 1 ? 'Hm? You still need more help? fine... Here is a short hint...' : 'LOL is it that hard to guess the word?, ok here is a hint, but only 1 :)')}
                >
                    💡 Hint
                </button>
            </div>
            <h1 className="title">Brainrot Wordle</h1>
            {(hintStage === 2 || hasWon || hasLost) && (
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

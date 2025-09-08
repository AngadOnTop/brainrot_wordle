import { useState } from 'react'
import Game from './Game'
import './Game.css'

function Home({ onStart }) {
    return (
        <div className="home">
            <div className="topbar">
                <div className="brand">made by Angad (Xoro88)</div>
            </div>
            <h1 className="title">Brainrot Wordle</h1>
            <div className="actions">
                <button className="btn" onClick={onStart}>Start</button>
            </div>
        </div>
    )
}

export default function App() {
    const [started, setStarted] = useState(false)
    if (!started) return <Home onStart={() => setStarted(true)} />
    return <Game />
}



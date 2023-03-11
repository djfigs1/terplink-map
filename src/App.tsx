import { useState } from 'react'
import reactLogo from './assets/react.svg'
import { TerpLinkMap } from './TerpLinkMap'
import './App.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <TerpLinkMap />
    </div>
  )
}

export default App

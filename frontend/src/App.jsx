import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Editor from './pages/Editor.jsx'

function App() {
  return (
    <Router>
      <div>
        <header style={{ background: '#1f2937', padding: '16px', color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Unbound Workflow Builder</h1>
        </header>

        <main style={{ padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor" element={<Editor />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
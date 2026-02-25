import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Evaluate from "./pages/Evaluate"
import History from "./pages/History"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluate" element={<Evaluate />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  )
}

export default App
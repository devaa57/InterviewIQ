import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        "https://interviewiq-backend-6sxz.onrender.com/login",
        { email, password }
      )

      localStorage.setItem("token", response.data.access_token)

      navigate("/dashboard")
    } catch (error) {
      setMessage(error.response?.data?.detail || "Login failed")
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login to InterviewIQ</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <br /><br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <br /><br />

          <button type="submit" style={{ width: "100%" }}>
            Login
          </button>
        </form>

        <br />

        <button
          className="secondary-btn"
          style={{ width: "100%" }}
          onClick={() => navigate("/register")}
        >
          Create Account
        </button>

        <p style={{ textAlign: "center", marginTop: "12px" }}>
          {message}
        </p>
      </div>
    </div>
  )
}

export default Login
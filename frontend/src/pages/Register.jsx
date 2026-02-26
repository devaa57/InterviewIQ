import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        "https://interviewiq-backend-6sxz.onrender.com/register",
        { email, password }
      )

      setMessage(response.data.message)
      setTimeout(() => navigate("/"), 1000)

    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Registration failed"
      )
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>

        <form onSubmit={handleRegister}>
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
            Register
          </button>
        </form>

        <br />

        <button
          className="secondary-btn"
          style={{ width: "100%" }}
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>

        <p style={{ textAlign: "center", marginTop: "12px" }}>
          {message}
        </p>
      </div>
    </div>
  )
}

export default Register
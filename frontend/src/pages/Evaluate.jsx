import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Evaluate() {
  const navigate = useNavigate()

  const [role, setRole] = useState("")
  const [difficulty, setDifficulty] = useState("")

  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState(null)

  const [phase, setPhase] = useState("setup") // setup | answer | result
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) navigate("/")
  }, [])

  const generateQuestion = async () => {
    const token = localStorage.getItem("token")

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "https://interviewiq-backend-6sxz.onrender.com/generate-questions",
        { role, difficulty },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // assuming it returns array of questions
      const firstQuestion = response.data.questions
        ? response.data.questions[0]
        : response.data[0]

      setQuestion(firstQuestion)
      setPhase("answer")

    } catch (err) {
      setError("Failed to generate question")
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    const token = localStorage.getItem("token")

    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "https://interviewiq-backend-6sxz.onrender.com/evaluate-answer",
        { question, answer },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setResult(response.data)
      setPhase("result")

    } catch (err) {
      setError("Evaluation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>AI Interview Simulator</h2>

      <button
        className="secondary-btn"
        onClick={() => navigate("/dashboard")}
      >
        Back to Dashboard
      </button>

      <br /><br />

      {error && <p>{error}</p>}
      {loading && <p>Processing...</p>}

      {phase === "setup" && (
        <div className="card">
          <h3>Interview Setup</h3>

          <input
            placeholder="Enter Role (e.g. Backend Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

          <br /><br />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Select Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <br /><br />

          <button onClick={generateQuestion}>
            Generate Question
          </button>
        </div>
      )}

      {phase === "answer" && (
        <div className="card">
          <h3>Question</h3>
          <p><strong>{question}</strong></p>

          <textarea
            rows="6"
            placeholder="Write your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <br /><br />

          <button onClick={submitAnswer}>
            Submit Answer
          </button>
        </div>
      )}

      {phase === "result" && result && (
        <div className="card">
          <h3>Evaluation Result</h3>

          <p><strong>Overall Score:</strong> {result.overall_score}</p>
          <p>Accuracy: {result.technical_accuracy}</p>
          <p>Depth: {result.depth}</p>
          <p>Clarity: {result.clarity}</p>

          <p><strong>Strengths:</strong> {result.strengths}</p>
          <p><strong>Improvements:</strong> {result.improvements}</p>

          <br />

          <button onClick={() => {
            setPhase("setup")
            setAnswer("")
            setQuestion("")
            setResult(null)
          }}>
            Start New Question
          </button>
        </div>
      )}
    </div>
  )
}

export default Evaluate
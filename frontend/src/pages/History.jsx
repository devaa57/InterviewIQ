import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/")
      return
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          "https://interviewiq-backend-6sxz.onrender.com/interview-history",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        setHistory(response.data)
      } catch (err) {
        setError("Failed to load history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div>
      <h2>Interview History</h2>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>

      <hr />

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && history.length === 0 && (
        <p>No interviews yet.</p>
      )}

      {history.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Date</th>
              <th>Question</th>
              <th>Answer</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Depth</th>
              <th>Clarity</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td>
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td>{item.question}</td>
                <td>{item.answer}</td>
                <td>{item.overall_score}</td>
                <td>{item.technical_accuracy}</td>
                <td>{item.depth}</td>
                <td>{item.clarity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default History
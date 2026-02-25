import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from "recharts"

function Dashboard() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/")
      return
    }

    const fetchData = async () => {
      try {
        const analyticsRes = await axios.get(
          "http://127.0.0.1:8000/analytics",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        const historyRes = await axios.get(
          "http://127.0.0.1:8000/interview-history",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        setAnalytics(analyticsRes.data)
        setHistory(historyRes.data)

      } catch (err) {
        setError("Failed to load dashboard data")
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const chartData = history.map((item, index) => ({
    name: `Attempt ${index + 1}`,
    score: item.overall_score,
    accuracy: item.technical_accuracy,
    depth: item.depth,
    clarity: item.clarity
  }))

  return (
  <div className="container">
    <div className="header">
      <h2>InterviewIQ Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>

    <div style={{ marginBottom: "20px" }}>
      <button onClick={() => navigate("/evaluate")}>
        Evaluate New Answer
      </button>
      <button
        className="secondary-btn"
        onClick={() => navigate("/history")}
      >
        View Interview History
      </button>
    </div>

    {error && <p>{error}</p>}

    {analytics ? (
      <div className="card">
        <h3>Performance Overview</h3>

        <div className="stats-grid">
          <div className="stat-box">
            <div>Total Interviews</div>
            <div className="stat-value">
              {analytics.total_interviews}
            </div>
          </div>

          <div className="stat-box">
            <div>Average Score</div>
            <div className="stat-value">
              {analytics.average_score}
            </div>
          </div>

          <div className="stat-box">
            <div>Accuracy</div>
            <div className="stat-value">
              {analytics.average_accuracy}
            </div>
          </div>

          <div className="stat-box">
            <div>Depth</div>
            <div className="stat-value">
              {analytics.average_depth}
            </div>
          </div>

          <div className="stat-box">
            <div>Clarity</div>
            <div className="stat-value">
              {analytics.average_clarity}
            </div>
          </div>
        </div>

        <br />

        <p>
          <strong>Weakest Area:</strong> {analytics.weakest_area}
        </p>
        <p>
          <strong>Strongest Area:</strong> {analytics.strongest_area}
        </p>
      </div>
    ) : (
      <p>Loading analytics...</p>
    )}

    {history.length > 0 && (
      <>
        <div className="card">
          <h3>Score Trend</h3>
          <LineChart width={900} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#4f46e5" />
          </LineChart>
        </div>

        <div className="card">
          <h3>Metric Comparison</h3>
          <BarChart width={900} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#4f46e5" />
            <Bar dataKey="depth" fill="#10b981" />
            <Bar dataKey="clarity" fill="#f59e0b" />
          </BarChart>
        </div>
      </>
    )}
  </div>
)
}

export default Dashboard
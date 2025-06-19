import React, { useState } from "react";
import axios from "axios";
import { RingLoader } from 'react-spinners';
import './App.css'; // Ensure this is at the top

function App() {
  const [formData, setFormData] = useState({
    jobType: "",
    workExperience: "",
    location: "",
    companyType: "",
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    const response = await axios.post("https://interq-groq.onrender.com/api/interview-questions", formData);

    const fetchedQuestions = response.data.questions || [];

    // Make sure empty answers become "**"
    const updatedQuestions = fetchedQuestions.map((qa) => ({
      question: qa.question || "",
      answer: qa.answer && qa.answer.trim() !== "" ? qa.answer : "**",
    }));

    setQuestions(updatedQuestions);
  } catch (err) {
    console.error("❌ Request failed:", err);

    if (err.response?.status === 503) {
      setError("⚠️ Backend is unavailable. Possibly Groq API error or rate limit. Please try again shortly.");
    } else if (err.response?.status === 500) {
      setError("⚠️ Internal server error. Try again later or check your inputs.");
    } else {
      setError("⚠️ Something went wrong. Please try again.");
    }
  }
  setLoading(false);
};

  return (
    <div style={{ backgroundColor: "#f7f9fc", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        backgroundColor: "#fffffF", padding: "50px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        width: "700px", border: "1px solid #dbe3e7"
      }}>
        <h1 style={{
          textAlign: "right", color: "#2c3e50", fontSize: "32px", fontWeight: "bolder", marginBottom: "70px",
          position: "relative", fontFamily: "Roboto, sans-serif", left: "120px",
        }}>
          InterQ
          <span style={{
            fontSize: "20px", color: "#2c3e50", position: "relative", bottom: "-35px", left: "-250px", fontWeight: "bold"
          }}>
            AI-Powered Interview Question Generator
          </span>
        </h1> 
        


        <form onSubmit={handleSubmit} style={{
          display: "flex", flexDirection: "column", gap: "25px", maxWidth: "500px", margin: "0 auto"
        }}>
          <label style={{ color: "#34495e", fontWeight: "bold", fontSize: "18px" }}>Job Type</label>
          <input
            type="text"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            required
            style={{
              padding: "14px", borderRadius: "12px", border: "2px solid #3498db", backgroundColor: "#f4f9fc",
              color: "#2c3e50", fontSize: "16px", transition: "border 0.3s ease"
            }}
          />

          <label style={{ color: "#34495e", fontWeight: "bold", fontSize: "18px" }}>Work Experience (years)</label>
          <input
            type="text"
            name="workExperience"
            value={formData.workExperience}
            onChange={handleChange}
            required
            style={{
              padding: "14px", borderRadius: "12px", border: "2px solid #3498db", backgroundColor: "#f4f9fc",
              color: "#2c3e50", fontSize: "16px", transition: "border 0.3s ease"
            }}
          />

          <label style={{ color: "#34495e", fontWeight: "bold", fontSize: "18px" }}>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            style={{
              padding: "14px", borderRadius: "12px", border: "2px solid #3498db", backgroundColor: "#f4f9fc",
              color: "#2c3e50", fontSize: "16px", transition: "border 0.3s ease"
            }}
          />

          <label style={{ color: "#34495e", fontWeight: "bold", fontSize: "18px" }}>Company Type (Startup, MNC, etc.)</label>
          <input
            type="text"
            name="companyType"
            value={formData.companyType}
            onChange={handleChange}
            required
            style={{
              padding: "14px", borderRadius: "12px", border: "2px solid #3498db", backgroundColor: "#f4f9fc",
              color: "#2c3e50", fontSize: "16px", transition: "border 0.3s ease"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#3498db", color: "#ffffff", padding: "14px", border: "none", borderRadius: "12px",
              cursor: "pointer", fontWeight: "bold", fontSize: "18px", transition: "background-color 0.3s ease"
            }}
          >
            {loading ? <RingLoader size={30} color={"#ffffff"} /> : "Generate Questions"}
          </button>
        </form>

        {error && <p style={{
          color: "#e74c3c", textAlign: "center", fontWeight: "bold", marginTop: "20px", fontSize: "18px"
        }}>{error}</p>}

        <ul style={{
          marginTop: "30px", paddingLeft: "0", listStyleType: "none", color: "#2c3e50"
        }}>
          {questions.map((qa, index) => (
            <li key={index} style={{
              backgroundColor: "#ecf6ff", padding: "16px", marginBottom: "12px", borderRadius: "12px", color: "#2c3e50",
              border: "2px solid #3498db", fontSize: "16px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
            }}>
              <div style={{ marginBottom: "8px" }}>
                <strong>Q:</strong> {qa.question}
              </div>
              <div>
                <strong>A:</strong> {qa.answer}
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}

export default App;

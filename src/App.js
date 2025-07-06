import React, { useState, useEffect } from "react";
import axios from "axios";
import { RingLoader } from 'react-spinners';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    jobType: "",
    workExperience: "",
    topic: "",
    companyType: "",
    difficulty: "",
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speakingUtterance, setSpeakingUtterance] = useState(null);

  const toggleSpeak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return alert("Speech synthesis not supported in this browser.");

    if (speakingUtterance) {
      synth.cancel();
      setSpeakingUtterance(null);
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = "en-US";

    utter.onend = () => setSpeakingUtterance(null);

    synth.speak(utter);
    setSpeakingUtterance(utter);
  };

  useEffect(() => {
    axios.get("https://ai-interview-backend-5es5.onrender.com/health")
      .then(() => console.log("✅ Backend warm-up done"))
      .catch((err) => console.warn("⚠️ Backend warm-up failed", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("https://ai-interview-backend-5es5.onrender.com/api/interview-questions", formData);
      const fetchedQuestions = response.data.questions || [];
      const updatedQuestions = fetchedQuestions.map((qa) => ({
        question: qa?.question?.trim() || "**Question missing**",
        answer: qa?.answer?.trim() || "**Answer missing**",
      }));
      setQuestions(updatedQuestions);
    } catch (err) {
      console.error("❌ Request failed:", err);
      if (err.response?.status === 503) {
        setError("⚠️ Backend is waking up or busy. Please wait a few seconds and try again.");
      } else if (err.response?.status === 500) {
        setError("⚠️ Internal server error. Try again later or check your inputs.");
      } else {
        setError("⚠️ Something went wrong. Please try again.");
      }
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    const input = document.getElementById("pdf-content");
    const pdf = new jsPDF("p", "pt", "a4");
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 100;

    pdf.setFontSize(20);
    pdf.setTextColor("#2c3e50");
    pdf.text("InterQ – AI Interview Questions", margin, 50);

    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position;

    while (heightLeft > 0) {
      pdf.addPage();
      position = margin;
      heightLeft -= pageHeight - margin;
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");
    }

    pdf.save("Interview_Questions.pdf");
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
          {["jobType", "workExperience", "topic", "companyType"].map((field, idx) => (
            <React.Fragment key={idx}>
              <label style={{ color: "#34495e", fontWeight: "bold", fontSize: "18px" }}>
                {field === "jobType" && "Job Type"}
                {field === "workExperience" && "Work Experience (years)"}
                {field === "topic" && "Topic"}
                {field === "companyType" && "Company Type (Startup, MNC, etc.)"}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                style={{
                  padding: "14px", borderRadius: "12px", border: "2px solid #3498db", backgroundColor: "#f4f9fc",
                  color: "#2c3e50", fontSize: "16px"
                }}
              />
            </React.Fragment>
          ))}

          <label style={{ color: "#34495e", fontWeight: "bold", fontSize: "18px" }}>Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
            style={{
              padding: "14px", borderRadius: "12px", border: "2px solid #3498db", backgroundColor: "#f4f9fc",
              color: "#2c3e50", fontSize: "16px"
            }}
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#3498db", color: "#ffffff", padding: "14px", border: "none", borderRadius: "12px",
              cursor: "pointer", fontWeight: "bold", fontSize: "18px"
            }}
          >
            {loading ? <RingLoader size={30} color={"#ffffff"} /> : "Generate Questions"}
          </button>
        </form>

        {loading && questions.length === 0 && (
          <p style={{ textAlign: "center", color: "#2980b9", marginTop: "20px" }}>
            ⏳ Generating interview questions... Please wait.
          </p>
        )}

        {error && <p style={{
          color: "#e74c3c", textAlign: "center", fontWeight: "bold", marginTop: "20px", fontSize: "18px"
        }}>{error}</p>}

        <div id="pdf-content">
          <ul style={{
            marginTop: "30px", paddingLeft: "0", listStyleType: "none", color: "#2c3e50"
          }}>
            {questions.map((qa, index) => (
              <li key={index} style={{
                backgroundColor: "#ecf6ff", padding: "16px", marginBottom: "12px", borderRadius: "12px", color: "#2c3e50",
                border: "2px solid #3498db", fontSize: "16px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span><strong>Q:</strong> {qa.question}</span>
                  <button onClick={() => toggleSpeak(qa.question)} title="Play/Stop Question" style={{
                    background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#3498db"
                  }}>🔊</button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                  <span><strong>A:</strong> {qa.answer}</span>
                  <button onClick={() => toggleSpeak(qa.answer)} title="Play/Stop Answer" style={{
                    background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#3498db"
                  }}>🔊</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {questions.length > 0 && (
          <button
            onClick={downloadPDF}
            style={{
              backgroundColor: "#2ecc71", color: "#fff", padding: "12px 20px",
              border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer",
              marginTop: "30px", display: "block", marginLeft: "auto", marginRight: "auto"
            }}
          >
            📄 Download as PDF
          </button>
        )}
      </div>
    </div>
  );
}

export default App;

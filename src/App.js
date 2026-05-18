import React, { useState, useEffect } from "react";
import axios from "axios";
import { RingLoader } from 'react-spinners';
import jsPDF from "jspdf";
import { FaSun, FaMoon, FaVolumeUp, FaStop } from 'react-icons/fa';
import './App.css';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    
    // If running locally
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // If we are on React dev server port (usually 3000), point to backend port 5000
      if (window.location.port === "3000") {
        return "http://localhost:5000";
      }
      // If served directly by local backend
      return "";
    }
    
    // If served directly by deployed backend on Render
    if (hostname.includes("onrender.com")) {
      return "";
    }
  }

  // Fallback to the production backend on Render
  return "https://ai-interview-backend-5es5.onrender.com";
};

const API_BASE_URL = getApiBaseUrl();

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
  const [speakingText, setSpeakingText] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.name.includes("Google US English") || (v.lang === "en-US" && v.name.includes("Natural"))) 
           || voices.find(v => v.lang === "en-US") 
           || voices[0];
  };

  const toggleSpeak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speakingText === text) {
      synth.cancel();
      setSpeakingText(null);
      return;
    }
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = getBestVoice();
    utter.rate = 0.95;
    utter.onend = () => setSpeakingText(null);
    synth.speak(utter);
    setSpeakingText(text);
  };

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "workExperience") {
      if (value !== "" && !/^\d*$/.test(value)) return;
    }
    if (["jobType", "topic", "companyType"].includes(name)) {
      if (value !== "" && !/^[a-zA-Z\s]*$/.test(value)) return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jobType || !formData.workExperience || !formData.topic || !formData.companyType || !formData.difficulty) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/interview-questions`, formData);
      setQuestions(response.data.questions || []);
    } catch (err) {
      setError("Failed to generate questions. Please check your connection.");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 25;

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("InterQ Interview Preparation Report", margin, yPos);
    yPos += 10;

    // Meta Info
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100);
    pdf.text(`Role: ${formData.jobType} | Difficulty: ${formData.difficulty}`, margin, yPos);
    yPos += 15;

    const categories = ["TECHNICAL", "BEHAVIORAL", "SITUATIONAL"];

    categories.forEach(cat => {
      const filtered = questions.filter(q => q.category.toUpperCase() === cat);
      if (filtered.length === 0) return;

      // Section Header
      if (yPos > pageHeight - 30) { pdf.addPage(); yPos = 20; }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(52, 152, 219); // Blue accent
      pdf.text(cat, margin, yPos);
      pdf.line(margin, yPos + 2, margin + 40, yPos + 2);
      yPos += 12;

      filtered.forEach((qa) => {
        // Prepare Question text
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        const qLines = pdf.splitTextToSize(`Q: ${qa.question}`, contentWidth);
        
        // Prepare Answer text
        pdf.setFont("helvetica", "normal");
        const aLines = pdf.splitTextToSize(`A: ${qa.answer}`, contentWidth);

        const totalBlockHeight = (qLines.length * 6) + (aLines.length * 6) + 10;

        // Page break check
        if (yPos + totalBlockHeight > pageHeight - margin) {
          pdf.addPage();
          yPos = 20;
        }

        // Draw Question
        pdf.setFont("helvetica", "bold");
        pdf.text(qLines, margin, yPos);
        yPos += qLines.length * 6;

        // Draw Answer
        pdf.setFont("helvetica", "normal");
        pdf.text(aLines, margin, yPos);
        yPos += (aLines.length * 6) + 8; // Extra spacing after each block
      });
      yPos += 5; // Extra spacing after each category
    });

    pdf.save(`InterQ_${formData.jobType.replace(/\s+/g, '_')}_Prep.pdf`);
  };

  const categories = ["TECHNICAL", "BEHAVIORAL", "SITUATIONAL"];

  return (
    <div className="app-container">
      <div className="main-card">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>

        <header className="header">
          <h1>
            InterQ
            <span>AI-Powered Interview Preparation Engine</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="interview-form">
          <div className="input-group">
            <label>Job Type</label>
            <input name="jobType" type="text" placeholder="e.g. Node.js Developer" value={formData.jobType} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Work Experience (Years)</label>
            <input name="workExperience" type="text" inputMode="numeric" placeholder="e.g. 2" value={formData.workExperience} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Topic</label>
            <input name="topic" type="text" placeholder="e.g. Database Design" value={formData.topic} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Company Type</label>
            <input name="companyType" type="text" placeholder="e.g. MNC" value={formData.companyType} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Difficulty</label>
            <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
              <option value="">Select Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="generate-btn">
            {loading ? <RingLoader size={20} color="#fff" /> : "Generate Questions"}
          </button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <div id="pdf-content">
          {categories.map(cat => {
            const filtered = questions.filter(q => q.category.toUpperCase() === cat);
            if (filtered.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="section-title">{cat}</h2>
                {filtered.map((qa, i) => (
                  <div key={i} className="question-item">
                    <div className="qa-row">
                      <div className="qa-text-content">
                        <p className="q-text">
                          <strong>Q:</strong> {qa.question}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleSpeak(qa.question)} 
                        className="speak-btn"
                        title="Click to hear the pronunciation"
                      >
                        {speakingText === qa.question ? <FaStop /> : <FaVolumeUp />}
                      </button>
                    </div>

                    <div className="qa-row mt-12">
                      <div className="qa-text-content">
                        <p className="a-text">
                          <strong>A:</strong> {qa.answer}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleSpeak(qa.answer)} 
                        className="speak-btn"
                        title="Click to hear the pronunciation"
                      >
                        {speakingText === qa.answer ? <FaStop /> : <FaVolumeUp />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {questions.length > 0 && (
          <button onClick={downloadPDF} className="download-btn">Download as PDF</button>
        )}
      </div>
    </div>
  );
}

export default App;

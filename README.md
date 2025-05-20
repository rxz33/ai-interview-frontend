🧠 AI Interview Question Generator - InterQ
AI Interview Generator is a smart, personalized interview preparation platform that dynamically generates role-specific interview questions and suggested answers using Gemini AI. It helps job seekers practice effectively with customized question sets based on job roles, experience, and skill level.

🚀 Tech Stack
Layer	Technology
Frontend	React, Tailwind CSS
Backend	Node.js, Express.js
AI Engine	Gemini AI (Google)
Database	MongoDB

✨ Key Features
🎯 Job-role based question sets

🤖 AI-generated sample answers using Gemini

📊 Question difficulty selection (Easy/Medium/Hard)

🔄 Dynamic follow-up and clarification questions

💾 Save sessions for later review

🔐 Secure and scalable backend using Express and MongoDB

📁 Project Structure
bash
Copy code
ai-interview-generator/
├── backend/             # Express.js API
│   ├── routes/          # All API routes
│   ├── controllers/     # Business logic
│   ├── services/        # Gemini AI integration logic
│   ├── models/          # Mongoose schemas
│   └── .env             # API keys & DB credentials (ignored)
├── frontend/            # React + Tailwind UI
│   └── src/
│       └── components/  # Reusable React components
│       └── pages/       # Page views
├── .gitignore
├── package.json
└── README.md
🧑‍💻 Getting Started
1️⃣ Clone the repository
bash
Copy code
git clone https://github.com/your-username/ai-interview-generator.git
cd ai-interview-generator
2️⃣ Backend Setup (Node.js + Express)
bash
Copy code
cd backend
npm install
# Add your credentials in a `.env` file
npm start
Your backend will run on http://localhost:5000

3️⃣ Frontend Setup (React + Tailwind)
bash
Copy code
cd frontend
npm install
npm run dev
Frontend will run on http://localhost:5173

🔑 Environment Variables
In the backend/.env file:

env
Copy code
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/interview-db
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
🔒 Make sure .env is listed in .gitignore.

📬 API Endpoints (Sample)
Method	Endpoint	Description
POST	/api/generate	Generate questions using Gemini
GET	/api/questions/:id	Fetch question set by ID
POST	/api/save	Save a question-answer session

📄 License
MIT License © 2025 Rashi

🙋‍♀️ About the Creator
Made with 💡 by Rashi
GitHub @rashi-github06
# CareerAI - Agentic AI Career Development Platform

An AI-powered career development platform that uses multiple specialized agents to help students and early professionals navigate their career journey.

## 🌟 Features

- **AI-Powered Career Analysis**: Multi-agent system that observes, reasons, plans, and acts
- **Career Readiness Score**: Dynamic scoring based on skills, goals, and market requirements
- **Skill Gap Detection**: Automatically identify missing skills with priority rankings
- **Smart Learning Roadmaps**: AI-generated weekly learning plans
- **Opportunity Matching**: Job recommendations with match percentages
- **Feedback Processing**: Turn rejections into insights for improvement

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    Tailwind CSS + TypeScript                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PHP Backend (API Gateway)                   │
│                    JWT Auth + MySQL Connection                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Python Agent Service                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Reasoning  │  │ Skill Gap  │  │  Planner   │  │  Feedback  │ │
│  │   Agent    │  │   Agent    │  │   Agent    │  │   Agent    │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│                                                                  │
│                    ┌────────────────┐                            │
│                    │   Orchestrator │                            │
│                    └────────────────┘                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MySQL Database                            │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
agent/
├── frontend/                 # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React contexts (Auth, Theme)
│   │   ├── layouts/          # Page layouts
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   └── types/            # TypeScript types
│   └── package.json
│
├── php-backend/              # PHP API Gateway
│   ├── config/               # Database configuration
│   ├── controllers/          # API controllers
│   ├── core/                 # Core classes (Router, JWT, etc.)
│   ├── services/             # External service integrations
│   └── index.php             # Main entry point
│
├── python-agents/            # Python Agent Service
│   ├── agents/               # Individual agent modules
│   │   ├── reasoning_agent.py
│   │   ├── skill_gap_agent.py
│   │   ├── planner_agent.py
│   │   ├── feedback_agent.py
│   │   └── embedding_agent.py
│   ├── orchestrator.py       # Agent coordinator
│   ├── app.py                # Flask API server
│   └── requirements.txt
│
└── database/                 # Database schema
    └── schema.sql
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PHP 8.0+
- Python 3.9+
- MySQL 8.0+

### 1. Database Setup

```sql
mysql -u root -p < database/schema.sql
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### 3. PHP Backend Setup

```bash
cd php-backend
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Configure your web server (Apache/Nginx) to point to php-backend/
# Or use PHP's built-in server for development:
php -S localhost:8080
```

### 4. Python Agent Service Setup

```bash
cd python-agents
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys and database credentials

python app.py
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8080/api
```

**PHP Backend (.env)**
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=career_agent
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your-jwt-secret-key
PYTHON_AGENT_URL=http://localhost:5000
```

**Python Agents (.env)**
```
OPENROUTER_API_KEY=your-openrouter-api-key
DB_HOST=localhost
DB_PORT=3306
DB_NAME=career_agent
DB_USER=root
DB_PASS=your_password
```

## 🤖 Agent System

### Reasoning Agent
Analyzes user profiles and determines optimal career paths based on skills, interests, and market trends.

### Skill Gap Agent
Compares current skills against target role requirements and prioritizes learning areas.

### Planner Agent
Generates personalized weekly learning roadmaps with actionable tasks.

### Feedback Agent
Processes rejections and feedback to extract actionable insights.

### Embedding Agent
Creates semantic embeddings for memory storage and similarity matching.

## 📱 Pages

- **Landing Page**: Hero section with feature highlights
- **Login/Signup**: Authentication with JWT
- **Onboarding**: 4-step profile setup wizard
- **Dashboard**: Career readiness score, stats, AI insights
- **Profile**: Education, skills, interests management
- **Skill Gap**: Current vs target skills analysis
- **Roadmap**: Weekly learning timeline with tasks
- **Applications**: Job application tracker with AI matching
- **Feedback**: Rejection/interview feedback analysis

## 🎨 Design System

- **Primary Color**: Indigo (#6366f1)
- **Accent Color**: Violet (#8b5cf6)
- **Typography**: Inter font family
- **Style**: Glassmorphism with subtle gradients
- **Dark Mode**: Full support with CSS variables

## 📄 License

MIT License

## 🙏 Acknowledgments

- Built with React, TypeScript, Tailwind CSS
- AI powered by OpenRouter API
- Inspired by Linear, Notion, and Vercel design systems

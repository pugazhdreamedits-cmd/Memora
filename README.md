# MEMORA — Personalized Memory Decay Prediction & Intelligent Revision System

> **"Learn. Remember. Predict. — Your memory has a pattern."**

---

## Project Overview

MEMORA is a data-science-powered learning platform that predicts how quickly an individual student forgets learned material and recommends personalized revision timing.

Unlike generic spaced-repetition tools, MEMORA learns *your* individual retention pattern from your actual study behavior and quiz performance.

---

## Problem Statement

Students commonly revise on fixed schedules that ignore individual memory characteristics. A student who retains well after 7 days is over-revising; a student who forgets within 2 days is under-revising. MEMORA uses machine learning to personalize this timing.

---

## Core Pipeline

```
Student → Study Session → Initial Quiz → Dataset
→ Data Preprocessing → ML Training (LR / DT / RF)
→ Retention Forecast → Forgetting Risk Classification
→ Personalized Revision Recommendation → Recovery Quiz
→ Updated Memory Profile
```

---

## Features

- **Cinematic landing page** with animated neural network
- **Authentication** (register/login, password hashing, protected routes)
- **Interactive onboarding** — creates initial memory profile
- **Memory Core** — animated SVG visualization of overall retention health
- **Memory Landscape** — interactive topic nodes with size/color indicating retention strength
- **Memory DNA** — radar chart of 5 personal memory dimensions
- **Retention Forecast** — forgetting curve with actual vs predicted overlay
- **Recovery Mode** — focused quiz sessions for high-risk topics, shows before/after improvement
- **MEMORA Intelligence** — rule & model-based personalized insights (not a generic chatbot)
- **Analytics** — model comparison charts, retention distribution, study method analysis
- **History** — filterable timeline of sessions, quizzes, and retention records
- **Demo Mode** — pre-seeded realistic data with +1/+3/+7 day simulation
- **Fully responsive** — mobile, tablet, desktop

---

## Technology Stack

### Frontend (this project)
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Recharts (charts)
- React Router DOM
- Sonner (toasts)
- Lucide React (icons)

### ML (client-side JS implementation)
- **Logistic Regression** — gradient descent, sigmoid activation
- **Decision Tree** — Gini impurity splitting, configurable max depth
- **Random Forest** — 10 trees, bootstrap sampling
- Ebbinghaus forgetting curve model for retention decay
- Personalized stability and decay rate calculation

### Data Storage
- localStorage (all data persisted in browser)

---

## ML Methodology

### Features Used
| Feature | Description |
|---|---|
| study_duration | Minutes spent studying |
| difficulty | 0=Easy, 1=Medium, 2=Hard |
| study_method | Encoded 0–5 |
| initial_score | Self-assessed understanding |
| revision_count | Previous revision sessions |
| days_since_study | Time since last study |
| previous_retention | Prior quiz-based retention |
| quiz_score | Latest quiz performance |
| quiz_accuracy | Ratio of correct answers |
| quiz_time | Completion time in seconds |

### Target Variable
- `retention_score`: 0–100 (continuous)
- `forgetting_risk`: LOW / MEDIUM / HIGH (classification)

### Model Selection
Best model selected automatically by highest F1 score.

### Risk Thresholds (Application-Defined)
- **LOW**: 80–100%
- **MEDIUM**: 50–79%
- **HIGH**: 0–49%

*These thresholds are application-defined, not scientifically universal.*

---

## Demo Mode

Login with:
- Email: `demo@memora.ai`
- Password: `demo1234`

The demo account includes:
- 10 pre-seeded study sessions across CS, ML, and Data Science topics
- Realistic retention records
- Pre-built memory profile
- Synthetic ML training dataset (50 records)

Use the **+1d / +3d / +7d** buttons in the sidebar to simulate time progression.

---

## Running the Project

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Project Limitations

- Dataset is self-collected and limited to individual user data
- Small dataset may reduce ML prediction accuracy
- Risk thresholds are application-defined, not peer-reviewed
- Memory is influenced by many factors (sleep, stress, context) not captured here
- Model predictions are probabilistic estimates, not guaranteed outcomes
- No backend server — all data stored in browser localStorage

---

## Future Enhancements

1. **Backend persistence** — replace localStorage with Supabase/PostgreSQL
2. **Larger longitudinal dataset** — multi-user aggregated (anonymized) training
3. **Advanced time-series models** — LSTM for sequential retention patterns
4. **Knowledge tracing** — Bayesian Knowledge Tracing (BKT)
5. **Adaptive quiz generation** — AI-generated questions from study notes
6. **Optional LLM integration** — natural language insights and explanations
7. **Mobile application** — React Native port
8. **Reinforcement learning** — for optimal revision scheduling (DQN)
9. **Wearable/context data** — study environment, time of day, sleep quality

---

## Screenshots

*(Add screenshots after running the application)*

---

*MEMORA — A Data Science mini-project. All predictions are model estimates. Not a medical or scientific tool.*

# CuraWise.AI

AI-powered health companion. Describe your symptoms, get a disease prediction, personalized recommendations, and a downloadable PDF report — all backed by a Random Forest classifier and Groq LLMs.

---

## Features

- **Disease Prediction** — Select 3+ symptoms; a Random Forest model predicts the most likely condition with a confidence score
- **Personalized Recommendations** — Precautions, diet, medications, and workout advice for each predicted condition
- **AI Chat** — Streaming medical assistant powered by Groq (LLaMA 3.3 70B, LLaMA 4 Scout, LLaMA 3.1 8B)
- **PDF Reports** — Generate and download a detailed health report with patient name and age
- **Clean UI** — React frontend with a minimal dark design (Inter font, Tailwind CSS)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router |
| Backend | FastAPI, Uvicorn |
| ML | scikit-learn RandomForestClassifier, pandas, NumPy |
| LLM | Groq API (streaming SSE) |
| PDF | ReportLab |
| Auth | localStorage (Firebase integration planned) |

---

## Project Structure

```
CuraWise.AI/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── routers/
│   │   ├── predict.py           # POST /api/predict
│   │   ├── chat.py              # POST /api/chat (SSE streaming)
│   │   └── report.py            # POST /api/report (PDF download)
│   ├── services/
│   │   ├── ml_service.py        # Random Forest inference
│   │   ├── groq_service.py      # Groq streaming chat
│   │   └── data_service.py      # CSV lookups (descriptions, diets, etc.)
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Predict.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Report.jsx
│   │   │   └── Login.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ConfidenceBar.jsx
│   │   └── services/
│   │       └── api.js           # Axios + SSE fetch client
│   └── package.json
├── Data/
│   ├── Training.csv             # Augmented training data (11.5 MB)
│   ├── description.csv
│   ├── precautions_df.csv
│   ├── diets.csv
│   ├── medications.csv
│   └── workout_df.csv
├── Model/
│   ├── model.pkl                # Trained RandomForest (200 estimators)
│   └── label_encoder.pkl
└── .env
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- [Groq API key](https://console.groq.com/)

### 1. Clone

```bash
git clone https://github.com/Chitvan21/CuraWise.AI.git
cd CuraWise.AI
```

### 2. Backend setup

```bash
cd backend
python -m venv ../.venv
source ../.venv/bin/activate        # Windows: ..\.venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the API server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The backend must be running at `http://localhost:8000`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/symptoms` | List all 132 available symptoms |
| `POST` | `/api/predict` | Predict disease from symptom list |
| `POST` | `/api/chat` | Streaming chat (SSE, `text/event-stream`) |
| `POST` | `/api/report` | Generate PDF report (returns blob) |

### Predict request

```json
{
  "symptoms": ["itching", "skin_rash", "nodal_skin_eruptions"]
}
```

### Predict response

```json
{
  "disease": "Fungal infection",
  "confidence": 94,
  "description": "...",
  "precautions": ["..."],
  "diets": ["..."],
  "medications": ["..."],
  "workout": ["..."]
}
```

---

## ML Model

The classifier is a `RandomForestClassifier(n_estimators=200)` trained on a binary symptom matrix. Each row represents a patient case; each column is a symptom (0 or 1). The target is the disease label.

- **Training data**: `Data/Training.csv` — augmented dataset across 41 disease classes
- **Accuracy**: >98% on the held-out test split
- **Inference**: symptoms → binary vector → model → top-1 prediction + confidence (`predict_proba` max)

To retrain:

```bash
cd backend
python augment_and_retrain.py
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLM chat |

---

## Disclaimer

CuraWise.AI is for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.

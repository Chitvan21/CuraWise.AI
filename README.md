# CuraWise.AI 🩺

> **Your Personalized AI-Powered Health Companion** 🪄👨🏻‍⚕️

**CuraWise.AI** is an intelligent, machine learning-driven application designed to empower you with instant health insights. By analyzing your symptoms, it predicts potential conditions and provides comprehensive, personalized health advice—from medications and diets to workout plans and precautions.

---

## 🌟 Key Features

*   **🔍 Disease Prediction**: Advanced ML algorithms analyze your symptoms to predict potential diseases with high accuracy.
*   **🤖 AI Health Assistant**: Chat with our smart medical bot powered by **Groq** (Llama3, Mixtral, Gemma) for instant answers to your health queries.
*   **💊 Personalized Recommendations**: Get tailored advice including:
    *   **Medications**: Suggested over-the-counter or prescription options.
    *   **Diets**: Nutrition plans to aid recovery.
    *   **Workouts**: Exercises suitable for your condition.
    *   **Precautions**: Do's and don'ts to manage your health.
*   **📑 Instant Health Reports**: Generate and download detailed PDF health reports for your records or to share with a doctor.
*   **🌍 Multilingual Support**: Communicate in your preferred language—our AI detects and translates seamlessly.
*   **🔐 Secure & Private**: Robust user authentication via **Firebase** ensures your data remains safe.

---

## 🛠️ Tech Stack

*   **Frontend**: [Streamlit](https://streamlit.io/)
*   **Machine Learning**: [Scikit-learn](https://scikit-learn.org/), Pandas, NumPy
*   **AI/LLM**: [Groq API](https://groq.com/) (Llama3, Mixtral, Gemma)
*   **Backend & Auth**: [Firebase](https://firebase.google.com/)
*   **Utilities**: ReportLab (PDF Generation), LangDetect, Translate

---

## 🚀 Getting Started

Follow these steps to set up CuraWise.AI locally.

### Prerequisites

*   **Python 3.12** or higher
*   **Git**
*   **API Keys**:
    *   **Groq API Key**: For the chatbot functionality.
    *   **Firebase Credentials**: For user authentication.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Chitvan21/CuraWise.AI.git
    cd CuraWise.AI
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configuration**
    *   Create a `.env` file in the root directory and add your Groq API key:
        ```env
        GROQ_API_KEY=your_groq_api_key_here
        ```
    *   Place your `firebase-credentials.json` file in the project root directory.

4.  **Run the Application**
    ```bash
    streamlit run app.py
    ```

---
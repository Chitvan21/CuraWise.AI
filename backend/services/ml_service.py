import pickle
import numpy as np
import pandas as pd
from pathlib import Path

_PROJECT_ROOT = Path(__file__).parent.parent.parent

_training_df = pd.read_csv(_PROJECT_ROOT / "Data" / "Training.csv")
_training_cols = [c for c in _training_df.columns if c != "prognosis"]
symptoms_dict = {col: idx for idx, col in enumerate(_training_cols)}
diseases_list = {i: label for i, label in enumerate(sorted(_training_df["prognosis"].unique()))}

with open(_PROJECT_ROOT / "Model" / "model.pkl", "rb") as f:
    _model = pickle.load(f)


def predict(symptoms: list[str]) -> tuple[str, float]:
    input_vector = np.zeros(len(_training_cols))
    for symptom in symptoms:
        if symptom in symptoms_dict:
            input_vector[symptoms_dict[symptom]] = 1
    predicted_index = _model.predict([input_vector])[0]
    disease = diseases_list[predicted_index]
    decision_scores = _model.decision_function([input_vector])[0]
    exp_scores = np.exp(decision_scores - np.max(decision_scores))
    confidence = float(exp_scores[predicted_index] / exp_scores.sum() * 100)
    return disease, round(confidence, 1)


def get_symptoms_list() -> list[str]:
    return _training_cols

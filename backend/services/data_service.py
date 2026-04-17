import ast
import numpy as np
import pandas as pd
from pathlib import Path

_DATA_DIR = Path(__file__).parent.parent.parent / "Data"

symptom_data = pd.read_csv(_DATA_DIR / "symptoms_df.csv")
precautions_data = pd.read_csv(_DATA_DIR / "precautions_df.csv")
workout_data = pd.read_csv(_DATA_DIR / "workout_df.csv")
desc_data = pd.read_csv(_DATA_DIR / "description.csv")
diets_data = pd.read_csv(_DATA_DIR / "diets.csv")
medication_data = pd.read_csv(_DATA_DIR / "medications.csv")

precautions_data.replace("nan", None, inplace=True)
precautions_data = precautions_data.where(pd.notnull(precautions_data), None)


def get_desc(disease: str) -> str:
    row = desc_data[desc_data["Disease"].str.strip() == disease.strip()]
    return str(row["Description"].values[0])


def get_precautions(disease: str) -> list[str]:
    row = precautions_data[precautions_data["Disease"].str.strip() == disease.strip()]
    values = row.values[0][2:]
    return [v for v in values if v is not None]


def get_workout(disease: str) -> list[str]:
    rows = workout_data[workout_data["disease"].str.strip() == disease.strip()]["workout"].values
    return [str(w) for w in rows]


def get_diet(disease: str) -> list[str]:
    row = diets_data[diets_data["Disease"].str.strip() == disease.strip()]
    return ast.literal_eval(row["Diet"].values[0])


def get_medication(disease: str) -> list[str]:
    row = medication_data[medication_data["Disease"].str.strip() == disease.strip()]
    return ast.literal_eval(row["Medication"].values[0])

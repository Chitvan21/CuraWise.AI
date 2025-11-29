import pandas as pd
import numpy as np
import pickle
import os

# Load the training data
data = pd.read_csv('Data/Training.csv')

# Print basic info about the dataset
print(f"Training data shape: {data.shape}")
print(f"Number of features (symptoms): {data.shape[1] - 1}")  # -1 for the prognosis column

# Print the count of mild_fever
print(f"Total mild_fever occurrences: {data['mild_fever'].sum()}")

# Find which diseases have mild_fever as a symptom
print("\nDiseases with mild_fever as a symptom:")
for disease in data['prognosis'].unique():
    count = data[data['prognosis'] == disease]['mild_fever'].sum()
    if count > 0:
        print(f"- {disease}: {count}")

# Check specifically for Urinary tract infection
uti_data = data[data['prognosis'] == 'Urinary tract infection']
print(f"\nUTI entries: {len(uti_data)}")
print(f"UTI with mild_fever: {uti_data['mild_fever'].sum()}")

# Let's see what symptoms UTI is associated with
uti_symptoms = []
for column in data.columns:
    if column != 'prognosis' and uti_data[column].sum() > 0:
        uti_symptoms.append((column, uti_data[column].sum()))

print("\nUTI is associated with these symptoms:")
for symptom, count in sorted(uti_symptoms, key=lambda x: x[1], reverse=True):
    print(f"- {symptom}: {count}")

# Load the model and check its expectations
try:
    model_path = os.path.join('Model', 'model.pkl')
    model = pickle.load(open(model_path, 'rb'))
    print(f"\nModel type: {type(model)}")
    
    # For SVC model, try to extract feature dimensions
    if hasattr(model, 'support_vectors_'):
        print(f"Model support vectors shape: {model.support_vectors_.shape}")
        print(f"Expected feature dimension: {model.support_vectors_.shape[1]}")
    
    # If it's a pipeline or different model type
    if hasattr(model, 'n_features_in_'):
        print(f"Model expected features: {model.n_features_in_}")
    
    # Print the actual column names from training data for reference
    print("\nActual columns in Training.csv:")
    print(list(data.columns[:-1]))  # All columns except prognosis
    
    # Get the number of unique diseases
    print(f"\nNumber of unique diseases/conditions: {len(data['prognosis'].unique())}")
    print(f"Diseases list: {sorted(data['prognosis'].unique())}")
    
except Exception as e:
    print(f"Error loading model: {e}")

# Load prediction model and symptoms_dict directly
# This avoids importing from app since it might have streamlit session state issues
symptoms_dict = {
    'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3,
    'shivering': 4, 'chills': 5, 'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8,
    'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 'burning_micturition': 12,
    'spotting_urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16,
    'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20,
    'lethargy': 21, 'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24,
    'high_fever': 25, 'sunken_eyes': 26, 'breathlessness': 27, 'sweating': 28,
    'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32,
    'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36,
    'back_pain': 37, 'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40,
    'mild_fever': 41, 'yellow_urine': 42, 'yellowing_of_eyes': 43, 'acute_liver_failure': 44,
    'fluid_overload': 45, 'swelling_of_stomach': 46, 'swelled_lymph_nodes': 47, 'malaise': 48,
    'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51,
    'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55,
    'chest_pain': 56, 'weakness_in_limbs': 57, 'fast_heart_rate': 58,
    'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 'bloody_stool': 61,
    'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65,
    'bruising': 66, 'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69,
    'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71, 'brittle_nails': 72,
    'swollen_extremeties': 73, 'excessive_hunger': 74, 'extra_marital_contacts': 75,
    'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78
}

# Load diseases list
diseases_list = {
    15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholesterol',
    14: 'Drug Reaction', 33: 'Peptic ulcer disease', 1: 'AIDS', 12: 'Diabetes',
    17: 'Gastroenteritis', 6: 'Bronchial Asthma', 23: 'Hypertension', 30: 'Migraine',
    7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)', 28: 'Jaundice',
    29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'Hepatitis A',
    19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E',
    3: 'Alcoholic hepatitis', 36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia',
    13: 'Dimorphic hemorrhoids (piles)', 18: 'Heart attack', 39: 'Varicose veins',
    26: 'Hypothyroidism', 24: 'Hyperthyroidism', 25: 'Hypoglycemia', 31: 'Osteoarthritis',
    5: 'Arthritis', 0: '(vertigo) Paroxysmal Positional Vertigo', 2: 'Acne',
    38: 'Urinary tract infection', 35: 'Psoriasis', 27: 'Impetigo'
}

# FIXED prediction function that matches the app.py fix
def fixed_predict(symptoms):
    model_path = os.path.join('Model', 'model.pkl')
    model = pickle.load(open(model_path, 'rb'))
    # Create an input vector with the correct size that the model expects
    expected_features = 132
    input_vector = np.zeros(expected_features)
    for symptom in symptoms:
        if symptom in symptoms_dict:
            symptom_index = symptoms_dict[symptom]
            if symptom_index < expected_features:
                input_vector[symptom_index] = 1
    return diseases_list[model.predict([input_vector])[0]]

try:
    # Test with just mild_fever
    print(f"\nPrediction with just mild_fever: {fixed_predict(['mild_fever'])}")
    
    # Test with multiple symptoms
    print(f"Prediction with mild_fever + chills: {fixed_predict(['mild_fever', 'chills'])}")
    print(f"Prediction with mild_fever + headache: {fixed_predict(['mild_fever', 'headache'])}")
    
    # Test with common UTI symptoms
    print(f"Prediction with burning_micturition: {fixed_predict(['burning_micturition'])}")
    print(f"Prediction with burning_micturition + bladder_discomfort: {fixed_predict(['burning_micturition', 'bladder_discomfort'])}")
    
    # Test with mild_fever + UTI symptoms
    print(f"Prediction with mild_fever + burning_micturition: {fixed_predict(['mild_fever', 'burning_micturition'])}")
    
    # Test with diseases that actually have mild_fever
    print(f"Prediction with mild_fever + skin_rash: {fixed_predict(['mild_fever', 'skin_rash'])}")  # Chicken pox

except Exception as e:
    print(f"Error during prediction: {e}") 
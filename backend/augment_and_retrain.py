import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

ROOT = Path(__file__).parent.parent
np.random.seed(42)

# Load original data
df = pd.read_csv(ROOT / 'Data/Training.csv')
cols = [c for c in df.columns if c != 'prognosis']
print(f"Original dataset: {df.shape[0]} rows, {len(cols)} symptoms, {df['prognosis'].nunique()} diseases")

augmented_rows = []

for disease in df['prognosis'].unique():
    disease_df = df[df['prognosis'] == disease][cols]

    # Get the core symptoms for this disease (appear in >50% of rows)
    symptom_freq = disease_df.mean()
    core_symptoms = symptom_freq[symptom_freq >= 0.5].index.tolist()
    optional_symptoms = symptom_freq[(symptom_freq > 0) & (symptom_freq < 0.5)].index.tolist()

    # Generate 400 augmented rows per disease
    for _ in range(400):
        row = np.zeros(len(cols))

        # Always include most core symptoms (drop 1-2 randomly to simulate partial presentation)
        n_drop = np.random.randint(0, min(3, len(core_symptoms)))
        selected_core = np.random.choice(core_symptoms,
                                          size=len(core_symptoms) - n_drop,
                                          replace=False) if n_drop > 0 else core_symptoms
        for s in selected_core:
            row[cols.index(s)] = 1

        # Randomly include some optional symptoms
        if optional_symptoms:
            n_optional = np.random.randint(0, len(optional_symptoms) + 1)
            if n_optional > 0:
                selected_optional = np.random.choice(optional_symptoms,
                                                      size=n_optional,
                                                      replace=False)
                for s in selected_optional:
                    row[cols.index(s)] = 1

        # Ensure at least 2 symptoms are present
        if row.sum() >= 2:
            augmented_rows.append(list(row) + [disease])

# Build augmented dataframe
aug_df = pd.DataFrame(augmented_rows, columns=cols + ['prognosis'])
combined_df = pd.concat([df, aug_df], ignore_index=True)
combined_df = combined_df.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"Augmented dataset: {combined_df.shape[0]} rows")
print(f"Rows per disease (sample): {combined_df.groupby('prognosis').size().describe()}")

# Save augmented Training.csv (backup original first)
import shutil
shutil.copy(ROOT / 'Data/Training.csv', ROOT / 'Data/Training_original.csv')
combined_df.to_csv(ROOT / 'Data/Training.csv', index=False)
print("Saved augmented Training.csv (original backed up as Training_original.csv)")

# Train Random Forest on augmented data
X = combined_df[cols]
y = combined_df['prognosis']

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1, min_samples_leaf=2)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f"\nTest Accuracy: {accuracy_score(y_test, y_pred)*100:.2f}%")

# Cross-validation
cv_scores = cross_val_score(model, X, y_encoded, cv=5, scoring='accuracy')
print(f"5-fold CV Accuracy: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*100:.2f}%)")

# Save model and encoder
pickle.dump(model, open(ROOT / 'Model/model.pkl', 'wb'))
pickle.dump(le, open(ROOT / 'Model/label_encoder.pkl', 'wb'))
print("\nModel and label encoder saved.")

# Test realistic cases
print("\n--- Realistic prediction tests ---")
test_cases = {
    'Common Cold (partial)':     ['high_fever', 'cough', 'continuous_sneezing', 'runny_nose'],
    'Common Cold (more)':        ['high_fever', 'cough', 'runny_nose', 'congestion', 'throat_irritation'],
    'Fungal infection':          ['itching', 'skin_rash', 'nodal_skin_eruptions'],
    'Diabetes':                  ['fatigue', 'weight_loss', 'polyuria', 'excessive_hunger'],
    'Allergy':                   ['continuous_sneezing', 'shivering', 'chills', 'watering_from_eyes'],
    'Malaria':                   ['high_fever', 'sweating', 'headache', 'nausea', 'chills'],
    'Migraine':                  ['headache', 'nausea', 'blurred_and_distorted_vision', 'excessive_hunger'],
    'UTI':                       ['burning_micturition', 'bladder_discomfort', 'continuous_feel_of_urine', 'foul_smell_of urine'],
}
for label, symptoms in test_cases.items():
    vec = np.zeros(len(cols))
    for s in symptoms:
        if s in cols:
            vec[cols.index(s)] = 1
    pred_idx = model.predict([vec])[0]
    pred_disease = le.inverse_transform([pred_idx])[0].strip()
    prob = model.predict_proba([vec])[0][pred_idx] * 100
    print(f"  {label:35s} -> {pred_disease} ({prob:.1f}%)")

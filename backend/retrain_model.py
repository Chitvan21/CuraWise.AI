import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

ROOT = Path(__file__).parent.parent

df = pd.read_csv(ROOT / 'Data/Training.csv')
X = df.drop('prognosis', axis=1)
y = df['prognosis']

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f'Accuracy: {accuracy_score(y_test, y_pred)*100:.2f}%')

pickle.dump(model, open(ROOT / 'Model/model.pkl', 'wb'))
pickle.dump(le, open(ROOT / 'Model/label_encoder.pkl', 'wb'))
print('Model and label encoder saved.')

cols = [c for c in df.columns if c != 'prognosis']
test_cases = {
    'Fungal infection': ['itching', 'skin_rash', 'nodal_skin_eruptions'],
    'Diabetes': ['fatigue', 'weight_loss', 'polyuria', 'excessive_hunger'],
    'Common Cold': ['high_fever', 'cough', 'continuous_sneezing', 'runny_nose'],
    'Allergy': ['continuous_sneezing', 'shivering', 'chills', 'watering_from_eyes'],
}
for expected, symptoms in test_cases.items():
    vec = np.zeros(len(cols))
    for s in symptoms:
        if s in cols:
            vec[cols.index(s)] = 1
    pred_idx = model.predict([vec])[0]
    pred_disease = le.inverse_transform([pred_idx])[0]
    prob = model.predict_proba([vec])[0][pred_idx] * 100
    print(f'Expected={expected} | Predicted={pred_disease} ({prob:.1f}%)')

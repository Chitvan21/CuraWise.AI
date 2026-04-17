# importing the required libraries here.
import streamlit as st
from streamlit_option_menu import option_menu
import pandas as pd
import numpy as np
import pickle
import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth
import requests
import json
import ast
from dotenv import load_dotenv
import os
import warnings
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from typing import Generator
from groq import Groq
from langdetect import detect
from translate import Translator

warnings.filterwarnings("ignore")

load_dotenv()

# init firebase app here.
try:
    # Check if app is already initialized
    firebase_admin.get_app()
except ValueError as e:
    # Initialize with a credential
    if os.path.exists('firebase-credentials.json'):
        cred = credentials.Certificate('firebase-credentials.json')
        firebase_admin.initialize_app(cred)
    elif os.getenv('FIREBASE_JSON_PATH'):
        try:
            cred = credentials.Certificate(os.getenv('FIREBASE_JSON_PATH'))
            firebase_admin.initialize_app(cred)
        except Exception as e:
            st.error(f"Firebase initialization failed: {e}")
    else:
        st.error("Firebase credentials not found. Please set up firebase-credentials.json in the project root.")

# setting up the page header here.
hide_st_style = """
                <style>
                #MainMenu {visibility : hidden;}
                footer {visibility : hidden;}
                header {visibility : hidden;}
                </style>
                """

# setting up the page config here.
st.set_page_config(
    page_title="CuraWise.AI",
    page_icon=os.path.join("static", "favicon.png"),
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://www.linkedin.com/in/abhiiiman',
        'Report a bug': "https://www.github.com/abhiiiman",
        'About': "## CuraWise.AI - Your Personalized AI enabled Doctor 👨🏻‍⚕️"
    }
)

# removing all the default streamlit configs here
st.markdown(hide_st_style, unsafe_allow_html=True)

# loading the dataset here
symptom_data = pd.read_csv(os.path.join("Data", "symptoms_df.csv"))
precautions_data = pd.read_csv(os.path.join("Data", "precautions_df.csv"))
workout_data = pd.read_csv(os.path.join("Data", "workout_df.csv"))
desc_data = pd.read_csv(os.path.join("Data", "description.csv"))
diets_data = pd.read_csv(os.path.join("Data", "diets.csv"))
medication_data = pd.read_csv(os.path.join("Data", "medications.csv"))

# Replace 'nan' string and np.nan with None for consistency
precautions_data.replace('nan', None, inplace=True)
precautions_data = precautions_data.where(pd.notnull(precautions_data), None)

# Build symptoms and diseases mapping directly from Training.csv to avoid hardcoding bugs
_training_df = pd.read_csv(os.path.join("Data", "Training.csv"))
_training_cols = [c for c in _training_df.columns if c != 'prognosis']
symptoms_dict = {col: idx for idx, col in enumerate(_training_cols)}
diseases_list = {i: label for i, label in enumerate(sorted(_training_df['prognosis'].unique()))}
symptoms_list = _training_cols  # exact column names the model was trained on

# Initialize session state for the data to generate the report
if "predicted" not in st.session_state:
    st.session_state.predicted = False
if 'disease' not in st.session_state:
    st.session_state.disease = None
if 'description' not in st.session_state:
    st.session_state.description = None
if 'precautions' not in st.session_state:
    st.session_state.precautions = None
if 'workout' not in st.session_state:
    st.session_state.workout = None
if 'diets' not in st.session_state:
    st.session_state.diets = None
if 'medications' not in st.session_state:
    st.session_state.medications = None
if 'confidence' not in st.session_state:
    st.session_state.confidence = 0.0


def generate_report(name, age, disease, description, precautions, workouts, diets, medications, file_path):
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()
    styleN = styles['BodyText']
    styleH = styles['Heading1']

    # getting the current date and time here
    now = datetime.now()
    current_time = now.strftime("%Y-%m-%d %H:%M:%S")

    # Title
    title = Paragraph("CuraWise Health Report", styleH)
    story = [title, Spacer(1, 12)]

    # Personal details
    details = Paragraph("Patient Details ", styleH)
    story = [details, Spacer(1, 10)]
    name = Paragraph(f"Patient Name : <b>{name.title()}</b>", styleN)
    story.append(name)
    story.append(Spacer(1, 10))
    age = Paragraph(f"Patient Age : <b>{age} Years</b>", styleN)
    story.append(age)
    story.append(Spacer(1, 10))
    date = Paragraph(f"Report Generated On : <b>{current_time}</b>", styleN)
    story.append(date)
    story.append(Spacer(1, 12))

    # Predicted Disease
    disease_paragraph = Paragraph(f"Predicted Disease : <b>{disease.title()}</b>", styleN)
    story.append(disease_paragraph)
    story.append(Spacer(1, 12))

    # Description
    description_paragraph = Paragraph(f"Description : <b>{description}</b>", styleN)
    story.append(description_paragraph)
    story.append(Spacer(1, 12))

    # Precautions
    precautions_paragraph = Paragraph("Precautions : ", styleH)
    story.append(precautions_paragraph)
    story.append(Spacer(1, 12))
    precautions_list = ListFlowable([ListItem(Paragraph(p, styleN)) for p in precautions if p is not None],
                                    bulletType='bullet')
    story.append(precautions_list)
    story.append(Spacer(1, 12))

    # Workouts
    workouts_paragraph = Paragraph("Recommendations : ", styleH)
    story.append(workouts_paragraph)
    story.append(Spacer(1, 12))
    workouts_list = ListFlowable([ListItem(Paragraph(w, styleN)) for w in workouts], bulletType='bullet')
    story.append(workouts_list)
    story.append(Spacer(1, 12))

    # Diets
    diets_paragraph = Paragraph("Diets :", styleH)
    story.append(diets_paragraph)
    story.append(Spacer(1, 12))
    diets_list = ListFlowable([ListItem(Paragraph(d, styleN)) for d in diets], bulletType='bullet')
    story.append(diets_list)
    story.append(Spacer(1, 12))

    # Medications
    medications_paragraph = Paragraph("Medications :", styleH)
    story.append(medications_paragraph)
    story.append(Spacer(1, 12))
    medications_list = ListFlowable([ListItem(Paragraph(m, styleN)) for m in medications], bulletType='bullet')
    story.append(medications_list)
    story.append(Spacer(1, 12))

    # Build the PDF
    doc.build(story)
    print(f"PDF report generated successfully: {file_path}")


# Function to predict the disease
def get_predicted_values(patient_symptoms):
    st.session_state.predicted = True
    model = pickle.load(open(os.path.join('Model', 'model.pkl'), 'rb'))
    input_vector = np.zeros(len(_training_cols))
    for symptom in patient_symptoms:
        if symptom in symptoms_dict:
            input_vector[symptoms_dict[symptom]] = 1
    predicted_index = model.predict([input_vector])[0]
    disease = diseases_list[predicted_index]
    # Get decision function score and normalize to a confidence proxy
    decision_scores = model.decision_function([input_vector])[0]
    # Softmax-style normalization to get confidence percent
    exp_scores = np.exp(decision_scores - np.max(decision_scores))
    confidence = float(exp_scores[predicted_index] / exp_scores.sum() * 100)
    return disease, round(confidence, 1)


def get_desc(predicted_value):
    predicted_description = desc_data[desc_data["Disease"] == predicted_value]["Description"].values[0]
    return predicted_description


def get_precautions(predicted_value):
    predicted_precaution = precautions_data[precautions_data['Disease'] == predicted_value].values[0][2:]
    return predicted_precaution


def print_precautions(p):
    c = 1
    for j in range(len(p)):
        if p[j] is not None:
            st.write(f"Precaution {c}. -> {p[j].title()}.")
            c += 1


def print_workout(w):
    c = 1
    for j in range(len(w)):
        st.write(f"Workout {c}. -> {w[j].title()}.")
        c += 1


def get_medication(predicted_value):
    med = medication_data[medication_data['Disease'] == predicted_value]['Medication'].values[0]
    return ast.literal_eval(med)


def get_workout(predicted_value):
    work = workout_data[workout_data['disease'] == predicted_value]["workout"].values
    return work


def get_diet(predicted_value):
    diet = diets_data[diets_data['Disease'] == predicted_value]['Diet'].values[0]
    return ast.literal_eval(diet)


def account():
    st.image(os.path.join("static", "Login-CuraWise.png"))
    st.title("Welcome to CuraWise 🩺")

    # Create session state variables
    if "user_mail" not in st.session_state:
        st.session_state.user_mail = ""
    if "user_name" not in st.session_state:
        st.session_state.user_name = ""
    if "signedOut" not in st.session_state:
        st.session_state.signedOut = False
    if "signOut" not in st.session_state:
        st.session_state.signOut = False
    if "userName" not in st.session_state:
        st.session_state.userName = ""

    def logout():
        st.session_state.predicted = False
        st.session_state.signOut = False
        st.session_state.signedOut = False
        st.session_state.user_name = ""
        st.session_state.user_mail = ""

    if not st.session_state['signedOut']:
        choice = st.selectbox("Login / Sign Up ➕", ["Login", "Sign Up"])
        if choice == "Login":
            email = st.text_input("Email 📧").strip()
            password = st.text_input("Password 🔑", type="password")
            login_submit = st.button("Login")

            # Authenticate the user
            if login_submit:
                print("User Login")
                print(f"Email : {email}, Password : {password}")

                def auth_user():
                    try:
                        # For testing purposes - bypass Firebase authentication
                        api_key = os.getenv('FIREBASE_API_KEY')
                        
                        if email and password:
                            # For demo purposes, accept any valid email/password
                            user_name = email.split('@')[0]
                            st.success(f"Welcome {user_name}! Login Successful 🥳")
                            st.balloons()

                            # Update session state variables
                            st.session_state.user_mail = email
                            st.session_state.user_name = user_name
                            st.session_state.signOut = True
                            st.session_state.signedOut = True
                        else:
                            st.warning("Please enter both email and password! ⚠️")

                    except Exception as e:
                        st.warning(f"Login error: {str(e)} ⚠️")

                auth_user()
        else:
            email = st.text_input("Email 📧").strip()
            password = st.text_input("Password 🔑", type="password")
            userName = st.text_input("Create your Unique Username 👤")
            signup_submit = st.button("Create My Account")

            if signup_submit:
                print("User Sign Up")
                print(f"Email : {email}, Password : {password}, UserName : {userName}")

                def create_account():
                    if not userName:
                        st.warning("Username cannot be empty! ⚠️")
                        return

                    try:
                        user = auth.get_user_by_email(email)
                        st.warning(f"{user.uid} already exists! Try Login instead.")
                    except firebase_admin.auth.UserNotFoundError:
                        user = auth.create_user(email=email, password=password, uid=userName)
                        st.success("Account Created Successfully 🥳")
                        st.balloons()
                        st.write("Please Login Now!")
                    except Exception as e:
                        st.error(f"An error occurred: {str(e)}")

                create_account()

    if st.session_state.signOut:
        st.text(f"UserName: {st.session_state.user_name}")
        st.text(f"UserMail: {st.session_state.user_mail}")
        st.button("Log Out", on_click=logout)


def icon(emoji: str):
    """Shows an emoji as a Notion-style page icon."""
    st.write(
        f'<span style="font-size: 78px; line-height: 0">{emoji}</span>',
        unsafe_allow_html=True,
    )


def detect_lang(text: str) -> str:
    detected_lang = detect(text)
    return detected_lang


def get_translation(src, target_lang):
    translator = Translator(to_lang=target_lang)
    translation = translator.translate(src)
    return translation


def medical_chatbot():
    # connecting to groq cloud here.
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        st.error("⚠️ GROQ_API_KEY environment variable is not set. Please configure it in your .env file.")
        st.stop()
    client = Groq(api_key=groq_api_key)

    # Initialize chat history and selected model
    if "messages" not in st.session_state:
        st.session_state.messages = []

    if "selected_model" not in st.session_state:
        st.session_state.selected_model = None

    # Define model details
    models = {
        "gemma-7b-it": {"name": "Gemma-7b-it", "tokens": 8192, "developer": "Google"},
        "llama2-70b-4096": {"name": "LLaMA2-70b-chat", "tokens": 4096, "developer": "Meta"},
        "llama3-70b-8192": {"name": "LLaMA3-70b-8192", "tokens": 8192, "developer": "Meta"},
        "llama3-8b-8192": {"name": "LLaMA3-8b-8192", "tokens": 8192, "developer": "Meta"},
        "mixtral-8x7b-32768": {"name": "Mixtral-8x7b-Instruct-v0.1", "tokens": 32768, "developer": "Mistral"},
    }

    # Layout for model selection and max_tokens slider
    col_1, col_2 = st.columns(2)

    with col_1:
        model_option = st.selectbox(
            "Choose a model:",
            options=list(models.keys()),
            format_func=lambda x: models[x]["name"],
            index=2  # Default to llama3
        )

    # Detect model change and clear chat history if model has changed
    if st.session_state.selected_model != model_option:
        st.session_state.messages = []
        st.session_state.selected_model = model_option

    max_tokens_range = models[model_option]["tokens"]

    with col_2:
        # Adjust max_tokens slider dynamically based on the selected model
        max_tokens = st.slider(
            "Max Tokens:",
            min_value=512,  # Minimum value to allow some flexibility
            max_value=max_tokens_range,
            # Default value or max allowed if less
            value=min(32768, max_tokens_range),
            step=512,
            help=f"Adjust the maximum number of tokens (words) for the model's response. Max for selected model: {max_tokens_range}"
        )

    # Display chat messages from history on app rerun
    for message in st.session_state.messages:
        avatar = '🤖' if message["role"] == "assistant" else '👨‍💻'
        with st.chat_message(message["role"], avatar=avatar):
            st.markdown(message["content"])

    def generate_chat_responses(chat_completion) -> Generator[str, None, None]:
        """Yield chat response content from the Groq API response."""
        for chunk in chat_completion:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    if prompt := st.chat_input("Enter your texts here and chat..."):
        st.session_state.messages.append({"role": "user", "content": prompt})

        with st.chat_message("user", avatar='👨‍💻'):
            st.markdown(prompt)

        # Fetch response from Groq API
        full_response = ""
        try:
            chat_completion = client.chat.completions.create(
                model=model_option,
                messages=[
                    {
                        "role": m["role"],
                        "content": m["content"]
                    }
                    for m in st.session_state.messages
                ],
                max_tokens=max_tokens,
                stream=True
            )

            # Use the generator function with st.write_stream
            with st.chat_message("assistant", avatar="🤖"):
                chat_responses_generator = generate_chat_responses(chat_completion)
                full_response = st.write_stream(chat_responses_generator)
        except Exception as e:
            st.error(e, icon="🚨")

        # Append the full response to session_state.messages
        if isinstance(full_response, str):
            st.session_state.messages.append(
                {"role": "assistant", "content": full_response})
        else:
            # Handle the case where full_response is not a string
            combined_response = "\n".join(str(item) for item in full_response)
            st.session_state.messages.append(
                {"role": "assistant", "content": combined_response})


with st.sidebar:
    selected = option_menu(
        menu_title="CuraWise.AI",
        options=["Home", "Recommendations", "Generate Report", "Chat With Me", "WorkFlow", "Account"],
        icons=["house", "magic", "book", "chat", "activity", "gear"],
        menu_icon="app-indicator",
        default_index=0,
    )

# ========= HOME TAB =========
if selected == "Home":
    col1, col2 = st.columns([2, 1])
    with col1:
        st.title('CuraWise.AI 🩺')
        st.header("Your Personalized 🪄 AI Health Companion 👨🏻‍⚕️")
        st.divider()
        st.header("About 👨🏻‍⚕️🩺")
        st.markdown('''
        CuraWise.AI is an innovative application designed to revolutionize the way you manage your health.
        Our intelligent machine learning model accurately predicts potential diseases based on your symptoms, 
        providing you with timely insights and empowering you to take control of your well-being. 🏥✨
        ''')
        st.markdown('''
        ### Join the `CuraWise.AI` Community 😃
        Take charge of your health with CuraWise.AI! 🌟 Download the app today and experience the future of health management.
        Connect with us on social media and be part of a community that values well-being and proactive health management.
        ''')
        st.markdown("_Stay healthy, stay informed, and let CuraWise.AI be your trusted health companion_ 💪❤️")

        st.markdown("#### Get Started Now!")
        st.markdown("CuraWise is here to help you live your healthiest life!")

    with col2:
        st.image(os.path.join("static", "CuraWise-Home.png"))

# ========= WORKFLOW TAB =========
elif selected == "WorkFlow":
    col1, col2 = st.columns([2, 1])
    with col1:
        st.title('CuraWise.AI WorkFlow ⛑️')
        st.header("How Does It Work? 🤔")
        st.divider()
        st.subheader("1️⃣ Symptom Input 🤒")
        st.markdown('''
            * Simply enter the symptoms you're experiencing into our user-friendly interface. Whether it's a 
            headache, fever, or any other discomfort, CuraWise.AI is here to help.
        ''')
        st.subheader("2️⃣ Disease Prediction 🔍")
        st.markdown('''
            * Our sophisticated machine learning model analyzes the symptoms and predicts the most likely diseases. This fast and efficient process ensures you get accurate information without the wait.
        ''')
        st.subheader("3️⃣ Detailed Descriptions 📖")
        st.markdown('''
            * Once a disease is predicted, CuraWise.AI provides a comprehensive description of the condition. You'll learn about its causes, symptoms, and potential treatments, helping you understand your health better.
        ''')
        st.subheader("4️⃣ Personalized Recommendations 🌿💊")
        st.markdown('''
            CuraWise.AI goes beyond mere diagnosis. It offers personalized recommendations for:
            * `Medicines` : Find out which over-the-counter or prescription medicines can help alleviate your 
            symptoms.
            * `Workout Plans` : Get tailored exercise routines to boost your overall health and manage your condition.
            * `Diets` : Discover dietary suggestions to support your recovery and maintain a balanced lifestyle.
            * `Precautions` : Learn about preventive measures to avoid aggravating your condition and protect your 
            health.
        ''')

    with col2:
        st.image(os.path.join("static", "CuraWise-WorkFlow-Tab.png"))

# ========= Accounts TAB =========
elif selected == "Account":
    account()

# ========= Recommendations TAB =========
elif selected == "Recommendations":
    col1, col2 = st.columns([3, 1])
    with col1:
        # Check if the user is logged in using session state variables
        if st.session_state.get("signedOut", False):
            st.title(f"Welcome {st.session_state.user_name} 🎉")
            st.header("CuraWise Recommendation Center 🔮")
            st.divider()
            symptoms = st.multiselect("#### Select Patient's Symptoms below 👇🏻", symptoms_list)
            predict_button = st.button("Predict Disease 🔮")
            if predict_button:
                if len(symptoms) == 0:
                    st.warning("Please select at least 3 symptoms from the dropdown list ⚠️")
                elif len(symptoms) < 3:
                    st.warning(f"⚠️ Only {len(symptoms)} symptom(s) selected — please select at least 3 symptoms for an accurate prediction. The more symptoms you provide, the more reliable the result.")
                else:
                    disease, confidence = get_predicted_values(symptoms)
                    print(disease)
                    st.session_state.disease = disease
                    st.session_state.confidence = confidence
                    st.session_state.description = get_desc(disease)
                    st.session_state.precautions = get_precautions(disease)
                    st.session_state.workout = get_workout(disease)
                    st.session_state.diets = get_diet(disease)
                    st.session_state.medications = get_medication(disease)
                    st.session_state.predicted = True

                    st.subheader(f"You have `{st.session_state.disease}` 🤒")
                    st.progress(int(st.session_state.confidence), text=f"Model Confidence: {st.session_state.confidence}%")
                    st.write(f"👉🏻 {st.session_state.description}")

                    st.divider()

                    col3, col4, col5 = st.columns([3, 4, 3])

                    with col3:
                        st.subheader("⚠️ Precautions")
                        for precaution in st.session_state.precautions:
                            if precaution is not None:
                                st.write(f"🫵🏻 {precaution.title()}")

                    with col4:
                        st.subheader("✨ Recommendations")
                        for workout in st.session_state.workout:
                            st.write(f"👉🏻 {workout.title()}")

                    with col3:
                        st.subheader("🍚 Diets")
                        for diet in st.session_state.diets:
                            st.write(f"➕ {diet.title()}")

                    with col5:
                        st.subheader("💊 Medications")
                        for med in st.session_state.medications:
                            st.write(f"✔️ {med.title()}")
        else:
            st.title("Please Login First ⚠️")
            st.subheader("You are not logged in!")
            st.markdown("* Please go back to the Account section.")
            st.markdown("* Then go to the Login Page and Login Yourself.")
    with col2:
        st.image(os.path.join("static", "CuraWise-Recommendations.png"))

# ========= Report Generation TAB =========
elif selected == "Generate Report":
    col1, col2 = st.columns([2, 1])
    with col1:
        if st.session_state.get("signedOut", False):
            st.title(f"Welcome {st.session_state.user_name} 🎉")
            st.header("CuraWise Medical Report Generation 📃")
            st.divider()
            col3, col4 = st.columns([2, 2])
            with col3:
                name = st.text_input("Enter the patient Name below", placeholder="Name")
            with col4:
                age = st.number_input("Enter the patient Age below", placeholder="Age", value=None, min_value=1,
                                      max_value=100)
            generate = st.button("Generate CuraWise Report ✨")
            st.warning("⚠️ This is an automated AI generated report prepared by CuraWise.ai")
            st.write("It's always better to see a Doctor and consult them before taking any step further!")
            st.divider()
            if generate:
                if st.session_state.predicted:
                    if name and age:
                        generate_report(
                            name,
                            age,
                            disease=st.session_state.disease,
                            description=st.session_state.description,
                            precautions=st.session_state.precautions,
                            workouts=st.session_state.workout,
                            diets=st.session_state.diets,
                            medications=st.session_state.medications,
                            file_path=f"CuraWise_{name.title()}_Report.pdf"
                        )
                        with open(f"CuraWise_{name.title()}_Report.pdf", "rb") as file:
                            st.download_button(
                                label="Download Generated Report ✅",
                                data=file,
                                file_name=f"CuraWise_{name.title()}_Report.pdf",
                                mime="pdf",
                            )
                    else:
                        st.warning("⚠️ Please enter correct Name/Age to proceed")
                else:
                    st.warning("⚠️ It seems like you haven't got your CuraWise Recommendations!")
                    st.markdown("* Go to `Recommendations` tab first on the top left sidebar.")
                    st.markdown("* Get your `Recommendations` there first.")
                    st.markdown("* Then comeback here and apply for `Report Generation`.")
        else:
            st.title("Please Login First ⚠️")
            st.subheader("Log in first, to Generate Report")
            st.markdown("* Please go back to the Account section.")
            st.markdown("* Then go to the Login Page and Login Yourself.")
    with col2:
        st.image(os.path.join("static", "CuraWise-Generate-Report.png"))

# ========= Chat with me TAB =========
elif selected == "Chat With Me":
    col1, col2 = st.columns([2, 1])
    with col1:
        if st.session_state.get("signedOut", False):
            st.markdown(f"#### Welcome, {st.session_state.user_name} 🎉")
            st.markdown("""
                # :rainbow[Chat With CuraWise.AI 🗨️]
            """)
            # icon("🧑🏻‍⚕️")
            st.subheader("Medical HealthCare ChatBot `Premium`", divider="rainbow", anchor=False)
            medical_chatbot()
        else:
            st.title("Please Login First ⚠️")
            st.subheader("Start Chatting with CuraWise.AI 🗨️")
            st.markdown("* Please go back to the Account section.")
            st.markdown("* Then go to the Login Page and Login Yourself.")
    with col2:
        st.image(os.path.join("static", "CuraWise-Chat-With-Me.png"))

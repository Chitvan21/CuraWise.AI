import traceback
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SymptomRequest, PredictResponse
from services import ml_service, data_service
from auth import verify_token

router = APIRouter()


@router.get("/symptoms")
def get_symptoms():
    from services.ml_service import get_symptoms_list
    return {"symptoms": get_symptoms_list()}


@router.post("/predict", response_model=PredictResponse)
def predict(request: SymptomRequest, _user=Depends(verify_token)):
    if len(request.symptoms) < 3:
        raise HTTPException(
            status_code=400,
            detail="Please select at least 3 symptoms for accurate prediction",
        )
    try:
        disease, confidence = ml_service.predict(request.symptoms)
        return PredictResponse(
            disease=disease,
            confidence=confidence,
            description=data_service.get_desc(disease),
            precautions=data_service.get_precautions(disease),
            workout=data_service.get_workout(disease),
            diets=data_service.get_diet(disease),
            medications=data_service.get_medication(disease),
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

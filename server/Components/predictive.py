from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict
from .. import Classes, Hooks

router = APIRouter()

class PredictInput(BaseModel):
    symptoms: List[str]
    age: int

# historial de citas -> IA -> posibilidades
def calculate_probabilities(user_id) -> dict[str, float]:
    appointment_list = Hooks.Database.fetchall(f'''
        SELECT appointments.diagnose, appointments.date
        FROM appointments
        LEFT JOIN history ON appointments.history_id = history.id
        LEFT JOIN patient ON patient.id = history.patient_id
        LEFT JOIN users ON users.id = patient.user_id
        WHERE users.id = {user_id}
    ''')

    if not appointment_list.success:
        return {}

    # prediction = Hooks.AIModel.predict([Classes.Database.Appointments(diagnose=appointment[0], date=str(appointment[1])) for appointment in appointment_list.details])
    # Hooks.logger(prediction)

    return {}

@router.post("/diagnostic/predict", response_model=Classes.Aux.Response[Dict[str, float]])
def predict_diagnosis(
    user_id: int,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    # if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.History.Predict):
    #     raise Hooks.Auth.PermissionException()

    # Hooks.logger(Hooks.AIModel.message("Hola"))

    result = calculate_probabilities(user_id)
    return Hooks.Response(success=True, details=result)

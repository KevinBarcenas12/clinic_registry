from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from .. import Classes, auth, Hooks
from . import appointments, chats, history, users, livechat, predictive

#----------------------------------------------------------------

class Permission(BaseModel):
    permission: str

#----------------------------------------------------------------

router = APIRouter(
    # prefix="/api",
    responses={
        401: { "description": "Unauthorized" },
        200: { "description": "Successful request" },
    }
)

@router.post("/token", response_model=Classes.Auth.Token)
def get_user_token(request: OAuth2PasswordRequestForm = Depends()):
    return auth.get_token(request)

@router.get("/permissions", response_model=list[str])
def get_current_user_permissions(current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    return Hooks.Auth.get_permissions(current_user)

@router.get("/clinics", response_model=Classes.Aux.Response[list[Classes.Database.Clinic] | str])
def get_clinic_list(current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if not Hooks.Auth.has_permissions(current_user, Hooks.Auth.Permissions.Clinics.View):
        raise Hooks.Auth.PermissionException()

    clinics = Hooks.Database.fetchall(f'''
        SELECT
            id,
            name,
            location,
            phone
        FROM clinics
    ''')

    if not clinics.success:
        return Hooks.Response(success=False, details="Clinics not found.")

    clinic_list = [
        Classes.Database.Clinic(
            id=int(clinic[0]),
            name=clinic[1],
            location=clinic[2],
            phone=clinic[3],
        ) for clinic in clinics.details
    ]

    return Hooks.Response(success=True, details=clinic_list)

@router.get("/medical_plans", response_model=Classes.Aux.Response[list[Classes.Database.MedicalPlan] | str])
def get_clinic_top_list(current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if not Hooks.Auth.has_permissions(current_user, Hooks.Auth.Permissions.Clinics.View):
        raise Hooks.Auth.PermissionException()
    
    medical_plans = Hooks.Database.fetchall(f'''
        SELECT
            id,
            type,
            benefit_level,
            price_month,
            duration
        FROM medical_plans
    ''')

    if not medical_plans.success:
        return Hooks.Response(success=False, details="Clinics not found.")

    medical_plan_list = [
        Classes.Database.MedicalPlan(
            id=int(plan[0]),
            type=plan[1],
            benefit_level=int(plan[2]),
            price_month=int(plan[3]),
            duration=int(plan[4]),
        ) for plan in medical_plans.details
    ]

    return Hooks.Response(success=True, details=medical_plan_list)

@router.get("/medics")
def get_active_medics():
    medic_list = Hooks.Database.fetchall(f'''
        SELECT
            medic.id,
            medic.speciality,
            users.name,
            clinics.id,
            clinics.name,
            clinics.location,
            medic.active
        FROM medic
        LEFT JOIN clinics ON medic.clinic_id = clinics.id
        LEFT JOIN users ON medic.user_id = users.id
        WHERE medic.active = true AND medic.id > 8001
    ''')

    if not medic_list.success:
        return Hooks.Response(success=False, details=f"No medics found. {medic_list.details}")

    return Hooks.Response(success=True, details=[
        Classes.Database.Medic(
            id=int(medic[0]),
            speciality=medic[1],
            medic_name=medic[2],
            clinic_id=int(medic[3]),
            clinic_name=f"{medic[4]}, {medic[5]}",
            active=bool(medic[6])
        ) for medic in medic_list.details
    ])

# @router.get("/server")
# def get_server_permissions():
#     return Hooks

#----------------------------------------------------------------

router.include_router(users.users_router, prefix="/users")
router.include_router(users.medics_router, prefix="/medic")
router.include_router(users.patients_router, prefix="/patient")
router.include_router(appointments.router, prefix="/appointments")
router.include_router(chats.router, prefix="/chats")
router.include_router(history.router, prefix="/history")
router.include_router(livechat.router)
router.include_router(predictive.router)

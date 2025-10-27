from fastapi import Depends, APIRouter
from .. import Classes, Hooks
from ..links import Links

router = APIRouter()

@router.get(Links.History.current, response_model=Classes.Aux.Response[Classes.Database.History | str])
def get_history_from_current_user(current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.History.View.Self):
        raise Hooks.Auth.PermissionException()

    cursor = Hooks.Database.get_cursor()

    history_request = Hooks.Database.fetchone(
        query=f'''
            SELECT 
                history.id,
                medic_list.medic_id,
                medic_list.name,
                users.id,
                users.name,
                history.notes,
                history.created_at,
                history.last_modified_at
            FROM history
            LEFT JOIN patient ON patient.id = history.patient_id
            LEFT JOIN users ON users.id = patient.user_id
            LEFT JOIN (
                SELECT 
                    users.id as user_id,
                    medic.id as medic_id,
                    users.name as name
                FROM users
                LEFT JOIN medic ON medic.user_id = users.id
            ) as medic_list ON medic_list.medic_id = history.medic_id
            WHERE users.id = {current_user.id}
        ''',
        cursor=cursor,
        close=False
    )

    if not history_request.success:
        return Hooks.Response(success=False, details=f"History not found. {history_request.details}")

    history = Classes.Database.History(
        id=int(history_request.details[0]),
        medic_id=int(history_request.details[1]),
        medic_name=history_request.details[2],
        patient_id=int(history_request.details[3]),
        patient_name=history_request.details[4],
        notes=history_request.details[5],
        created_at=float(history_request.details[6]),
        last_modified_at=float(history_request.details[7]),
    )

    appointments_request = Hooks.Database.fetchall(
        query=f'''
            SELECT
                appointments.id,
                medic_list.medic_id,
                medic_list.name,
                users.id,
                users.name,
                appointments.date,
                appointments.diagnose,
                appointments.treatment,
                clinics.id,
                clinics.name,
                clinics.location
            FROM appointments
            LEFT JOIN users ON appointments.user_id = users.id
            LEFT JOIN (
                SELECT
                    users.id as user_id,
                    medic.id as medic_id,
                    users.name
                FROM users
                LEFT JOIN medic ON medic.user_id = users.id
            ) as medic_list ON medic_list.medic_id = appointments.medic_id
            LEFT JOIN clinics on appointments.clinic_id = clinics.id
            WHERE appointments.history_id = {history.id}
            ORDER BY appointments.date DESC
        ''',
        cursor=cursor,
        close=True
    )

    if not appointments_request.success:
        history.appointments = [appointments_request.details] # type: ignore
        return Hooks.Response(success=True, details=history)

    appointments = [
        Classes.Database.Appointments(
            id=int(appointment[0]),
            history_id=history.id,
            medic_id=int(appointment[1]),
            medic_name=appointment[2],
            user_id=int(appointment[3]),
            user_name=appointment[4],
            date=float(appointment[5]),
            diagnose=appointment[6],
            treatment=appointment[7],
            clinic_id=int(appointment[8]),
            clinic_name=f'{appointment[9]}, {appointment[10]}',
        ) for appointment in appointments_request.details
    ]
    history.appointments = appointments

    return Hooks.Response(success=True, details=history)

@router.get(Links.History.id, response_model=Classes.Aux.Response[Classes.Database.History | str])
def get_history_from_user_id(user_id: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if user_id != current_user.id:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.History.View.Others):
            raise Hooks.Auth.PermissionException()

    cursor = Hooks.Database.get_cursor()

    history_request = Hooks.Database.fetchone(
        query=f'''
            SELECT
                history.id,
                medic_list.medic_id,
                medic_list.name,
                users.id,
                users.name,
                history.notes,
                history.created_at,
                history.last_modified_at
            FROM history
            LEFT JOIN patient ON patient.id = history.patient_id
            LEFT JOIN (
                SELECT
                    medic.id as medic_id,
                    users.name as name
                FROM users
                LEFT JOIN medic ON users.id = medic.user_id
            ) as medic_list ON medic_list.medic_id = history.medic_id
            LEFT JOIN users ON users.id = patient.user_id
            WHERE users.id = {user_id}
        ''',
        cursor=cursor,
        close=False,
    )

    if not history_request.success:
        return Hooks.Response(success=False, details=f"History not found. {history_request.details}")

    history = Classes.Database.History(
        id=int(history_request.details[0]),
        medic_id=int(history_request.details[1]),
        medic_name=history_request.details[2],
        patient_id=int(history_request.details[3]),
        patient_name=history_request.details[4],
        notes=history_request.details[5],
        created_at=float(history_request.details[6]),
        last_modified_at=float(history_request.details[7]),
    )

    appointments_request = Hooks.Database.fetchall(
        query=f'''
            SELECT
                appointments.id,
                medic_list.medic_id,
                medic_list.name,
                users.id,
                users.name,
                appointments.date,
                appointments.diagnose,
                appointments.treatment,
                clinics.id,
                clinics.name,
                clinics.location
            FROM appointments
            LEFT JOIN users ON appointments.user_id = users.id
            LEFT JOIN (
                SELECT
                    users.id as user_id,
                    medic.id as medic_id,
                    users.name
                FROM users
                LEFT JOIN medic ON medic.user_id = users.id
            ) as medic_list ON medic_list.medic_id = appointments.medic_id
            LEFT JOIN clinics on appointments.clinic_id = clinics.id
            WHERE appointments.history_id = {history.id}
        ''',
        cursor=cursor,
        close=True
    )

    if not appointments_request.success:
        history.appointments = [appointments_request.details] # type: ignore
        return Hooks.Response(success=True, details=history)

    appointments = [
        Classes.Database.Appointments(
            id=int(appointment[0]),
            history_id=history.id,
            medic_id=int(appointment[1]),
            medic_name=appointment[2],
            user_id=int(appointment[3]),
            user_name=appointment[4],
            date=float(appointment[5]),
            diagnose=appointment[6],
            treatment=appointment[7],
            clinic_id=int(appointment[8]),
            clinic_name=f'{appointment[9]}, {appointment[10]}',
        ) for appointment in appointments_request.details
    ]
    history.appointments = appointments

    return Hooks.Response(success=True, details=history)

from fastapi import Depends, APIRouter
from .. import Classes, Hooks
from ..links import Links
from datetime import datetime, timedelta
import random
router = APIRouter()

@router.get(Links.Appointments.list, response_model=Classes.Aux.Response[list[Classes.Database.Appointments] | str])
def get_all_appointments(current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)): #-- appointment list from current_user.id --
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.View.Self): 
        raise Hooks.Auth.PermissionException()

    appointments_request = Hooks.Database.fetchall('''
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
            clinics.location, 
            appointments.history_id
        FROM appointments
        LEFT JOIN users ON appointments.user_id = users.id
        LEFT JOIN (
            SELECT users.id as user_id, medic.id as medic_id, users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = appointments.medic_id
        LEFT JOIN clinics on appointments.clinic_id = clinics.id
        ORDER BY appointments.date DESC
    ''')

    if not appointments_request.success:
        return Hooks.Response(success=False, details=f"No appointments found. {appointments_request.details}")

    appointments = [
        Classes.Database.Appointments(
            id=int(appointment[0]),
            history_id=int(appointment[11]),
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

    return Hooks.Response(success=True, details=appointments)

@router.get(Links.Appointments.top, response_model=Classes.Aux.Response[list[Classes.Database.Appointments] | str])
def get_top_appointments(top: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.View.All): 
        raise Hooks.Auth.PermissionException()

    appointments_request = Hooks.Database.fetchall(f'''
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
            clinics.location, 
            appointments.history_id
        FROM appointments
        LEFT JOIN users ON appointments.user_id = users.id
        LEFT JOIN (
            SELECT users.id as user_id, medic.id as medic_id, users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = appointments.medic_id
        LEFT JOIN clinics on appointments.clinic_id = clinics.id
        ORDER BY appointments.date DESC
        LIMIT {top}
    ''')

    if not appointments_request.success:
        return Hooks.Response(success=False, details=f"No appointments found. {appointments_request.details}")

    appointments = [
        Classes.Database.Appointments(
            id=int(appointment[0]),
            history_id=int(appointment[11]),
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

    return Hooks.Response(success=True, details=appointments)

@router.get(Links.Appointments.user_list, response_model=Classes.Aux.Response[list[Classes.Database.Appointments] | str])
def get_all_appointments_from_user_id(user_id: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)): #-- appointment list from current_user.id --
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.View.All): 
        raise Hooks.Auth.PermissionException()

    appointments_request = Hooks.Database.fetchall(f'''
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
            clinics.location,
            appointments.history_id
        FROM appointments
        LEFT JOIN users ON appointments.user_id = users.id
        LEFT JOIN (
            SELECT users.id as user_id, medic.id as medic_id, users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = appointments.medic_id
        LEFT JOIN clinics on appointments.clinic_id = clinics.id
        WHERE appointments.user_id = {user_id}
        ORDER BY appointments.date DESC
    ''')

    if not appointments_request.success:
        return Hooks.Response(success=False, details=f"No appointments found. {appointments_request.details}")

    appointments = [
        Classes.Database.Appointments(
            id=int(appointment[0]),
            history_id=int(appointment[11]),
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

    return Hooks.Response(success=True, details=appointments)

@router.get(Links.Appointments.user_top, response_model=Classes.Aux.Response[list[Classes.Database.Appointments] | str])
def get_top_appointments_from_user_id(user_id: int, top: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.View.Self): 
        raise Hooks.Auth.PermissionException()

    appointments_request = Hooks.Database.fetchall(f'''
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
            clinics.location,
            appointments.history_id
        FROM appointments
        LEFT JOIN users ON appointments.user_id = users.id
        LEFT JOIN (
            SELECT users.id as user_id, medic.id as medic_id, users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = appointments.medic_id
        LEFT JOIN clinics on appointments.clinic_id = clinics.id
        WHERE appointments.user_id = {user_id}
        ORDER BY appointments.date DESC
        LIMIT {top}
    ''')

    if not appointments_request.success:
        return Hooks.Response(success=False, details=f"No appointments found. {appointments_request.details}")

    appointments = [
        Classes.Database.Appointments(
            id=int(appointment[0]),
            history_id=int(appointment[11]),
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

    return Hooks.Response(success=True, details=appointments)

@router.get(Links.Appointments.id, response_model=Classes.Aux.Response[Classes.Database.Appointments | str])
def get_appointment_from_id(appointment_id: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):

    request = Hooks.Database.fetchone(f'''
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
            clinics.location,
            appointments.history_id
        FROM appointments
        LEFT JOIN users ON appointments.user_id = users.id
        LEFT JOIN (
            SELECT users.id as user_id, medic.id as medic_id, users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = appointments.medic_id
        LEFT JOIN clinics on appointments.clinic_id = clinics.id
        WHERE appointments.id = {appointment_id}
    ''')

    if not request.success:
        return Hooks.Response(success=False, details=f"No appointments found. {request.details}")

    appointment = Classes.Database.Appointments(
        id=int(request.details[0]),
        history_id=int(request.details[11]),
        medic_id=int(request.details[1]),
        medic_name=request.details[2],
        user_id=int(request.details[3]),
        user_name=request.details[4],
        date=float(request.details[5]),
        diagnose=request.details[6],
        treatment=request.details[7],
        clinic_id=int(request.details[8]),
        clinic_name=f'{request.details[9]}, {request.details[10]}',
    )

    Hooks.logger(f'{current_user.id = }, {appointment.user_id = }')

    if current_user.id != appointment.user_id:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.View.Others):
            raise Hooks.Auth.PermissionException()

    return Hooks.Response(success=True, details=appointment)

@router.put(Links.Appointments.add, response_model=Classes.Aux.Response[str])
def put_new_appointment(appointment: Classes.Database.Appointments, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if appointment.user_id == current_user.id:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.Create.Self):
            raise Hooks.Auth.PermissionException()
    else:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.Create.Others):
            raise Hooks.Auth.PermissionException()

    request = Hooks.Database.commit(query=f'''
        INSERT INTO appointments (
            history_id,
            medic_id,
            clinic_id,
            date,
            diagnose,
            treatment,
            user_id
        )
        VALUES (
            {appointment.history_id},
            {appointment.medic_id},
            {appointment.clinic_id},
            {appointment.date},
            {appointment.diagnose},
            {appointment.treatment},
            {appointment.user_id}
        )
    ''')

    if not request.success:
        return Hooks.Response(success=False, details=f"Failed to create appointment. {request.details}")

    return Hooks.Response(success=True, details=request.details)

def request_an_appointment(user_id: int):
    current_user = Hooks.Auth.get_user_from_id(user_id)

    if not current_user:
        return Hooks.Response(success=False, details=f"User doesn't exist.")

    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Appointments.Create.Self):
        return Hooks.Response(success=False, details="Not enough permissions.")

    (found_history, user_history) = Hooks.Database.fetchone(f'''
        SELECT history.id
        FROM history
        LEFT JOIN patient ON history.patient_id = patient.id
        LEFT JOIN users ON patient.user_id = users.id
        WHERE users.id = {current_user.id}
    ''')

    Hooks.logger(found_history[1])
    Hooks.logger(user_history[1])

    if not found_history[1]:
        return Hooks.Response(success=False, details="User doesn't have any history.")

    found_medic, _medic_list = Hooks.Database.fetchall(f'''
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

    Hooks.logger(found_medic[1])
    Hooks.logger(_medic_list[1])

    if not found_medic[1]:
        return Hooks.Response(success=False, details="There are no medics available.")

    medic_list = [
        Classes.Database.Medic(
            id=int(medic[0]),
            speciality=medic[1],
            medic_name=medic[2],
            clinic_id=int(medic[3]),
            clinic_name=f'{medic[4]}, {medic[5]}',
            active=True,
        ) for medic in _medic_list[1]
    ]

    date = datetime.now() + timedelta(days=random.randint(1, 7))
    date = date.replace(hour=random.randint(5, 18), minute=0, second=0, microsecond=0)
    Hooks.logger(date.ctime())

    medic = random.choice(medic_list)

    Hooks.logger(f'{user_history[1]},{medic.id},{medic.clinic_id},{date.timestamp() * 1000},{current_user.id}')

    created, appointment_id = Hooks.Database.fetchone(f'''
        INSERT INTO appointments (
            history_id,
            medic_id,
            clinic_id,
            date,
            diagnose,
            treatment,
            user_id
        )
        VALUES (
            {user_history[1][0]},
            {medic.id},
            {medic.clinic_id},
            {date.timestamp() * 1000},
            '',
            '',
            {current_user.id}
        )
        RETURNING id
    ''')
    Hooks.Database.handler.commit()

    return Hooks.Response(success=created != None, details=f'{appointment_id[1][0]}')

@router.post("/request")
def request_appointment(current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    return request_an_appointment(current_user.id)

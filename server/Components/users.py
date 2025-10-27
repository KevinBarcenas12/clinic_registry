from fastapi import Depends, APIRouter
from .. import Hooks, Classes
from ..links import Links

users_router = APIRouter()
patients_router = APIRouter()
medics_router = APIRouter()

class NewUser(Classes.Database.User, Classes.Database.Patient, Classes.Database.Medic):
    type: str | None = None

@users_router.get(Links.User.current, response_model=Classes.Aux.Response[Classes.Aux.UserDetails[Classes.Database.MedicUser | Classes.Database.PatientUser] | str])
def get_info_from_current_user(
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if not Hooks.Auth.has_permissions(current_user, Hooks.Auth.Permissions.User.View.Self):
        raise Hooks.Auth.PermissionException()

    cursor = Hooks.Database.get_cursor()

    user = Hooks.Auth.get_user_from_id(
        id=current_user.id,
        cursor=cursor,
        close=False,
    )

    if not user:
        return Hooks.Response(success=False, details="User not found.")

    user_permissions = Hooks.Auth.get_permissions(user)

    patient_data = Hooks.Database.fetchone(
        query=f'''
            SELECT
                patient.id,
                patient.active,
                patient.plan_id,
                patient.plan_expiration,
                plans.benefit_level,
                plans.price_month,
                plans.type
            FROM patient
            JOIN medical_plans AS plans ON plans.id = patient.plan_id
            WHERE patient.user_id = '{user.id}'
        ''',
        cursor=cursor,
        close=False,
    )

    if patient_data.success:
        if not bool(patient_data.details[2]):
            return Hooks.Response(success=False, details="Patient is not active.")

        return Hooks.Response(success=True, details={
            "user_data": Classes.Database.PatientUser(
                **user.__dict__,
                patient_id=int(patient_data.details[0]),
                active=bool(patient_data.details[1]),
                plan_id=int(patient_data.details[2]),
                plan_expiration=float(patient_data.details[3]),
                plan_benefit_level=int(patient_data.details[4]),
                plan_price_month=float(patient_data.details[5]),
                plan_type=patient_data.details[6],
            ),
            "user_type": "patient",
            "permissions": user_permissions,
        })

    medic_data = Hooks.Database.fetchone(
        query=f'''
            SELECT
                id,
                clinic_id,
                speciality,
                active
            FROM medic
            WHERE user_id = '{user.id}'
        ''',
        cursor=cursor,
    )

    if not medic_data.success:
        return Hooks.Response(success=True, details={
            "user_data": user,
            "user_type": "user",
            "permissions": user_permissions,
        })

    if not bool(medic_data.details[2]):
        return Hooks.Response(success=False, details=f"Medic is not active.")

    return Hooks.Response(success=True, details={
        "user_data": Classes.Database.MedicUser(
            **user.__dict__,
            medic_id=int(medic_data.details[0]),
            clinic_id=int(medic_data.details[1]),
            speciality=medic_data.details[2],
            active=bool(medic_data.details[3]),
        ),
        "user_type": "medic",
        "permissions": user_permissions,
    })

@users_router.put(Links.User.add, response_model=Classes.Aux.Response[str])
def add_new_user(
    user: NewUser,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.Create):
        raise Hooks.Auth.PermissionException()

    cursor = Hooks.Database.get_cursor()

    add_user_request = Hooks.Database.commit(
        query=f'''
            INSERT INTO users (
                username,
                name,
                email,
                phone,
                birth_date,
                gender,
                age,
                location,
                password,
                role_id
            )
            VALUES (
                '{user.username}',
                '{user.name}',
                '{user.email}',
                '{user.phone}',
                '{user.birth_date}',
                '{user.gender}',
                {user.age},
                '{user.location}',
                '{user.password}',
                {user.role_id}
            )
        ''',
        cursor=cursor,
        close=False
    )

    if not add_user_request.success:
        cursor.close()
        return Hooks.Response(success=False, details=f"Error adding the user. {add_user_request.details}")

    user_id = Hooks.Database.fetchone(f'SELECT id FROM users WHERE username = \'{user.username}\'')

    if not user_id.success:
        cursor.close()
        return Hooks.Response(success=False, details= f"User added but cannot be found. {user_id.details}")

    if not user.type:
        cursor.close()
        return Hooks.Response(success=True, details="The user was added successfully.")

    if user.type == "patient":
        Hooks.Database.commit(
            query=f'''
                INSERT INTO patient (
                    user_id,
                    active,
                    plan_id,
                    plan_expiration
                )
                VALUES (
                    {user_id},
                    TRUE,
                    {user.plan_id},
                    '{user.plan_expiration}'
                )
            ''',
            cursor=cursor,
            close=False
        )

        medic_id: Classes.Aux.Response[int | str] = Hooks.Database.fetchone(
            query=f'SELECT TOP 1 id FROM medic WHERE active = TRUE',
            cursor=cursor,
            close=False
        )
        patient_id: Classes.Aux.Response[int | str] = Hooks.Database.fetchone(
            query=f'SELECT id FROM patient WHERE user_id = {user_id}',
            cursor=cursor,
            close=False
        )

        if not medic_id.success or not patient_id.success:
            cursor.close()
            return Hooks.Response(success=True, details=f"User created. History couldn't be created.")

        create_history_request: Classes.Aux.Response[str] = Hooks.Database.commit(
            query=f'''
                INSERT INTO history (
                    patient_id,
                    medic_id,
                    notes
                )
                VALUES (
                    {patient_id.details},
                    {medic_id.details},
                    ''
                )
            ''',
            cursor=cursor,
            close=True,
        )

        return Hooks.Response(success=True, details=f"Patient created successfully. {create_history_request.details}")

    if user.type == "medic":
        add_medic: Classes.Aux.Response[str] = Hooks.Database.commit(
            query=f'''
                INSERT INTO medic (
                    user_id,
                    clinic_id,
                    speciality,
                    active
                )
                VALUES (
                    {user_id},
                    {user.clinic_id},
                    '{user.speciality}',
                    {user.active}
                )
            ''',
            cursor=cursor,
            close=True
        )

        return Hooks.Response(success=True, details=f"Medic created successfully. {add_medic.details}")

    return Hooks.Response(success=True, details="The user was added successfully.")

@users_router.get(Links.User.list, response_model=Classes.Aux.Response[list[Classes.Database.User] | str])
def get_user_list(
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.View.Others):
        raise Hooks.Auth.PermissionException()

    users = Hooks.Database.fetchall(f'''
        SELECT
            users.id,
            users.name,
            users.age,
            users.phone,
            users.gender,
            users.registered_at,
            users.role_id,
            roles.type
        FROM users
        LEFT JOIN roles ON roles.id = users.role_id
        WHERE users.id > 20001
        ORDER BY users.id ASC
    ''')

    if not users.success:
        return Hooks.Response(success=False, details="No users found.")

    return Hooks.Response(success=True, details=[
        Classes.Database.User(
            id=int(user[0]),
            name=user[1],
            age=int(user[2]),
            phone=user[3],
            gender=user[4],
            registered_at=float(user[5]),
            role_id=int(user[6]),
            role=user[7],
        ) for user in users.details
    ])

@users_router.get("/list/top/{top}", response_model=Classes.Aux.Response[list[Classes.Database.User] | str])
def get_top_user_list(
    top: int,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.View.Others):
        raise Hooks.Auth.PermissionException()

    users = Hooks.Database.fetchall(f'''
        SELECT
            users.id,
            users.name,
            users.age,
            users.phone,
            users.gender,
            users.registered_at,
            users.role_id,
            roles.type
        FROM users
        LEFT JOIN roles ON roles.id = users.role_id
        WHERE users.id > 20001
        ORDER BY users.registered_at DESC
        LIMIT {top}
    ''')

    if not users.success:
        return Hooks.Response(success=False, details="No users found.")
 
    return Hooks.Response(success=True, details=[
        Classes.Database.User(
            id=int(user[0]),
            name=user[1],
            age=int(user[2]),
            phone=user[3],
            gender=user[4],
            registered_at=float(user[5]),
            role_id=int(user[6]),
            role=user[7],
        ) for user in users.details
    ])

@users_router.get(Links.User.id, response_model=Classes.Aux.Response[Classes.Aux.UserDetails[Classes.Database.User] | str])
def get_info_from_user_id(
    user_id: int,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if user_id != current_user.id:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.View.Others):
            raise Hooks.Auth.PermissionException()

    cursor = Hooks.Database.get_cursor()

    user = Hooks.Auth.get_user_from_id(
        id=user_id,
        cursor=cursor,
        close=False,
    )

    if not user:
        return Hooks.Response(success=False, details="User not found.")

    user_permissions = Hooks.Auth.get_permissions(user)

    user_type: str = "user"
    
    patient = Hooks.Database.fetchone(
        query=f'SELECT id FROM patient WHERE user_id = {user_id}',
        cursor=cursor,
        close=False
    )
    if patient.success:
        user_type = "patient"

    medic = Hooks.Database.fetchone(
        query=f'SELECT id FROM medic WHERE user_id = {user_id}',
        cursor=cursor,
        close=True
    )
    if medic.success:
        user_type = "medic"

    return Hooks.Response(success=True, details={
        "user_data": user,
        "user_type": user_type,
        "permissions": user_permissions,
    })

@users_router.patch(Links.User.update, response_model=Classes.Aux.Response[str])
def update_user_info(
    user_id: int,
    updated_data: Classes.Database.User,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if current_user.id != user_id:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.Edit.Others):
            raise Hooks.Auth.PermissionException()
    else:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.Edit.Self):
            raise Hooks.Auth.PermissionException()

    existing_user = Hooks.Auth.get_user_from_id(user_id)

    if not existing_user:
        return Hooks.Response(success=False, details=f'There is no user with that id.')

    Hooks.logger(updated_data)

    request = Hooks.Database.commit(
        query=f'''
            UPDATE "users"
            SET
                role_id = '{updated_data.role_id if updated_data.role_id else existing_user.role_id}',
                name = '{updated_data.name if updated_data.name else existing_user.name}',
                email = '{updated_data.email if updated_data.email else existing_user.email}',
                age = '{updated_data.age if updated_data.age else existing_user.age}',
                phone = '{updated_data.phone if updated_data.phone else existing_user.phone}',
                birth_date = '{updated_data.birth_date if updated_data.birth_date else existing_user.birth_date}',
                gender = '{updated_data.gender if updated_data.gender else existing_user.gender}',
                location = '{updated_data.location if updated_data.location else existing_user.location}',
                registered_at = '{updated_data.registered_at if updated_data.registered_at else existing_user.registered_at}'
            WHERE id = {user_id}
        ''',
    )

    if not request.success:
        return Hooks.Response(success=False, details=f"An error ocurred while updating the user. {request.details}")

    return Hooks.Response(success=True, details="The user was updated successfully.")

@users_router.delete(Links.User.delete, response_model=Classes.Aux.Response[str])
def delete_user(
    user_id: int,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if user_id != current_user.id:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.Delete.Others):
            raise Hooks.Auth.PermissionException()
    else:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.Delete.Self):
            raise Hooks.Auth.PermissionException()

    cursor = Hooks.Database.get_cursor()
    request = Hooks.Database.commit(
        query=f'DELETE FROM users WHERE id = {user_id}',
        cursor=cursor,
        close=False
    )

    if not request.success:
        return Hooks.Response(success=False, details="")

    delete_medic = Hooks.Database.commit(
        query=f'DELETE FROM medic WHERE user_id = {user_id}',
        cursor=cursor,
        close=False
    )

    if delete_medic.success:
        cursor.close()
        return Hooks.Response(success=True, details="The medic was deleted successfully.")

    delete_patient = Hooks.Database.commit(
        query=f'DELETE FROM patient WHERE user_id = {user_id}',
        cursor=cursor,
        close=True
    )
    if not delete_patient.success:
        return Hooks.Response(success=True, details="The user was deleted.")

    return Hooks.Response(success=True, details="The patient was deleted successfully.")

@patients_router.get(Links.Patient.id, response_model=Classes.Aux.Response[Classes.Database.Patient | str])
def get_patient_from_user_id(
    user_id: int,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if user_id != current_user.id:
        if not Hooks.Auth.has_permissions(current_user, Hooks.Auth.Permissions.User.View.Others):
            raise Hooks.Auth.PermissionException()

    patient_info = Hooks.Database.fetchone(query=f'''
        SELECT
            patient.id,
            plans.benefit_level,
            patient.plan_expiration,
            patient.plan_id,
            plans.price_month,
            plans.type
        FROM patient
        LEFT JOIN medical_plans plans ON plans.id = patient.plan_id
        WHERE patient.user_id = {user_id}
    ''')

    if not patient_info.success:
        return Hooks.Response(success=False, details='There was no patient found with that id.')
    
    return Hooks.Response(success=True, details=Classes.Database.Patient(
        patient_id=int(patient_info.details[0]),
        plan_benefit_level=int(patient_info.details[1]),
        plan_expiration=float(patient_info.details[2]),
        plan_id=int(patient_info.details[3]),
        plan_price_month=float(patient_info.details[4]),
        plan_type=patient_info.details[5],
    ))

@patients_router.patch(Links.Patient.update, response_model=Classes.Aux.Response[str])
def update_patient_status_plan(
    user_id: int,
    new_info: Classes.Database.Patient,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.Edit.Others):
        raise Hooks.Auth.PermissionException()

    existent_request = Hooks.Database.fetchone(f'''
        SELECT
            patient.id,
            patient.active,
            patient.plan_id,
            patient.plan_expiration
        FROM patient
        LEFT JOIN (
            SELECT users.id as user_id, patient.id as patient_id
            FROM users
            LEFT JOIN patient ON patient.user_id = users.id
        ) AS list ON list.patient_id = patient.id
        WHERE list.user_id = '{user_id}'
    ''')

    if not existent_request.success:
        return Hooks.Response(success=False, details="Patient not found.")

    existing = Classes.Database.Patient(
        patient_id=int(existent_request.details[0]),
        active=bool(existent_request.details[1]),
        plan_id=int(existent_request.details[2]),
        plan_expiration=float(existent_request.details[3]),
    )

    request = Hooks.Database.commit(f'''
        UPDATE patient
        SET 
            plan_id = '{new_info.plan_id if new_info.plan_id else existing.plan_id}',
            plan_expiration = '{new_info.plan_expiration if new_info.plan_expiration else existing.plan_expiration}',
            active = '{new_info.active if new_info.active != None else existing.active}'
        WHERE id = '{existing.id}'
    ''')

    if not request.success:
        return Hooks.Response(success=False, details=f"Error updating the patient information. {request.details}")

    return Hooks.Response(success=True, details="The patient was updated successfully.") 

@medics_router.get(Links.Medic.id, response_model=Classes.Aux.Response[Classes.Database.Medic | str])
def get_medic_from_user_id(
    user_id: int,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)
):
    if user_id != current_user.id:
        if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.View.Others):
            raise Hooks.Auth.PermissionException()

    medic_info = Hooks.Database.fetchone(f'''
        SELECT
            medic.id,
            medic.speciality,
            clinics.id,
            clinics.name,
            clinics.location,
            medic.active
        FROM medic
        LEFT JOIN clinics ON medic.clinic_id = clinics.id
        WHERE medic.user_id = {user_id}
    ''')

    if not medic_info.success:
        return Hooks.Response(success=False, details=f"No medic found. {medic_info.details}")

    return Hooks.Response(success=True, details=Classes.Database.Medic(
        id=int(medic_info.details[0]),
        speciality=medic_info.details[1],
        clinic_id=int(medic_info.details[2]),
        clinic_name=f"{medic_info.details[3]}, {medic_info.details[4]}",
        active=bool(medic_info.details[5])
    ))

@medics_router.patch(Links.Medic.update, response_model=Classes.Aux.Response[str])
def update_medic_info(
    user_id: int,
    new_info: Classes.Database.Medic,
    current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate),
):
    if not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.User.Edit.Others):
        raise Hooks.Auth.PermissionException()

    existing = Hooks.Database.fetchone(f'''
        SELECT
            clinic_id,
            speciality,
            active
        FROM medic
        WHERE user_id = '{user_id}'
    ''')

    if not existing.success:
        return Hooks.Response(success=False, details=f"Medic not found.")
    

    medic = Classes.Database.Medic(
        clinic_id=int(existing.details[0]),
        speciality=existing.details[1],
        active=bool(existing.details[2]),
    )
    # Hooks.logger(medic)

    request = Hooks.Database.commit(f'''
        UPDATE medic
        SET
            clinic_id = '{new_info.clinic_id if new_info.clinic_id else medic.clinic_id}',
            speciality = '{new_info.speciality if new_info.speciality else medic.speciality}',
            active = '{new_info.active if new_info.active else medic.active}'
        WHERE user_id = '{user_id}'
    ''')

    if not request.success:
        return Hooks.Response(success=False, details=request.details if request.details else "Error updating the medic information.")

    return Hooks.Response(success=True, details="Medic information updated successfully.")

from pydantic import BaseModel

class User(BaseModel):
    id: int | None = None
    role: str | None = None
    role_id: int | None = None
    name: str | None = None
    email: str | None = None
    age: int | None = None
    phone: str | None = None
    birth_date: float | None = None
    gender: str | None = None
    location: str | None = None
    registered_at: float | None = None
    type: str | None = None
    username: str | None = None
    password: str | None = None

class Patient(BaseModel):
    id: int | None = None
    patient_id: int | None = None
    plan_id: int | None = None
    plan_expiration: float | None = None
    plan_benefit_level: int | None = None
    plan_price_month: float | None = None
    plan_type: str | None = None
    active: bool | None = None

class PatientUser(User):
    patient_id: int | None = None
    plan_id: int | None = None
    plan_expiration: float | None = None
    plan_benefit_level: int | None = None
    plan_price_month: float | None = None
    plan_type: str | None = None
    active: bool | None = None

class Medic(BaseModel):
    id: int | None = None
    user_id: int | None = None
    medic_name: str | None = None
    speciality: str | None = None
    clinic_id: int | None = None
    clinic_name: str | None = None
    active: bool | None = None

class MedicUser(User):
    medic_id: int | None = None
    speciality: str | None = None
    clinic_id: int | None = None
    clinic_name: str | None = None
    active: bool | None = None

class Appointments(BaseModel):
    id: int | None = None
    history_id: int | None = None
    medic_id: int | None = None
    medic_name: str | None = None
    date: float | None = None
    diagnose: str | None = None
    treatment: str | None = None
    clinic_id: int | None = None
    clinic_name: str | None = None
    user_id: int | None = None
    user_name: str | None = None

class History(BaseModel):
    id: int | None = None
    patient_id: int | None = None
    patient_name: str | None = None
    medic_id: int | None = None
    medic_name: str | None = None
    notes: str | None = None
    created_at: float | None = None
    last_modified_at: float | None = None
    appointments: list[Appointments] | None = None

class Message(BaseModel):
    id: int | None = None
    chat_id: int | None = None
    message: str | None = None
    sender_id: int | None = None
    sender_name: str | None = None
    sent_at: float | None = None

class Chat(BaseModel):
    id: int | None = None
    medic_id: int | None = None
    medic_name: str | None = None
    user_id: int | None = None
    user_name: str | None = None
    created_at: float | None = None
    active: bool | None = None
    messages: list[Message] | None = None

class MedicalPlan(BaseModel):
    id: int | None = None
    type: str | None = None
    benefit_level: int | None = None
    price_month: float | None = None
    duration: int | None = None

class Clinic(BaseModel):
    id: int | None = None
    name: str | None = None
    location: str | None = None
    phone: str | None = None

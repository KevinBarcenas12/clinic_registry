from pydantic import BaseModel

class User(BaseModel):
    id: int
    role: str
    role_id: int
    name: str
    email: str
    age: int
    phone: str
    birth_date: float
    gender: str
    location: str
    registered_at: float
    password: str | None = None

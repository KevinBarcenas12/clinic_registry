from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone

from .. import Classes
from . import database

KEY = "f1c0ab20dfbfd743a72abf0345519d550118a6f9482c2028fab79bac1491f26f"
ALGOITHM = "HS256"
EXPIRES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oath2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def get_user_from_id(id: int, cursor = None, close = True) -> Classes.Main.User | None:
    request = database.fetchone(f'''
        SELECT 
            users.id, users.name, users.email, users.phone, users.age, users.birth_date, 
            users.gender, users.location, users.registered_at, roles.type, roles.id
        FROM users
        LEFT JOIN "roles" ON roles.id = users.role_id
        WHERE users.id = '{id}'
    ''', cursor, close)

    if not request.success:
        return None

    return Classes.Main.User(
        id=int(request.details[0]),
        name=request.details[1],
        email=request.details[2],
        phone=request.details[3],
        age=int(request.details[4]),
        birth_date=float(request.details[5]),
        gender=request.details[6],
        location=request.details[7],
        registered_at=float(request.details[8]),
        role=request.details[9],
        role_id=int(request.details[10]),
    )

def get_user(username: str) -> Classes.Main.User | None:
    request = database.fetchone(f'''
        SELECT
            users.id,
            users.name,
            users.email,
            users.phone,
            users.age,
            users.birth_date,
            users.gender,
            users.location,
            users.registered_at,
            users.password,
            roles.type,
            roles.id
        FROM users
        LEFT JOIN roles ON roles.id = users.role_id
        WHERE users.username = '{username}'
    ''')

    if not request.success:
        return None

    result = request.details
    return Classes.Main.User(
        id=int(result[0]),
        name=result[1],
        email=result[2],
        phone=result[3],
        age=int(result[4]),
        birth_date=float(result[5]),
        gender=result[6],
        location=result[7],
        registered_at=float(result[8]),
        password=result[9],
        role=result[10],
        role_id=int(result[11]),
    )

def authenticate_password(username, password) -> Classes.Main.User:
    current_user = get_user(username=username)

    if not current_user:
        raise HTTPException(401, "Incorrect Username or Password", headers={ "WWW-Authenticate": "Bearer" })

    if not pwd_context.verify(password, current_user.password):
        raise HTTPException(401, "Incorrect Username or Password", headers={ "WWW-Authenticate": "Bearer" })

    return current_user

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRES)

    to_encode.update({ "exp": expire })
    encoded_jwt = jwt.encode(to_encode, KEY, algorithm=ALGOITHM)

    return encoded_jwt

def authenticate(token: str = Depends(oath2_scheme)) -> Classes.Main.User:
    auth_error = HTTPException(status_code=401, detail="Not authenticated.", headers={ "WWW-Authenticate": "Bearer" })

    try:
        decoded = jwt.decode(token=token, key=KEY, algorithms=[ALGOITHM])
        user: str = decoded.get("sub") #type: ignore

        if not user:
            raise auth_error

        token_data = Classes.Auth.TokenData(userId=user)

    except JWTError:
        raise auth_error

    current_user = get_user(token_data.userId)

    if not current_user:
        raise auth_error

    del current_user.password
    _user = Classes.Main.User(**current_user.__dict__)
    return current_user

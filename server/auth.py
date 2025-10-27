from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from .Hooks.auth import authenticate_password, create_access_token, EXPIRES

def get_token(request: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_password(request.username, request.password)

    if not user: 
        raise HTTPException(401, "Incorrect Username or Password", headers={ "WWW-Authenticate": "Bearer" })

    token_expires = timedelta(minutes=EXPIRES)
    token = create_access_token(data={ "sub": request.username }, expires_delta=token_expires)

    return {"access_token": token, "token_type": "bearer"}

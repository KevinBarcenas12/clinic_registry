from fastapi import HTTPException, status as Status
from typing import Any
from .. import Classes

# from ..Classes.auxiliary import Response

def Response(success: bool, details: Any):
    return Classes.Aux.Response(
        success=success,
        details=details,
    )

def Exception(status: int, details: str, headers: dict = { "WWW-Authenticate": "Bearer" }):
    raise HTTPException(status_code=status, headers=headers, detail=details)

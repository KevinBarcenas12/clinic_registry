from pydantic import BaseModel
from typing import TypeVar, Any, Literal, overload 

DetailStruct = TypeVar(name="DetailStruct")

class Response[struct: DetailStruct](BaseModel): # type: ignore 
    success: bool
    details: struct

class UserDetails[struct: DetailStruct](BaseModel): # type: ignore 
    user_type: str
    user_data: struct
    permissions: list[str] | None

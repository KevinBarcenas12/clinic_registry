from fastapi import HTTPException, status as Status
from .. import Classes
from . import Database

def get_permissions(current_user: Classes.Main.User) -> list[str]:
    result = Database.fetchall(
        query=f'''
            SELECT permissions.name
            FROM "permissions"
            INNER JOIN role_permissions ON role_permissions.permission_id = permissions.id
            INNER JOIN roles ON role_permissions.role_id = roles.id
            WHERE roles.id = {current_user.role_id}
        ''',
    )

    if not result.success:
        return [result.details] #type: ignore
    
    else:
        result.success
        permission_list = [ item[0] for item in result.details ]
        return permission_list

def has_permissions(current_user: Classes.Main.User, permission: str) -> bool:
    current_user_permissions = get_permissions(current_user)

    for user_permission in current_user_permissions:
        if str(user_permission) == str(permission): return True

    return False

class PermissionException(HTTPException):
    def __init__(self, status_code = Status.HTTP_401_UNAUTHORIZED, detail: str = "No permission.", headers = None):
        if not status_code: status_code = Status.HTTP_401_UNAUTHORIZED
        if not detail: detail = "No permission."
        super().__init__(status_code, detail, headers)

class Permissions:
    class User:
        class View:
            Self = "users:view:self"
            Others = "users:view:others"
        class Edit:
            Self = "users:edit:self"
            Others = "users:edit:others"
        class Delete:
            Self = "users:delete:self"
            Others = "users:delete:others"
        Create = "users:create"
    class Medical_plan:
        class View:
            Self = "medical_plan:view:self"
            Others = "medical_plan:view:others"
        Edit = "medical_plan:edit"
        Delete = "medical_plan:delete"
        Create = "medical_plan:create"
    class Appointments:
        class View:
            Self = "appointments:view:self"
            Others = "appointments:view:others"
            All = "appointments:view:all"
        class Edit:
            Self = "appointments:edit:self"
            Others = "appointments:edit:others"
            All = "appointments:edit:all"
        class Delete:
            Self = "appointments:delete:self"
            Others = "appointments:delete:others"
            All = "appointments:delete:all"
        class Create:
            Self = "appointments:create:self"
            Others = "appointments:create:others"
    class History:
        class View:
            Self = "history:view:self"
            Others = "history:view:others"
        Edit = "history:edit"
        Create = "history:create"
        Delete = "history:delete"
        Predict = "predictive_diagnosis:use"
    class Chats:
        class View:
            Self = "chats:view:self"
            Others = "chats:view:others"
    class Clinics:
        View = "clinics:view"
        Edit = "clinics:edit"
        Delete = "clinics:delete"
        Create = "clinics:create"

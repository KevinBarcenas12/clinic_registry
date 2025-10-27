from fastapi import Depends, APIRouter
from .. import Classes, Hooks
from ..links import Links

router = APIRouter()

@router.get(Links.Chats.list, response_model=Classes.Aux.Response[list[Classes.Database.Chat] | str])
def get_chat_list(current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if not Hooks.Auth.has_permissions(current_user, permission="chats:view:others"): 
        raise Hooks.Auth.PermissionException()

    result = Hooks.Database.fetchall(f'''
        SELECT 
            chats.id,
            chats.medic_id,
            medic_list.name as medic_name,
            chats.user_id,
            users.name as user_name,
            chats.created_at,
            chats.active
        FROM chats
        LEFT JOIN (
            SELECT
                users.id as user_id,
                medic.id as medic_id,
                users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = chats.medic_id
        LEFT JOIN users on chats.user_id = users.id
        ORDER BY chats.created_at DESC
    ''')

    if not result.success:
        return Hooks.Response(success=False, details=result.details if result.details else "No chats found.")

    chat_list = [
        Classes.Database.Chat(
            id=int(chat[0]),
            medic_id=int(chat[1]),
            medic_name=chat[2],
            user_id=int(chat[3]),
            user_name=chat[4],
            created_at=float(chat[5]),
            active=bool(chat[6])
        ) for chat in result.details
    ]

    if not chat_list or len(chat_list) == 0:
        return Hooks.Response(success=False, details="Chat history not found.")

    return Hooks.Response(success=True, details=chat_list)

@router.get(Links.Chats.top, response_model=Classes.Aux.Response[list[Classes.Database.Chat] | str])
def get__top_chat_list(top: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if not Hooks.Auth.has_permissions(current_user, permission="chats:view:others"): 
        raise Hooks.Auth.PermissionException()

    result = Hooks.Database.fetchall(f'''
        SELECT 
            chats.id,
            chats.medic_id,
            medic_list.name as medic_name,
            chats.user_id,
            users.name as user_name,
            chats.created_at, chats.active
        FROM chats
        LEFT JOIN (
            SELECT
                users.id as user_id,
                medic.id as medic_id,
                users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = chats.medic_id
        LEFT JOIN users on chats.user_id = users.id
        ORDER BY chats.created_at DESC
        LIMIT {top}
    ''')

    if not result.success:
        return Hooks.Response(success=False, details=f"No chats found. {result.details}")

    chat_list = [
        Classes.Database.Chat(
            id=int(chat[0]),
            medic_id=int(chat[1]),
            medic_name=chat[2],
            user_id=int(chat[3]),
            user_name=chat[4],
            created_at=float(chat[5]),
            active=bool(chat[6])
        ) for chat in result.details
    ]

    if not chat_list or len(chat_list) == 0:
        return Hooks.Response(success=False, details="Chat history not found.")

    return Hooks.Response(success=True, details=chat_list)

@router.get(Links.Chats.user_list, response_model=Classes.Aux.Response[list[Classes.Database.Chat] | str])
def get_chats_from_user_id(user_id: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if current_user.id != user_id and not Hooks.Auth.has_permissions(current_user, permission="chats:view:others"): 
        raise Hooks.Auth.PermissionException()

    result = Hooks.Database.fetchall(f'''
        SELECT
            chats.id,
            chats.medic_id,
            medic_list.name as medic_name,
            chats.user_id,
            users.name as user_name,
            chats.created_at,
            chats.active
        FROM chats
        LEFT JOIN (
            SELECT 
                users.id as user_id,
                medic.id as medic_id,
                users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = chats.medic_id
        LEFT JOIN users on chats.user_id = users.id
        WHERE users.id = '{user_id}'
    ''')

    if not result.success:
        return Hooks.Response(success=False, details=f"No chats found. {result.details}")

    chat_list = [
        Classes.Database.Chat(
            id=int(chat[0]),
            medic_id=int(chat[1]),
            medic_name=chat[2],
            user_id=int(chat[3]),
            user_name=chat[4],
            created_at=float(chat[5]),
            active=bool(chat[6]),
        ) for chat in result.details
    ]

    if not chat_list: 
        return Hooks.Response(success=False, details="Chat history not found.")

    return Hooks.Response(success=True, details=chat_list)

@router.get(Links.Chats.user_top, response_model=Classes.Aux.Response[list[Classes.Database.Chat] | str])
def get_top_chats_from_user_id(user_id: int, top: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):
    if current_user.id != user_id and not Hooks.Auth.has_permissions(current_user, permission="chats:view:others"): 
        raise Hooks.Auth.PermissionException()

    result = Hooks.Database.fetchall(f'''
        SELECT
            chats.id,
            chats.medic_id,
            medic_list.name as medic_name,
            chats.user_id,
            users.name as user_name,
            chats.created_at,
            chats.active
        FROM chats
        LEFT JOIN (
            SELECT 
                users.id as user_id,
                medic.id as medic_id,
                users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_list ON medic_list.medic_id = chats.medic_id
        LEFT JOIN users on chats.user_id = users.id
        WHERE users.id = '{user_id}'
        LIMIT {top}
    ''')

    if not result.success:
        return Hooks.Response(success=False, details=f"No chats found. {result.details}")

    chat_list = [
        Classes.Database.Chat(
            id=int(chat[0]),
            medic_id=int(chat[1]),
            medic_name=chat[2],
            user_id=int(chat[3]),
            user_name=chat[4],
            created_at=float(chat[5]),
            active=bool(chat[6]),
        ) for chat in result.details
    ]

    if not chat_list: 
        return Hooks.Response(success=False, details="Chat history not found.")

    return Hooks.Response(success=True, details=chat_list)

@router.get(Links.Chats.id, response_model=Classes.Aux.Response[Classes.Database.Chat | str])
def get_chat_from_chat_id(chat_id: int, current_user: Classes.Main.User = Depends(Hooks.Auth.authenticate)):

    get_chats = Hooks.Database.fetchone(f'''
        SELECT 
            chats.id,
            chats.medic_id,
            chats.user_id,
            chats.created_at,
            chats.active,
            medic_names.name as medic_name,
            users.name as user_name
        FROM chats
        LEFT JOIN (
            SELECT 
                users.id as user_id, 
                medic.id as medic_id, 
                users.name
            FROM users
            LEFT JOIN medic ON medic.user_id = users.id
        ) as medic_names ON medic_names.medic_id = chats.medic_id
        LEFT JOIN users ON users.id = chats.user_id
        WHERE chats.id = '{chat_id}'
    ''')

    if not get_chats.success:
        return Hooks.Response(success=False, details=f"Chat not found. {get_chats.details}")

    if get_chats.details[3] != current_user.id and not Hooks.Auth.has_permissions(current_user, permission=Hooks.Auth.Permissions.Chats.View.Others):
        raise Hooks.Auth.PermissionException()

    chat = Classes.Database.Chat(
        id=int(get_chats.details[0]),
        medic_id=int(get_chats.details[1]),
        medic_name=get_chats.details[5],
        user_id=int(get_chats.details[2]),
        user_name=get_chats.details[6],
        created_at=float(get_chats.details[3]),
        active=bool(get_chats.details[4]),
    )

    message_request = Hooks.Database.fetchall(f'''
        SELECT 
            messages.id,
            messages.message,
            messages.sender_id,
            list.name,
            messages.sent_at
        FROM messages
        LEFT JOIN (
            SELECT 
                users.name,
                users.id as user_id,
                medic.id as medic_id
            FROM users
            LEFT JOIN medic ON users.id = medic.user_id
        ) as list ON messages.sender_id = list.user_id OR messages.sender_id = list.medic_id
        WHERE messages.chat_id = {chat.id}
    ''')

    if message_request.success:
        chat.messages = [
            Classes.Database.Message(
                chat_id=chat.id,
                id=int(message[0]),
                message=message[1],
                sender_id=int(message[2]),
                sender_name=message[3],
                sent_at=float(message[4]),
            ) for message in message_request.details
        ]

    else: return Hooks.Response(success=False, details=f'Error: {message_request.details}')

    return Hooks.Response(success=True, details=chat)

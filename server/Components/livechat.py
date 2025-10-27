from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from threading import Thread
from datetime import datetime
from .. import Hooks, Classes
from uuid import uuid4 as uuid, UUID
from enum import Enum
from json import loads as from_json, dumps as to_json
from time import sleep
from datetime import timedelta, datetime, timezone
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam as BotMessage
import re
from ..Components.appointments import request_an_appointment

router = APIRouter()

class Connection(BaseModel):
    token: str | None = None
    last_active: datetime | None = None
    host: str | None = None

class EventType(Enum):
    CLIENT_CONNECT = "client_connect"
    CLIENT_DISCONNECT = "client_disconnect"
    CHAT_START = "chat_start"
    CHAT_MESSAGE = "chat_message"
    LOG_MESSAGE = "log_message"
    UNKNOWN_MESSAGE = "unknown_message"
    CLIENT_INFORMATION = "client_information"
    APPOINTMENT_CREATED = "appointment_created"
    CHAT_MESSAGE_WITH_LINKS = "chat_message_with_links"



class Message:
    id: int | None = None
    chat_id: int | None = None
    message: str | None = None
    sender_id: int | None = None
    sender_name: str | None = None
    sent_at: float | None = None
    links: list[str] | None = None

    def __init__(
        self,
        chat_id: int = 0,
        message: str | None = None,
        sender_id: int = 8001,
        sender_name: str | None = "@Bot",
        sent_at: float | None = datetime.now().timestamp() * 1000,
        cursor = Hooks.Database.handler.cursor(),
        links: list[str] | None = None,
    ):
        self.chat_id = int(chat_id)
        self.message = message
        self.sender_id = int(sender_id)
        self.sender_name = sender_name
        self.sent_at = sent_at
        self.links = links
        if chat_id == 0: return
        cursor.execute(f'''
            INSERT INTO "messages"("chat_id", "message", "sender_id") VALUES
            (
                {chat_id},
                '{message.replace("'", "\"") if message is not None else ""}',
                {sender_id}
            )
            RETURNING id
        ''')
        id = cursor.fetchone()
        Hooks.Database.handler.commit()
        self.id = id[0] if id is not None else 0

    def __to_dict__(self):
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "message": self.message,
            "sender_id": self.sender_id,
            "sender_name": self.sender_name,
            "sent_at": self.sent_at,
            "links": self.links
        }



class Client:
    host: str
    uuid: UUID
    connection: WebSocket

    def __init__(self, host: str, uuid: UUID, socket: WebSocket):
        self.host = host
        self.uuid = uuid
        self.connection = socket

    def __to_dict__(self):
        return {
            "host": self.host,
            "uuid": f'${self.uuid}',
            "connection": {
                "url": {
                    "hostname": self.connection.url.hostname,
                    "port": self.connection.url.port,
                    "query": self.connection.url.query,
                },
                "base_url": self.connection.base_url.hostname,
            }
        }



class Event:
    message: Message
    date: float
    type: EventType
    client: Client | None
    user: Classes.Database.User

    def __init__(
            self,
            message: Message,
            type: EventType,
            client: Client | None = None,
            date: float = datetime.now().timestamp() * 1000,
            user: Classes.Database.User = Classes.Database.User(),
        ):
        self.message = message
        self.date = date
        self.type = type
        self.client = client
        self.user = user

    def _get_message_json_string(self):
        id = f'"id":"{self.message.id if self.message.id is not None else "null"}"'
        chat_id = f'"chat_id":"{self.message.chat_id if self.message.chat_id is not None else "null"}"'
        message = f'"message":"{self.message.message if self.message.message is not None else "null"}"'
        sender_id = f'"sender_id":"{self.message.sender_id if self.message.sender_id is not None else "null"}"'
        sender_name = f'"sender_name":"{self.message.sender_name if self.message.sender_name is not None else "null"}"'
        sent_at = f'"sent_at":"{self.message.sent_at if self.message.sent_at is not None else "null"}"'
        return "{" + f'{id},{chat_id},{message},{sender_id},{sender_name},{sent_at}' + "}"

    def _get_user_json_string(self):
        id = f'"id":"{self.user.id if self.user.id is not None else "20000"}"'
        role = f'"role":"{self.user.role if self.user.role is not None else "null"}"'
        role_id = f'"role_id":"{self.user.role_id if self.user.role_id is not None else "100"}"'
        name = f'"name":"{self.user.name if self.user.name is not None else "@Bot"}"'
        email = f'"email":"{self.user.email if self.user.email is not None else "Desconocido@Bot"}"'
        age = f'"age":"{self.user.age if self.user.age is not None else "0"}"'
        phone = f'"phone":"{self.user.phone if self.user.phone is not None else "00000000"}"'
        birth_date = f'"birth_date":"{self.user.birth_date if self.user.birth_date is not None else "2000-01-01"}"'
        gender = f'"gender":"{self.user.gender if self.user.gender is not None else "Desconocido"}"'
        location = f'"location":"{self.user.location if self.user.location is not None else "Desconocido"}"'
        registered_at = f'"registered_at":"{self.user.registered_at if self.user.registered_at is not None else "2025-05-21 03:46:39.584733"}"'
        type = f'"type":"{self.user.type if self.user.type is not None else "null"}"'
        return "{" + f'{id},{role},{role_id},{name},{email},{age},{phone},{birth_date},{gender},{location},{registered_at},{type}' + "}"

    def get_json_string(self):
        message = f'"message":{self._get_message_json_string()}'
        date = f'"date":"{self.date}"'
        type = f'"type":"{self.type.value}"'
        client = f'"client":"{self.client.host if self.client is not None else "null"}"'
        user = f'"user":{self._get_user_json_string()}'
        return "{" + f'{message},{date},{type},{client},{user}' + "}"

    def __to_dict__(self):
        return {
            "message": self.message.__to_dict__(),
            "date": self.date,
            "type": self.type.value,
            "client": self.client.__to_dict__() if self.client is not None else {},
            "user": self.user.__dict__,
        }



class Chat:
    id: int
    medic_id: int | None
    medic_name: str | None
    user_id: int | None
    user_name: str
    created_at: float
    active: bool
    clients: list[Client]
    messages: list[Message]
    medic_interaction: bool
    user_disconnected: datetime | None
    created: bool
    history: list[BotMessage]

    def __init__(
        self,
        user_id: int | None = 20001,
        clients: list[Client] = [],
        user_name: str | None = "@Invitado",
        id: int | None = 0,
        cursor = Hooks.Database.handler.cursor(),
        active: bool = True,
        medic_id: int | None = 8001,
        medic_name: str | None = "@Bot",
        created_at: float = datetime.now(timezone.utc).timestamp() * 1000 + 186000,
        messages: list[Message] = [],
        medic_interaction: bool = False,
    ):
        Hooks.logger(user_id)
        self.user_id = user_id if user_id is not None else 20001
        self.user_name = user_name if user_name is not None else "@Invitado"
        self.medic_id = medic_id if medic_id is not None else 8001
        self.medic_name = medic_name if medic_name is not None else "@Bot"
        self.created_at = created_at
        self.active = active
        self.messages = messages
        self.clients = clients
        self.cursor = cursor
        self.medic_interaction = medic_interaction
        self.user_disconnected = None
        self.history = [
            {
                "role": "system",
                "content": """
                    -- Eres un asistente de una clínica médica.
                    -- Deberás guiar a los usuarios a agendar nuevas citas únicamente cuando sea explícitamente solicitado
                    y resolver consultas sencillas sobre su estado de salud.
                    -- Cuando un usuario no tenga su id de usuario o este sea 20001 (que es el default) y quiera agendar una cita, 
                    debera iniciar sesion primero, mandando al link /login o /register
                    antes de continuar con el proceso.
                    -- Para agendar una cita rapida solo se ocupa el id del usuario y se asigna un medico disponible
                    -- ¡Nunca menciones el id del usuario!
                """,
            },
            {
                "role": "user",
                "content": f"(id: {self.user_id if self.user_id != 20001 else "null"}{f', nombre: {self.user_name}' if self.user_id != 20001 else "null"}) Hola!"
            }
        ]
        if id is None or id == 0:
            cursor.execute(f'''
                INSERT INTO "chats"("user_id", "medic_id", "active") VALUES
                (
                    {self.user_id},
                    {self.medic_id},
                    {self.active}
                )
                RETURNING "id"
            ''')
            chat_id = cursor.fetchone()
            Hooks.Database.handler.commit()
            self.id = int(chat_id[0]) if chat_id is not None else 0
            self.created = True
        else:
            self.id = id
            self.created = False
            result = Hooks.Database.fetchone(
                query=f'''
                    SELECT
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
                ''',
                cursor=cursor,
            )
            if result.success:
                self.medic_id = int(result.details[0])
                self.medic_name = result.details[1]
                self.user_id = int(result.details[2])
                self.user_name = result.details[3]
                self.created_at = float(result.details[4])
                self.active = bool(result.details[5])

    def medic_interacted(self):
        self.medic_interaction = True

    async def message(self, event: Event):
        Hooks.logger(to_json(event.__to_dict__()))
        self.messages.append(event.message)
        for client in self.clients:
            # await client.connection.send_text(event.get_json_string())
            await client.connection.send_json(event.__to_dict__())

    def close(self):
        if self.id == 0: return
        self.cursor.execute(f'''
            UPDATE chats
            SET active = false
            WHERE id = {self.id}
        ''')
        Hooks.Database.handler.commit()

    def end(self):
        self.user_disconnected = datetime.now(timezone.utc)

    def _get_client_string(self) -> str:
        client_str = []
        for client in self.clients:
            client_str.append("{" + f'\n\t\t"host":"{client.host}",\n\t\t"uuid":"{client.uuid}"\n\t' + "    }")
        i = 0
        final_str = ""
        while i < client_str.__len__():
            final_str += client_str[i] + ","
            i += 1
        return f' [\n\t    {final_str}\n\t]'

    def _get_message_string(self) -> str:
        client_str = []
        for message in self.messages:
            client_str.append("{" + f'\n\t\t"id":"{message.id}",\n\t\t"chat_id":"{message.chat_id}",\n\t\t"message":"{message.message}",\n\t\t"sent_at":"{message.sent_at}"\n\t' + "    }")
        i = 0
        final_str = ""
        while i < client_str.__len__():
            final_str += client_str[i] + ","
            i += 1
        return f' [\n\t    {final_str}\n\t]'

    def get_string(self) -> str:
        return f'''\n\t"id":"{self.id}",
\t"medic_id":"{self.medic_id}",
\t"medic_name":"{self.medic_name}",
\t"user_id":"{self.user_id}",
\t"user_name":"{self.user_name}",
\t"created_at":"{self.created_at}",
\t"active":"{self.active}",
\t"clients":{self._get_client_string()},
\t"messages":{self._get_message_string()},
\t"medic_interaction":"{self.medic_interaction}",
\t"user_disconnected":"{self.user_disconnected}",
\t"created":"{self.created}"'''
    
    def __to_dict__(self):
        return {
            "id": self.id,
            "medic_id": self.id,
            "medic_name": self.medic_name,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "created_at": self.created_at,
            "active": self.active,
            "clients": self.clients,
            "messages": self.messages,
            "medic_interaction": self.medic_interaction,
            "user_disconnected": self.user_disconnected,
            "created": self.created,
        }

def _request_appointment(user_id: int):
    return request_an_appointment(user_id)

class ConnectionManager:
    connections: list[Client]
    active_chats: list[Chat]
    thread: Thread

    def __init__(self, initialConnections: list[Client] = []):
        self.connections = initialConnections
        self.cursor = Hooks.Database.get_cursor()
        self.active_chats = []
        self.thread = Thread(target=self.chat_checker, daemon=True)
        self.thread.start()

    def _get_chats_string(self) -> str:
        final_str = "{"
        for chat in self.active_chats:
            final_str += chat.get_string() + ",\n"
        return final_str + "    }"
    
    async def close_chat(self, chat: Chat):
        for _chat in self.active_chats:
            if _chat == chat:
                self.active_chats.remove(chat)
                chat.close()
                for client in chat.clients:
                    await client.connection.close()

    def chat_checker(self):
        while True:
            # Hooks.logger(f'Checking chats... [\n    {self._get_chats_string()}\n]')
            if self.active_chats.__len__() > 0:
                for chat in self.active_chats:
                    if chat.user_disconnected and datetime.now(timezone.utc) - chat.user_disconnected < timedelta(minutes=2):
                        Hooks.logger(f'Chat with id {chat.id} has been for over two minutes without a reconnect... Closing...')
                        self.active_chats.remove(chat)
                        chat.close()
            sleep(30)

    async def connect(self, socket: WebSocket) -> Client:
        await socket.accept()
        client = Client(
            host=f'{socket.client.host if socket.client is not None else ""}:{socket.client.port if socket.client is not None else ""}',
            socket=socket,
            uuid=uuid(),
        )
        self.connections.append(client)
        return client

    async def disconnect(self, client: Client) -> None:
        self.connections.remove(client)
        chat = await self.get_chat(client)
        chat.end()
        Message(
            chat_id=chat.id,
            cursor=self.cursor,
            message=f'Client got disconnected.',
        )

    async def start_chat(self, client: Client, user: Classes.Database.User):
        chat = await self.get_chat(client, user)
        if chat.created:
            generated = Hooks.AIModel.message(chat.history, force_plain_reply=True)
            choice = generated.choices[0].message
            if not choice.tool_calls or choice.tool_calls.__len__() < 1:
                await chat.message(Event(
                    type=EventType.CHAT_MESSAGE,
                    message=Message(
                        chat_id=chat.id,
                        message="No se pudo continuar con esta conversación..."
                    ),
                ))
                return None
            Hooks.logger(choice.tool_calls[0].function.arguments)
            await chat.message(Event(
                type=EventType.CHAT_MESSAGE,
                message=Message(
                    message=from_json(choice.tool_calls[0].function.arguments).get("response_message") or "No se pudo continuar esta conversación...",
                    chat_id=chat.id
                ),
            ))
        self.active_chats.append(chat)
        return chat

    async def get_chat(self, client: Client, user: Classes.Database.User | None = None) -> Chat:
        # Hooks.logger(user)
        for chat in self.active_chats:
            for _client in chat.clients:
                if _client == client:
                    return chat
        if not user: user = Classes.Database.User()
        chat = Chat(cursor=self.cursor, clients=[client], user_id=user.id, user_name=user.name)
        await chat.message(
            Event(
                message=Message(
                    message=f'Client got connected.',
                    cursor=self.cursor,
                    chat_id=chat.id,
                ),
                type=EventType.CLIENT_CONNECT,
                client=client,
            )
        )
        return chat



manager = ConnectionManager()



def jsonParser(input: str, client: Client):
    _input = input.replace("\"", "<->").replace("\'","\"").replace("<->", "\'").replace("\"None\"","\"null\"").replace("None", "\"null\"").replace("True", "\"true\"").replace("False","\"false\"")
    message: dict = from_json(_input)
    return Event(
        date=message.get("date"), #type: ignore
        message=Message(**message.get("message")), #type: ignore
        type=EventType[message.get("type").upper()], #type: ignore
        user=Classes.Database.User(**message.get("user")), #type: ignore
        client=client,
    )

async def chat_handler(socket: WebSocket, client: Client):
    while True:
        json_event = await socket.receive_json()
        event = jsonParser(input=f"{json_event}", client=client)

        if event.type == EventType.CLIENT_INFORMATION:
            chat = await manager.start_chat(client, event.user)
            if not chat:
                await client.connection.close()
                return

        if event.type == EventType.CHAT_MESSAGE:
            for chat in manager.active_chats:
                if chat.id != event.message.chat_id:
                    continue
                await chat.message(event)
                chat.history.append({
                    "role": "user",
                    "content": f'({event.message.sender_id}{f', nombre: {event.message.sender_name}' if event.message.sender_id != 20001 else ''}) {event.message.message}'
                })
                generated = Hooks.AIModel.message(chat.history)
                choice = generated.choices[0].message

                if not choice.tool_calls or choice.tool_calls.__len__() < 1:
                    await chat.message(Event(
                        type=EventType.CHAT_MESSAGE,
                        message=Message(
                            message="No hemos podido continuar con esta conversación...",
                            chat_id=chat.id,
                        ),
                    ))
                    await manager.close_chat(chat)
                    continue

                func_name = choice.tool_calls[0].function.name
                func_args: dict = from_json(choice.tool_calls[0].function.arguments)

                if func_name == "request_appointment":
                    user_id = int(func_args.get("user_id") or 0)
                    if user_id == 0:
                        chat.history.append({
                            "role": "system",
                            "content": "No hay ID de usuario valida, por favor informa al usuario que debe iniciar sesion."
                        })
                        _generated = Hooks.AIModel.message(chat.history, force_plain_reply=True)
                        _choice = _generated.choices[0].message
                        if not _choice.tool_calls or _choice.tool_calls.__len__() < 1:
                            await chat.message(Event(
                                type=EventType.CHAT_MESSAGE,
                                message=Message(
                                    message="No hemos podido continuar con esta conversación...",
                                    chat_id=chat.id,
                                ),
                            ))
                            await manager.close_chat(chat)
                            continue
                        await chat.message(Event(
                            type=EventType.CHAT_MESSAGE,
                            message=Message(
                                message=from_json(_choice.tool_calls[0].function.arguments).get("response_message"),
                                chat_id=chat.id,
                            )
                        ))
                        continue
                    appointment_request = request_an_appointment(user_id)
                    if not appointment_request.success:
                        chat.history.append({
                            "role": "system",
                            "content": "No se ha podido crear la cita, por favor pide al usuario intentar en otro momento."
                        })
                        _generated = Hooks.AIModel.message(chat.history, force_plain_reply=True)
                        _choice = _generated.choices[0].message
                        Hooks.logger(_choice)
                        if not _choice.tool_calls or _choice.tool_calls.__len__() < 1:
                            await chat.message(Event(
                                type=EventType.CHAT_MESSAGE,
                                message=Message(
                                    message="No hemos podido continuar con esta conversación...",
                                    chat_id=chat.id,
                                ),
                            ))
                            await manager.close_chat(chat)
                            continue
                        Hooks.logger(_choice.tool_calls[0].function.arguments)
                        await chat.message(Event(
                            type=EventType.CHAT_MESSAGE,
                            message=Message(
                                message=from_json(_choice.tool_calls[0].function.arguments).get("response_message") or "No se pudo crear la cita...",
                                chat_id=chat.id,
                            )
                        ))
                        continue
                    chat.history.append({
                        "role": "system",
                        "content": f"La cita se creo correctamente con el id '{appointment_request.details}', se puede revisar en '/appointments/{appointment_request.details}'."
                    })
                    __generated = Hooks.AIModel.message(chat.history, force_reply_with_links=True)
                    __choice = __generated.choices[0].message
                    if not __choice.tool_calls or __choice.tool_calls.__len__() < 1:
                        await chat.message(Event(
                            type=EventType.CHAT_MESSAGE,
                            message=Message(
                                message="No se pudo continuar con esta conversacion...",
                                chat_id=chat.id
                            )
                        ))
                        await manager.close_chat(chat)
                        await socket.close()
                        return
                    await chat.message(Event(
                        type=EventType.CHAT_MESSAGE_WITH_LINKS,
                        message=Message(
                            message=from_json(__choice.tool_calls[0].function.arguments).get("response_message") or "No se pudo continuar esta conversación...",
                            links=from_json(__choice.tool_calls[0].function.arguments).get("links"),
                            chat_id=chat.id,
                        )
                    ))
                    continue
                if func_name == "response_with_links":
                    choice = generated.choices[0].message
                    Hooks.logger(choice)
                    if not choice.tool_calls or choice.tool_calls.__len__() < 1:
                        await chat.message(Event(
                            type=EventType.CHAT_MESSAGE,
                            message=Message(
                                message="No se pudo continuar con esta conversacion...",
                                chat_id=chat.id
                            )
                        ))
                        await manager.close_chat(chat)
                        await socket.close()
                        return
                    Hooks.logger(choice.tool_calls[0].function.arguments)
                    await chat.message(Event(
                        type=EventType.CHAT_MESSAGE_WITH_LINKS,
                        message=Message(
                            message=from_json(choice.tool_calls[0].function.arguments).get("response_message"),
                            links=from_json(choice.tool_calls[0].function.arguments).get("links"),
                            chat_id=chat.id,
                        )
                    ))
                    continue
                if func_name == "plain_response":
                    choice = generated.choices[0].message
                    if not choice.tool_calls or choice.tool_calls.__len__() < 1:
                        await chat.message(Event(
                            type=EventType.CHAT_MESSAGE,
                            message=Message(
                                message="No se pudo continuar con esta conversacion...",
                                chat_id=chat.id
                            )
                        ))
                        await manager.close_chat(chat)
                        continue
                    await chat.message(Event(
                        type=EventType.CHAT_MESSAGE,
                        message=Message(
                            message=from_json(choice.tool_calls[0].function.arguments).get("response_message"),
                            chat_id=chat.id
                        )
                    ))
                    continue

@router.websocket("/livechat")
async def live_chat(socket: WebSocket):
    client = await manager.connect(socket)

    if not client:
        return

    current_thread = Thread(target=await chat_handler(socket, client), daemon=True)
    try:
        current_thread.start()
    except WebSocketDisconnect:
        await manager.disconnect(client)

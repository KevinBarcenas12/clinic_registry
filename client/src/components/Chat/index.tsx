import { Fragment, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import ChatBox from "./chatBox";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { MessageTypes } from "../../api/server";
import type { Chat as ChatDef, Message, User } from "../../api/definitions";
import { useAuth } from "../../hooks/useAuth";

interface ServerEvent {
    type: MessageTypes;
    message: Message & { type: MessageTypes };
    date: string;
    client?: string;
    user?: User;
}

export default function Chat() {
    const { token, user } = useAuth()
    const [isOpen, setOpen] = useState<boolean>(false);
    const [chat, setChat] = useState<Required<ChatDef>>({
        id: 0,
        active: true,
        created_at: new Date().toUTCString(),
        medic_id: 8001,
        medic_name: '@Bot',
        user_id: 20001,
        user_name: '@Invitado',
        messages: [],
    });
    const [userMessage, setUserMessage] = useState<string>("");
    const guestUser = {
        id: 20001,
        name: '@Invitado',
    };
    const webSocket = useWebSocket("ws://localhost:8000/livechat", {
        share: true,
        onMessage: function(event) {//[*].+?[*](event.data as string).replace(/[*].+?[*]/g, match => `<strong>${match.substring(1, match.length - 1)}</strong>`)
            console.log(event);
            let message: ServerEvent = JSON.parse(event.data);
            message = {
                ...message,
                message: {
                    ...message.message,
                    message: message.message.message
                    ?.replace(/[*].+?[*]/g, match => `<strong>${match.substring(1, match.length - 1)}</strong>`),
                },
            };
            console.log(message);
            setChat(_chat => {
                switch (message.type) {
                    case MessageTypes.CLIENT_CONNECT:
                        return {
                            ..._chat,
                            id: message.message.chat_id,
                            messages: _chat.messages,
                        };
                    case MessageTypes.CHAT_START:
                    case MessageTypes.CHAT_MESSAGE:
                    case MessageTypes.CHAT_MESSAGE_WITH_LINKS:
                        return {
                            ..._chat,
                            messages: [..._chat.messages, message.message],
                        };
                    default:
                        return _chat;
                };
            });
        },
        onOpen: function(event) {
            // console.log(event);
            let date = new Date()
            webSocket.sendJsonMessage({
                user: user || guestUser,
                token,
                message: {
                    sender_id: user?.id || guestUser.id,
                    sender_name: user?.name || guestUser.name,
                    sent_at: date,
                },
                type: MessageTypes.CLIENT_INFORMATION,
                date: date,
            });
        }
    });

    function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>): void {
        if (webSocket.readyState !== ReadyState.OPEN) return;
        let currentDate = new Date().getTime();
        let jsonMessage: Partial<ServerEvent["message"]> = {
            chat_id: chat.id,
            message: userMessage,
            sender_id: user?.id || guestUser.id,
            sender_name: user?.name || guestUser.name,
            sent_at: currentDate,
        }
        webSocket.sendJsonMessage({
            message: jsonMessage,
            type: MessageTypes.CHAT_MESSAGE,
            date: currentDate,
            token,
            user: user || guestUser,
        });
        setUserMessage("");
    }

    return <Fragment>
        <div className="chat-container">
            {isOpen && <ChatBox
                chat={chat}
                handleMessageSubmit={handleMessageSubmit}
                setUserMessage={setUserMessage}
                userMessage={userMessage}
            />}
        </div>
        <button onClick={() => setOpen(prev => !prev)} className="chat-toggler">
            <MdKeyboardArrowDown className="icon" style={{ transform: `rotate(${isOpen ? 0 : 180}deg)` }} />
        </button>
    </Fragment>;
};

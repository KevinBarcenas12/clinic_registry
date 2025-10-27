import { Fragment, useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import ChatBox from "./chatBox";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { MessageTypes } from "../../api/server";
import { Chat, Message, User } from "../../api/definitions";
import { useAuth } from "../../hooks/useAuth";

interface ServerEvent {
    type: MessageTypes;
    message: Message;
    date: string;
    client?: string;
    user?: User;
}

export default function FloatingChat() {
    const { token, user } = useAuth()
    const [isOpen, setOpen] = useState<boolean>(false);
    const [chat, setChat] = useState<Required<Chat>>({
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
    const webSocket = useWebSocket("ws://localhost:8000/livechat", {
        share: true,
        onMessage: function(event) {

            let message: ServerEvent = JSON.parse(event.data);
            console.log(message);
            setChat(_chat => {
                switch (message.type) {
                    case MessageTypes.CLIENT_CONNECT:
                        return {
                            ..._chat,
                            id: message.message.chat_id,
                            messages: _chat.messages,
                        }
                    case MessageTypes.CHAT_START:
                        return {
                            ..._chat,
                            messages: [..._chat.messages, message.message]
                        }
                    case MessageTypes.CHAT_MESSAGE:
                        return {
                            ..._chat,
                            messages: [..._chat.messages, message.message]
                        }
                    default:
                        return _chat
                }
            });

        }
    });

    useEffect(() => {
        console.log(chat)
    }, [chat]);

    function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>): void {
        if (webSocket.readyState !== ReadyState.OPEN) return;

        setUserMessage("");

        let currentDate = new Date().toUTCString();
        let guestUser = {
            id: 20001,
            name: '@Invitado',
        };
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
    }

    return <Fragment>
        <div className="chat_container">
            {isOpen && <ChatBox
                chat={chat}
                handleMessageSubmit={handleMessageSubmit}
                setUserMessage={setUserMessage}
                userMessage={userMessage}
            />}
        </div>
        <button onClick={() => setOpen(prev => !prev)} className="chat_toggler">
            <MdKeyboardArrowDown className="icon" style={{ transform: `rotate(${isOpen ? 0 : 180}deg)` }} />
        </button>
    </Fragment>;
};

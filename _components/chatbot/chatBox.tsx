import React, { Fragment, useEffect, useState } from "react";
import { FaTruckMedical } from "react-icons/fa6";
import ChatMessage from "./chatMessage";
import ChatForm from "./chatForm";

import { useAuth } from "../../hooks/useAuth";

import type { Chat, State } from "../../api/definitions";

interface Props {
    chat: Chat,
    userMessage: State<string, true>[0],
    setUserMessage: State<string, true>[1],
    handleMessageSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function ChatBox({ chat, userMessage, setUserMessage, handleMessageSubmit }: Props) {
    const { token, user } = useAuth();

    return <div className="chatbot-popup">
        <div className="chat-header">
            <div className="header-info">
                <FaTruckMedical className="icon" />
                <h2 className="logo-text">Medi Chatbot</h2>
            </div>
        </div>
        <div className="chat-body">
            {
                chat?.messages?.map(
                    (message, index) => (
                        <Fragment key={`${message.id}-message`}>
                            {message && <ChatMessage
                                message={message}
                                sender={message.sender_id == chat.medic_id || message.sender_id == 8001}
                                receiver={message.sender_id == chat.user_id || message.sender_id == user?.id || message.sender_id == 20001}
                                key={`message-${index}-${message.id}`}
                            />}
                        </Fragment>
                    )
                )
            }
        </div>
        <div className="chat-footer">
            <ChatForm state={[userMessage, setUserMessage]} onSubmit={handleMessageSubmit} />
        </div>
    </div>
}

import { useEffect, useState } from "react";
import Layout from "../../_components/layout";
import { useAuth } from "../../hooks/useAuth";
import { Chat } from "../../api/definitions";
import { useModal } from "../../_components/modal";
import SuspenseComponent from "../../_components/suspense";

function ChatData({ chat }: { chat: Chat }) {
    return <div className="chat_data">
        <div className=""></div>
    </div>
}

export default function ChatList() {
    const { server, token, user } = useAuth();
    const { addMessage } = useModal()
    const [chats, setChats] = useState<Chat[]>();

    useEffect(() => {
        if (!server) return;

        server.getAllChats()
        .then(response => {
            if (!response.success) {
                addMessage(response.error);
                setChats(undefined);
                return;
            }
            setChats(response.details);
        })
    }, [server])

    return <SuspenseComponent dependency={chats}>
        <Layout full>
            {chats?.map(chat => <ChatData chat={chat} />)}
        </Layout>
    </SuspenseComponent>
}

import { useEffect, useState } from "react";
import type { Chat } from "../../api/definitions";
import { useAuth } from "../../hooks/useAuth";
import { useParams } from "react-router-dom";
import getValidId from "../../hooks/getValidId";
import { useModal } from "../../_components/modal";
import SuspenseComponent from "../../_components/suspense";

export default function ChatId() {
    const [chatInfo, setChatInfo] = useState<Chat>();
    const { addMessage } = useModal();
    const { server } = useAuth();
    const { id } = useParams();

    useEffect(() => {

        if (!server) return;

        let chatId = getValidId(id);
        if (!chatId) return;

        server.getChat(chatId)
        .then(({ success, details, error }) => {
            if (!success || error) {
                setChatInfo(undefined);
                addMessage(error);
                return;
            }
            setChatInfo(details);
        });

    }, [server, id]);

    return <SuspenseComponent dependency={chatInfo}>
        <pre>
            {JSON.stringify(chatInfo, null, 4)}
        </pre>
    </SuspenseComponent>
}

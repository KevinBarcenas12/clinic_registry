import type { Chat } from "../../api/definitions";
import Label from "../../_components/label";
import Link from "../../_components/link";
import { formatDate } from "../../hooks/formatDate";

export default function ChatLabel({ chatInfo }: { chatInfo: Chat }) {
    return <div className="chat">
        <Link to={`/chat/${chatInfo.id}`}>
            <Label title={`${formatDate(chatInfo.created_at)}`} sub={`#${chatInfo.id}`} l={3} />
        </Link>
        <Label title={`Medico: ${chatInfo.medic_name}`} sub={`#${chatInfo.medic_id}`} l={3} />
        <Label title={`Usuario: ${chatInfo.user_name}`} sub={`#${chatInfo.user_id}`} l={3} />
    </div>
}

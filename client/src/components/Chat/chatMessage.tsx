import { FaTruckMedical, FaUser } from "react-icons/fa6";
import type { Message } from "../../api/definitions";
import classNames from "classnames";
import { formatDate } from "../../hooks/formatDate";
import Link from "../Link";
import { useAuth } from "../../hooks/useAuth";

interface Props {
    message: Message;
    sent?: boolean;
    received?: boolean;
}

export default function ChatMessage({ message, sent, received }: Props) {
    const { user } = useAuth();

    return <div className={classNames("message-block", { sent, received })}>

        {received && <div className="avatar"><FaTruckMedical className="icon" /></div>}
        {sent && <div className="avatar"><FaUser className="icon" /></div>}

        <div className="message-content">
            <span className="username">
                {message.sender_name}
            </span>
            <span className="message" dangerouslySetInnerHTML={{ __html: message.message }}></span>
            {message.links && <div className="link-container">
                {message.links.map(link => <Link to={`${(user?.role_id || 0) > 200 ? "" : "/dashboard"}${link}`} key={`link-${link}`} title={link} />)}
            </div>}
        </div>
        <span className="time-sent">
            Enviado {formatDate(+message.sent_at, "short", true)}
        </span>

    </div>
}

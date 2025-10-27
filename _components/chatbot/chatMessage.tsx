import { FaTruckMedical, FaUser } from "react-icons/fa6";
import type { Message } from "../../api/definitions";
import classNames from "classnames";

interface Props {
  message: Message;
  sender?: boolean;
  receiver?: boolean;
}

export default function ChatMessage({ message, sender, receiver }: Props) {
  return <div className={classNames("message", { receiver, sender })}>
    {sender && <div className="avatar"><FaTruckMedical className="icon" /></div>}
    {receiver && <div className="avatar"><FaUser className="icon" /></div>}
    <span className="message-text">{message?.message}</span>
    <span className="username">{message.sender_name}</span>
  </div>
}

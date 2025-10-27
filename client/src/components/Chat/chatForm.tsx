import { IoSend } from "react-icons/io5";
import Input from "../Input";
import Button from "../Button";
import type { State } from "../../api/definitions";

interface Props {
    state: State<string, true>;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function ChatForm({ onSubmit, state: [message, setMessage] }: Props) {
    return <form className="chat-form" onSubmit={event => { event.preventDefault(); onSubmit(event) }}>
        <Input<string, true> state={[message, setMessage]} type="text" required />
        <Button disabled={!message} title={<IoSend className="icon" />} type="submit" />
    </form>
}

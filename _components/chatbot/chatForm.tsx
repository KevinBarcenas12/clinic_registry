import { useState } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";
import Input from "../../components/input";
import Button from "../../components/button";
import type { State } from "../../api/definitions";

interface Props {
    state: State<string, true>;
    // setChatHistory: State<model[]>[1]; // -> change to Message interface
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function ChatForm({ onSubmit, state: [message, setMessage] }: Props) {

    return <form className="chat-form" onSubmit={(e) => { e.preventDefault(); onSubmit(e) }}>
        <Input<string, true> state={[message, setMessage]} type="text" required />
        <Button title={<MdKeyboardArrowUp />} type="submit" />
    </form>
}

import { createContext, Fragment, useContext, useEffect, useState } from "react";
import type { State } from "../api/definitions";
import { IoClose } from "react-icons/io5";
import Button from "../components/Button";

interface ModalProps {
    message?: State<string>[0];
    addMessage: (message: string | undefined) => void;
    removeMessage: () => void;
};
const ModalContext = createContext<ModalProps>({
    message: "",
    addMessage: () => "",
    removeMessage: () => {},
});

export function ModalProvider({ children }: { children?: React.ReactNode }) {
    const [messageList, setMessageList] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>();

    function addMessage(message: string | undefined) {
        if (!message || typeof message !== 'string') return;
        setMessageList(prev => [...(prev || []), message]);
    }

    function removeMessage() {
        if (!messageList) return;
        setMessageList(prev => prev.slice(1));
    }

    useEffect(() => {
        if (!messageList) return;
        setCurrentMessage(messageList[0]);
    }, [messageList]);

    return <ModalContext.Provider value={{ message: currentMessage, addMessage, removeMessage }}>{children}</ModalContext.Provider>
}

export function useModal(): ModalProps {
    return useContext(ModalContext);
}

export function Modal() {
    const { message, removeMessage } = useModal();
    if (typeof message !== 'string') return null;
    return <Fragment>
        {message && <div id="modal">
            <div id='modal-message'>
                <span>{message}</span>
                <Button title={<><IoClose className="icon" /> Close</>} action={() => removeMessage()} type="button" className='close-modal' />
            </div>
        </div>}
    </Fragment>
}

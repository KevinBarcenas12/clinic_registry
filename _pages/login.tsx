// Modules
import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
// Hooks
import { useAuth } from "../hooks/useAuth";
import PageList from "./pagelist";
// Components
import { useModal } from "../client/src/hooks/modal";
import Input from "../_components/input";
import Button from "../_components/button";

export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { validLogin, login } = useAuth();
    const { addMessage } = useModal();

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!username || !password) {
            addMessage("Invalid username or password.");
            return;
        }
        login(username, password)
        .then(({ success, error }) => {
            if (!success) addMessage(error || "Error trying to log in.")
        })
    }

    if (validLogin) return <Navigate to={PageList.dashboard} />

    return <div id="login">
        <form onSubmit={handleSubmit}>
            <img src="/assets/images/Logo2sis.jpg" alt="logo" />
            <Input<string, true> type="text" state={[username, setUsername]} title="Username" />
            <Input<string, true> type="password" state={[password, setPassword]} title="Password" />
            <Button action={() => {}} type="submit" title="Login" />
        </form>
    </div>
}

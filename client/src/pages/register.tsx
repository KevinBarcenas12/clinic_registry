import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useModal } from "../hooks/modal";
import Input from "../components/Input";
import Button from "../components/Button";

import "./login.scss";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { validLogin, login } = useAuth();
    const { addMessage } = useModal();

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!username || !password) {
            addMessage("Usuario o contraseña inválidos.");
            return;
        }
        login(username, password)
        .then(({ success, error }) => {
            if (!success) addMessage(error || "Error al iniciar sesión.");
        });
    }

    if (validLogin) return <Navigate to="/dashboard" />

    return <div className="login">
        <form onSubmit={handleSubmit}>
            <img src="/assets/images/Logo2sis.jpg" alt="logo" />
            <Input<string, true> state={[username, setUsername]} title="Username" type="text" />
            <Input<string, true> state={[password, setPassword]} title="Password" type="password" />
            <Button disabled={!password || !username} action={() => {}} type="submit" title="Login" />
        </form>
    </div>
}

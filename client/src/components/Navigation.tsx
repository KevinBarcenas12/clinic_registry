import { useState } from "react";
import Button from "./Button";
import Link from "./Link";
import { FaUser, FaBuromobelexperte } from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";

export default function Navigation() {
    const [profileOpen, setProfileOpen] = useState(false);
    const { logout, validLogin, user } = useAuth();

    return <nav className="navigation-bar">
        <div className="logo">

        </div>
        <Link to="/" title="Inicio" />
        <div className="profile-handler">
            <Button icon={<FaUser className="icon" />} type="button" className="profile-toggler" action={() => setProfileOpen(prev => !prev)} />
            {profileOpen && <div className="profile-links-container" onClick={() => setProfileOpen(prev => !prev)}>
                {user && <div className="user-info">
                    <span><strong>Nombre:</strong> {user.name}</span>
                    <span><strong>Rol:</strong> {user.role}</span>
                </div>}
                {validLogin && <Link to="/dashboard">
                    <span onClick={() => setProfileOpen(false)}><FaBuromobelexperte className="icon" /> Dashboard</span>
                </Link>}
                {validLogin && <Button action={() => { logout(); setProfileOpen(false) }} icon={<></>} title="Logout" type="button" />}
                {!validLogin && <Link to="/login" title="Login" />}
            </div>}
        </div>
    </nav>
}

import { Fragment, useState } from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md"
import { useAuth } from "../hooks/useAuth";

import Permission from "./permission";
import Button from "./button";
import Link from "./link";

import { PiUserCircleThin } from "react-icons/pi";
import { useModal } from "../client/src/hooks/modal";

export default function Navigation() {
    const { logout, validLogin } = useAuth();
    const [isOpen, setOpen] = useState<boolean>(false);
    const { addMessage } = useModal();

    return <nav id="nav_bar">
        <Link to="/">Home</Link>
        <div id="profile" onClick={() => setOpen(prev => !prev)}>
            <PiUserCircleThin className="icon" />
            {isOpen && <div id="profile_container">
                {
                    validLogin 
                        ? <Fragment>
                            <Link to="/dashboard"><MdOutlineSpaceDashboard className="icon" /> Dashboard</Link>
                            <Permission permission={["chats:view:others", "chats:view:self"]}>
                                <Link to="/chats">Chats</Link>
                            </Permission>
                            <Permission permission={["appointments:view:all", "appointments:view:self"]}>
                                <Link to="/appointments">Citas</Link>
                            </Permission>
                            <Button title="Logout" type="button" action={() => {
                                logout();
                                addMessage("Sesion cerrada.");
                            }} />
                        </Fragment>
                        : <Link to="/login">Login</Link>
                }
            </div>}
        </div>
    </nav>
}

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Container from "../components/Container";
import { Permission } from "../components/PermissionComponents";
import { Roles } from "../hooks/roles";
import { type History, type Appointment, type Chat, User } from "../api/definitions";
import Loader from "../components/Loader";
import { formatDate } from "../hooks/formatDate";
import Cover from "../components/Cover";
import './dashboard.scss';
import Link from "../components/Link";
import Button from "../components/Button";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
    const { server, user, hasPermission } = useAuth();
    const [appointmentList, setAppointmentList] = useState<Appointment[]>();
    const [userHistory, setUserHistory] = useState<History>();
    const [chatList, setChatList] = useState<Chat[]>();
    const [userList, setUserList] = useState<User[]>();
    const [appointmentListError, setAppointmentListError] = useState<string>();
    const [userHistoryError, setUserHistoryError] = useState<string>();
    const [userListError, setUserListError] = useState<string>();
    const [chatListError, setChatListError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);
    const [responseMessage, setResponseMessage] = useState<string>();
    const [responseId, setResponseId] = useState<number>();
    const top = 4;

    useEffect(() => {
        if (!server || !user) return;

        // user history
        server.getHistory(user.id)
        .then(({ success, details, error }) => {
            setUserHistory(details);
            if (!success) setUserHistoryError(error);
        });

        server.getTopUsers(top)
        .then(({ success, details, error }) => {
            console.log(details, error);
            setUserList(details);
            if (!success) setUserListError(error);
        });

        // appointments depending if the user can see other appointments
        (
            user.role_id === Roles.db_codes.patient
                ? server.getTopUserAppointments(user.id, top)
                : server.getTopAppointments(top)
        )
        .then(({ success, details, error }) => {
            setAppointmentList(details);
            if (!success) setAppointmentListError(error);
        });

        // chats depending if the user can see other chats
        (
            user.role_id === Roles.db_codes.patient
                ? server.getTopUserChats(user.id, top)
                : server.getTopChats(top)
        )
        .then(({ success, details, error }) => {
            setChatList(details);
            if (!success) setChatListError(error);
        });

    } , [server, user]);

    function requestAppointment() {
        setLoading(true);

        server?.requestAppointment()
        .then(({ success, details, error }) => {
            if (!success) setResponseMessage(error);
            else setResponseMessage(`Cita creada con éxito. Con el id #${details}`);
            setResponseId(details);
            setLoading(false);
        });
    }

    return <div className="dashboard">
        <Container>
            <Loader dependency={user}>
                {user && <section className="user-info">
                    <h2>Bienvenid{user.gender === "Masculino" ? "o" : "a"} {user.name}!</h2>
                    <h4>{user.role} {user.gender} de {user.age} años.</h4>
                </section>}
            </Loader>
            <section className="user-references">
                {/* Historial */}
                {user?.role_id === Roles.db_codes.patient && <Permission permission="history:view:self">
                    <Loader dependency={userHistory || userHistoryError}>
                        {userHistory && <section className="history-info">
                            <h2>Detalles del {user.role}</h2>
                            <span><strong>Edad:</strong> {user.age} años</span>
                            <span><strong>Correo:</strong> {user.email}</span>
                            <span><strong>Teléfono:</strong> {user.phone}</span>
                            <span><strong>Ubicación:</strong> {user.location}</span>
                            <span><strong>Fecha de Nacimiento:</strong> {formatDate(user.birth_date)}</span>
                            <span><strong>Miembro desde:</strong> {formatDate(user.registered_at)}</span>
                            {/* <span><strong>Creado:</strong> {formatDate(userHistory?.created_at)}</span> */}
                            <span><strong>Medico de cabecera:</strong> {userHistory?.medic_name}</span>
                            <span><strong>Notas médicas:</strong> {userHistory?.notes}</span>
                        </section>}
                        {userHistoryError && <Cover>Sin historial.</Cover>}
                    </Loader>
                </Permission>}
                {/* Lista de usuarios */}
                <Permission permission="users:view:others">
                    <Loader dependency={userList || userListError}>
                        {userList && <section className="user-list">
                            <h2>Usuarios creados recientemente</h2>
                            {userList.map(user => <Link to={`/users/${user.id}`} key={user.id} inline>
                                <div key={user.id} className="user">
                                    <span className="user-id"><strong>Usuario:</strong> #{user.id}</span>
                                    <span className="user-name"><strong>Nombre:</strong> {user.name}</span>
                                    <span className="user-phone"><strong>Teléfono:</strong> {user.phone}</span>
                                    <span className="user-gender"><strong>Género:</strong> {user.gender}</span>
                                    <span className="user-registered_at"><strong>Registrado:</strong> {formatDate(user.registered_at, "short")}</span>
                                </div>
                            </Link>)}
                            <div className="reference"><Link to="/users" title="Ver todos los usuarios" /></div>
                        </section>}
                        {userListError && <Cover>No hay usuarios recientes.</Cover>}
                    </Loader>
                </Permission>
                {/* Lista de chats */}
                <Permission permissions={["chats:view:others", "chats:view:self"]}>
                    <Loader dependency={chatList || chatListError}>
                        <div className="chat-list">
                            <h2>Chats recientes</h2>
                            {chatList && chatList.map(chat => <Link to={`${hasPermission("chats:view:others") ? "" : "/dashboard"}/chats/${chat.id}`} key={chat.id} inline>
                                <div key={chat.id} className="chat">
                                    <span className="chat-id"><strong>Chat</strong> #{chat.id}</span>
                                    <span className="chat-created_at"><strong>Creado:</strong> {formatDate(chat.created_at, "short")}</span>
                                    <span className="chat-medic_name"><strong>Chat con:</strong> {chat.medic_name}</span>
                                    <span className="chat-active">Chat {chat.active ? "activo" : "finalizado"}</span>
                                </div>
                            </Link>)}
                            {chatListError && <Cover>No hay chats recientes.</Cover>}
                            <div className="reference"><Link to={hasPermission("chats:view:others") ? "/chats" : "/dashboard/chats/list"} title="Ver todos los chats" /></div>
                        </div>
                    </Loader>
                </Permission>
                {/* Lista de citas */}
                <Permission permissions={["appointments:view:self", "appointments:view:all"]}>
                    <Loader dependency={appointmentList || appointmentListError}>
                        <div className="appointment-list">
                            <h2>Citas pendientes</h2>
                            {appointmentList && appointmentList.filter(app => new Date(app.date).getTime() > new Date().getTime()).map(appointment => <Link key={appointment.id} to={`${hasPermission("appointments:view:others") ? "" : "/dashboard"}/appointments/${appointment.id}`}>
                                <div className="appointment">
                                    <span className="appointment-id"><strong>Cita</strong> #{appointment.id}</span>
                                    <span className="appointment-date"><strong>Fecha:</strong> {formatDate(appointment.date, "short", true)}</span>
                                    <span className="appointment-diagnose"><strong>Notas:</strong> {appointment.diagnose}</span>
                                    <span className="appointment-medic_name"><strong>Atendid{user?.gender === "Masculino" ? "o" : "a"} por:</strong> {appointment.medic_name}</span>
                                </div>
                            </Link>)}
                            <div className="reference"><Link to={hasPermission("appointments:view:all") ? "/appointments" : "/dashboard/appointments/list"} title="Ver todas las citas" /></div>
                        </div>
                        {appointmentListError && <Cover>No hay citas recientes.</Cover>}
                    </Loader>
                </Permission>
                <Permission permission="appointments:create:self">
                    <Button type="button" title="Solicitar una cita médica" className="request-appointment" action={() => requestAppointment()} />
                </Permission>
            </section>
            <Loader fullscreen dependency={!loading || responseMessage} keep={responseMessage != null}>
                {responseMessage && <span>Cita creada con éxito! <Link action={() => setResponseMessage(undefined)} to={`${hasPermission("appointments:view:others") ? "" : "/dashboard"}/appointments/${responseId}`} title={`Cita #${responseId}`} /></span>}
                {responseMessage && <Button type="button" title="Cerrar" action={() => setResponseMessage(undefined)} />}
            </Loader>

            <Outlet />
        </Container>
    </div>
}

import { Fragment, useEffect, useState } from "react";

import type { PatientInfo, Chat, Appointment, MedicInfo } from "../../api/definitions";

import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../_components/modal";
import getValidId from "../../hooks/getValidId";
import SuspenseComponent from "../../_components/suspense";
import Label from "../../_components/label";
import { formatDate } from "../../hooks/formatDate";
import Link from "../../_components/link";
import PageList from "../pagelist";
import { useParams } from "react-router-dom";
import Permission from "../../_components/permission";
import AppointmentLabel from "../dashboard/appointment";
import ChatLabel from "../dashboard/chat";
import Cover from "../../_components/cover";

function CustomLabel({ name, content, subcontent }: { name: string, content: string, subcontent?: string }) {
    return <div className="label_container">
        <span>{name}:</span>
        <Label title={content} sub={subcontent} l={3} />
    </div>
}

export default function UserInfo() {
    const { user, type, server, hasPermission } = useAuth();
    const [appointmentList, setAppointmentList] = useState<Appointment[]>();
    const [chatList, setChatList] = useState<Chat[]>();
    const [patientData, setPatientData] = useState<PatientInfo>();
    const [appointmentsErrorMessage, setAppointmentsErrorMessage] = useState<string>();
    const [chatErrorMessage, setChatErrorMessage] = useState<string>();
    const [medicData, setMedicData] = useState<MedicInfo>();
    const { addMessage } = useModal();
    const { id } = useParams();

    const AppointmentLimit = 3;
    const ChatLimit = 3;

    function fetchData() {
        if (!server) return;

        let userId = getValidId(id, user?.id);
        if (!userId) return;

        (
            hasPermission("appointments:view:all")
                ? server.getTopAppointments(AppointmentLimit)
                : server.getTopUserAppointments(userId, AppointmentLimit)
        )
        .then(({ success, details, error }) => {
            if (!success || error) {
                setAppointmentList(undefined);
                setAppointmentsErrorMessage(error);
                return;
            }
            setAppointmentList(details);
        });

        (
            hasPermission("chats:view:others")
                ? server.getTopChats(ChatLimit)
                : server.getTopUserChats(userId, ChatLimit)
        )
        .then(({ success, details, error }) => {
            if (!success || error) {
                setChatList(undefined);
                setChatErrorMessage(error);
                return;
            }
            setChatList(details);
        });

        if (!user) return;
        switch (user.role_id) {
            case 300:
                if (!userId) break;
                server.getMedicInfo(userId)
                .then(({ success, details, error }) => {
                    if (!success || error) {
                        setMedicData(undefined);
                        addMessage(error);
                        return;
                    }
                    setMedicData(details);
                });
                break;
            case 100:
                if (!userId) break;
                server.getPatientInfo(userId)
                .then(({ success, details, error }) => {
                    if (!success || error) {
                        setPatientData(undefined);
                        addMessage(error);
                        return;
                    }
                    setPatientData(details);
                });
                break;
            default:
                break;
        }
    };

    useEffect(fetchData, [server, id]);
    useEffect(fetchData, []);

    return <SuspenseComponent dependency={user}>
        <Cover className="user_info">
            <div className="info_container">
                {user && <Fragment>
                    <Label title={user.name} sub={`#${user.id}`} l={2} />
                    <CustomLabel name="Correo" content={user.email} />
                    <CustomLabel name="Fecha de Naciemiento" content={formatDate(user.birth_date, "long")} />
                    <CustomLabel name="Edad" content={`${user.age}`} />
                    <CustomLabel name="Género" content={user.gender} />
                    <CustomLabel name="Teléfono" content={user.phone} />
                    <CustomLabel name="Dirección" content={user.location} />
                    <CustomLabel name="Registrado" content={formatDate(user.registered_at, "long")} />
                    <CustomLabel name="Rol" content={user.role} />
                    {type === "patient" && patientData && <Fragment>
                        <CustomLabel name="Plan" content={patientData.plan_type!} />
                        <CustomLabel name="Expiración del plan" content={formatDate(patientData.plan_expiration!)} />
                        <CustomLabel name="Precio mensual" content={`${patientData.plan_price_month!}$`} />
                    </Fragment>}
                    {type === "medic" && medicData && <Fragment>
                        <CustomLabel name="Clinica asignada" content={`${medicData.clinic_name}`} subcontent={`#${medicData.clinic_id}`} />
                        <CustomLabel name="Id de medico" content={`#${medicData.medic_id!}`} />
                        <CustomLabel name="Especialidad" content={`${medicData.speciality!}`} />
                    </Fragment>}
                    <Permission permission={(!id || id == `${user?.id}`) ? "users:edit:self" : "users:edit:others"}>
                        <div className="actions">
                            <Link to={PageList.user.edit.replace(":id:", `${user.id}`)}>
                                Editar
                            </Link>
                            <Link to={PageList.user.list}>
                                Lista de usuarios
                            </Link>
                        </div>
                    </Permission>
                </Fragment>}
            </div>
        </Cover>
        <Cover className="appointment_list">
            <SuspenseComponent dependency={appointmentList || appointmentsErrorMessage}>
                {appointmentList && <Fragment>
                    {appointmentList.map(appointment => <AppointmentLabel data={appointment} key={appointment.id} />)}
                </Fragment>}
                {appointmentsErrorMessage && <div className="message">{appointmentsErrorMessage}</div>}
            </SuspenseComponent>
        </Cover>
        <Cover className="chat_list">
            <SuspenseComponent dependency={chatList || chatErrorMessage}>
                {chatList && <Fragment>
                    {chatList.map(chat => <ChatLabel chatInfo={chat} key={chat.id} />)}
                </Fragment>}
                {chatErrorMessage && <section className="message">{chatErrorMessage}</section>}
            </SuspenseComponent>
        </Cover>
    </SuspenseComponent>
}

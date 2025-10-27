import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import { History, MedicInfo, PatientInfo, User, } from "../../api/definitions";
import { useAuth } from "../../hooks/useAuth";
import Container from "../../components/Container";
import Loader from "../../components/Loader";
import { Roles } from "../../hooks/roles";
import { formatDate } from "../../hooks/formatDate";
import Link from "../../components/Link";
import { useModal } from "../../hooks/modal";

export default function UserFromId() {
    const { server } = useAuth();
    const { id } = useParams();
    const { addMessage } = useModal();

    const [userData, setUserData] = useState<User>();
    // const [userDataError, setUserDataError] = useState<string>();
    const [userHistory, setUserHistory] = useState<History>();
    const [userMedic, setUserMedic] = useState<MedicInfo>();
    const [userPatient, setUserPatient] = useState<PatientInfo>();

    const [isEditing, setEditing] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        setEditing(location.pathname.endsWith("/edit"));
    }, [location.pathname]);

    function updateInfo() {
        if (!id || !server) return;

        setUserData(undefined);
        setUserHistory(undefined);
        setUserMedic(undefined);
        setUserPatient(undefined);

        server.getUser(+id)
        .then(({ success, details, error }) => {
            setUserData(details?.user_data);
            if (!success) addMessage(error);
        });

        server.getHistory(+id)
        .then(({ details }) => {
            setUserHistory(details);
        });

        server.getMedicInfo(+id)
        .then(({ details }) => {
            setUserMedic(details);
        });

        server.getPatientInfo(+id)
        .then(({ details }) => {
            setUserPatient(details);
        });
    }

    useEffect(() => {
        if (!isEditing) updateInfo();
        // eslint-disable-next-line
    }, [isEditing])

    useEffect(() => {
        updateInfo();
        // eslint-disable-next-line
    }, [id, server]);

    // console.log(userData, userMedic, userHistory);

    if (!id) return <Navigate to="/dashboard" />

    function Label({ data, title }: { title: string; data: string | number }) {
        return <div className="label">
            <span><strong>{title}:</strong></span><br />
            <span>{data}</span>
        </div>
    }

    // console.log(typeof userHistory?.last_modified_at, userHistory?.created_at);

    return <div className="user-info-content">
        <Loader dependency={userData}>
            {userData && <Container className="info-container">
                <h2>Informacion del usuario #{userData.id}</h2>
                <Label title="Id" data={userData.id} />
                <Label title="Nombre" data={userData.name} />
                <Label title="Edad" data={userData.age} />
                <Label title="Fecha de nacimiento" data={formatDate(userData.birth_date)} />
                <Label title="Correo" data={userData.email} />
                <Label title="Género" data={userData.gender} />
                <Label title="Ubicación" data={userData.location} />
                <Label title="Teléfono" data={userData.phone} />
                <Label title="Rol" data={Roles.public_codes[userData.role_id]} />
                <Label title="Registrado" data={formatDate(userData.registered_at, "long")} />
                {userPatient && <Fragment>
                    <Label title="Plan medico" data={userPatient.plan_type} />
                    <Label title="Expiración del plan" data={formatDate(userPatient.plan_expiration)} />
                    <Label title="Precio mensual" data={`${userPatient.plan_price_month.toFixed(2)}$`} />
                    <Label title="Paciente activo" data={userPatient.active ? "Si" : "No"} />
                </Fragment>}
                {userHistory && <Fragment>
                    <Label title="Médico de cabecera" data={userHistory.medic_name} />
                    <Label title="Modificado" data={formatDate(userHistory.last_modified_at)} />
                    <Label title="Creado" data={formatDate(userHistory.created_at)} />
                    <Label title="Notas médicas" data={userHistory.notes} />
                    {userHistory.appointments && <div className="appointment-list">
                        <span className="title"><strong>Citas:</strong></span>
                        {userHistory.appointments.filter((_, index) => index < 2).map(appointment => <div key={appointment.id} className="appointment">
                            <Label title="Atendido en" data={appointment.clinic_name} />
                            <Label title="Fecha" data={formatDate(appointment.date)} />
                            <Label title="Diagnostico" data={appointment.diagnose} />
                            <Label title="Tratamiento realizado" data={appointment.treatment} />
                            <Label title="Medico encargado" data={appointment.medic_name} />
                        </div>)}
                    </div>}
                </Fragment>}
                {userMedic && <Fragment>
                    <Label title="Clinica asignada" data={userMedic.clinic_name} />
                    <Label title="Especialidad" data={userMedic.speciality} />
                    <Label title="Medico activo" data={userMedic.active ? "Si" : "No"} />
                </Fragment>}
                <div className="links">
                    <Link to={`/users/${userData.id}/edit`} title="Editar" />
                </div>
            </Container>}
        </Loader>
        <Outlet />
    </div>
}

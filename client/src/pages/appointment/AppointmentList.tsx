/* eslint-disable eqeqeq */
import { useEffect, useState } from "react";
import RangeSlider from "../../components/RangeSlider";
import { formatDate } from "../../hooks/formatDate";

import type { Appointment, Clinic } from "../../api/definitions";
import { useAuth } from "../../hooks/useAuth";
import { Roles } from "../../hooks/roles";
import { useModal } from "../../hooks/modal";
import Loader from "../../components/Loader";
import Link from "../../components/Link";
import Container from "../../components/Container";
import { Outlet, useParams } from "react-router-dom";
import Input from "../../components/Input";

import "./appointment-styles.scss";
import classNames from "classnames";

interface Range {
    min: number;
    max: number;
}

export default function AppointmentList() {
    const { server, user } = useAuth();
    const { addMessage } = useModal();
    const { id } = useParams();

    const [createdRange, setCreatedRange] = useState<Range>({ min: 0, max: 1 });
    const [createdLimit, setCreatedLimit] = useState<Range>({ min: 0, max: 1 });
    const [assignedClinic, setAssignedClinic] = useState<number>(0);
    const [clinics, setClinics] = useState<Clinic[]>();
    const [onlyPending, setOnlyPending] = useState<number>(0);

    const [appointmentList, setAppointmentList] = useState<Appointment[]>();

    useEffect(() => {
        if (!server || !user) return;

        (
            user.role_id === Roles.db_codes.patient
                ? server.getUserAppointments(user.id)
                : server.getAllAppointments()
        )
        .then(({ success, details, error }) => {
            setAppointmentList(details);
            if (!success) addMessage(error);
        });

        server.getClinics()
        .then(({ success, details, error }) => {
            setClinics(details);
        });
        // eslint-disable-next-line
    }, [server]);

    useEffect(() => {
        if (!appointmentList) return;

        let createdMin = 100000000000000;
        let createdMax = 0;
        appointmentList.forEach(appointment => {
            let created = new Date(appointment.date).getTime();
            if (created < createdMin) createdMin = created;
            if (created > createdMax) createdMax = created;
        });
        setCreatedRange({ min: createdMin, max: createdMax });
        setCreatedLimit({ min: createdMin, max: createdMax });
        // console.log({ min: createdMin, max: createdMax });
    }, [appointmentList]);

    return <Container className="appointment-list main-container">
        <h2>Listado de citas</h2>

        <div className="filters">
            <RangeSlider<true> range={{ ...createdLimit, step: 1000 * 60 * 60 * 24 }} state={[createdRange, setCreatedRange]} title={<span><strong>Creado:</strong> entre {formatDate(createdRange.min)} y {formatDate(createdRange.max)}</span>} />
            <Input<number, true> state={[assignedClinic, setAssignedClinic]} title="Clínica" options={[
                { name: 'No filtrar', value: 0 },
                ...(clinics?.map(clinic => ({ name: `${clinic.name}, ${clinic.location}`, value: clinic.id })) || [])
            ]} />
            <Input<number, true> state={[onlyPending, setOnlyPending]} title="Mostar solo pendientes" options={[
                { name: 'Si', value: 1 },
                { name: 'No', value: 0 },
            ]} />
        </div>

        <Loader dependency={appointmentList}>
            <div className="appointments">
                {appointmentList && appointmentList
                .filter(appointment => onlyPending != 0 ? new Date(appointment.date).getTime() >= new Date().getTime() : true)
                .filter(appointment => createdRange ? new Date(appointment.date).getTime() >= new Date(createdRange.min).getTime() : true)
                .filter(appointment => createdRange ? new Date(appointment.date).getTime() <= new Date(createdRange.max).getTime() : true)
                .filter(appointment => assignedClinic != 0 ? +appointment.clinic_id == assignedClinic : true)
                .map(appointment => <Link to={`/appointments/${appointment.id}`} key={appointment.id}>
                    <div className={classNames("appointment", { active: id != null && +id === appointment.id })}>
                        <span className="appointment-id"><strong>Id:</strong><br /> {appointment.id}</span>
                        <span className="appointment-date"><strong>Fecha:</strong><br /> {formatDate(appointment.date, "long", true)}</span>
                        <span className="appointment-user_name"><strong>Nombre:</strong><br /> {appointment.user_name}</span>
                        <span className="appointment-medic_name"><strong>Médico:</strong><br /> {appointment.medic_name}</span>
                    </div>
                </Link>)}
            </div>
        </Loader>

        <Outlet />
    </Container>
}

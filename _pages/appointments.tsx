import { useEffect, useState } from "react";
import type { Appointment } from "../api/definitions";
import { useAuth } from "../hooks/useAuth";
import { useParams } from "react-router-dom";
import getValidId from "../hooks/getValidId";
import { useModal } from "../_components/modal";
import SuspenseComponent from "../_components/suspense";

export default function Appointment() {
    const [appointmentInfo, setAppointmentInfo] = useState<Appointment>();
    const { addMessage } = useModal();
    const { server } = useAuth();
    const { id } = useParams();

    useEffect(() => {

        if (!server) return;

        let appointmentId = getValidId(id);
        if (!appointmentId) return;

        server.getAppointment(appointmentId)
        .then(({ success, details, error }) => {
            if (!success || error) {
                setAppointmentInfo(undefined);
                addMessage(error);
                return;
            }
            setAppointmentInfo(details);
        });

    }, [server, id]);

    return <SuspenseComponent dependency={appointmentInfo}>
        <pre>
            {JSON.stringify(appointmentInfo, null, 4)}
        </pre>
    </SuspenseComponent>
}

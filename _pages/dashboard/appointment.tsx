// API
import type { Appointment } from "../../api/definitions";
// Components
import Label from "../../_components/label";
import { formatDate } from "../../hooks/formatDate";
import Link from "../../_components/link";

export default function AppointmentLabel({ data: appointmentInfo }: { data: Appointment }) {

    return <div className="appointment">
        <Link to={`/appointments/${appointmentInfo.id}`}>
            <Label title={`${appointmentInfo.clinic_name}`} sub={`#${appointmentInfo.id}`} l={3} />
        </Link>
        <Label title={`Fecha: ${formatDate(appointmentInfo.date)}`} l={3} />
        <Label title={`Diagnostico: ${appointmentInfo.diagnose}`} l={3} />
        <Label title={`Evaluado por: ${appointmentInfo.medic_name}`} sub={`#${appointmentInfo.medic_id}`} l={3} />
    </div>
}

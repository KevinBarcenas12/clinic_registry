import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"


export default function AppointmentFromId() {
    const { server } = useAuth();
    const { id } = useParams();

    return <div className="appointment-info">
        {id}
    </div>
}

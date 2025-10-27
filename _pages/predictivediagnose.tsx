import { useEffect, useState, Suspense } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import getValidId from "../hooks/getValidId";
import { Prediction } from "../api/definitions";

export default function PredictiveDiagnose({className = ""}) {
    const [prediction, setPrediction] = useState<Prediction>();
    const [error, setError] = useState<string>();
    const { server } = useAuth();
    const { id } = useParams();

    useEffect(() => {
        if (!server) return;
        setPrediction(undefined); // -> undefined
        setError(undefined);

        let patientId = getValidId(id);
        if (!patientId) return;

        server.getPrediction(patientId)
        .then(response => {
            if (!response.success) {
                setError("No se pudo obtener la predicción médica")
                return;
            }
            setPrediction(response.details);
        });
    }, [id, server]);

    const formatDate = (datestr: string) => {
        return new Date(datestr).toLocaleDateString("es-HN",{
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    return <Suspense fallback={<>Loading...</>}>
        <div className={`predictive_diagnose ${className}`}>
            <h3>Predicción Médica</h3>
            <div className="prediction-details">
                <p><strong>Posible Condición:</strong>{prediction?.diagnose}</p>
                <p><strong>Probabilidad:</strong>{prediction?.probability.toFixed(2)}%</p>
                <p><strong>Fecha de Predicción:</strong>{prediction?.date && formatDate(prediction.date)}</p>
            </div>
        </div>
    </Suspense>
}

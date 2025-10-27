import { Fragment, useEffect, useState } from "react";
import { Clinic, History, MedicalPlan, MedicInfo, PatientInfo, type Role, type User } from "../../api/definitions";
import Cover from "../../components/Cover";
import Link from "../../components/Link";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../hooks/modal";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import { Roles } from "../../hooks/roles";
import Button from "../../components/Button";

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

function getAge(date: Date) {
    let diff = new Date().getTime() - date.getTime();
    let age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
}

const daysPerMonth = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
};

export default function UserEdit() {
    const { id } = useParams();
    const { server, user } = useAuth();
    const { addMessage } = useModal();

    // Global/Imported values
    const [userData, setUserData] = useState<User>();
    const [patientData, setPatientData] = useState<PatientInfo>();
    const [historyData, setHistoryData] = useState<History>();
    const [medicData, setMedicData] = useState<MedicInfo>();
    const [clinics, setClinics] = useState<Clinic[]>();
    const [medicalPlans, setMedicalPlans] = useState<MedicalPlan[]>();
    const [activeMedics, setActiveMedics] = useState<MedicInfo[]>();

    // Individual/Local values
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [age, setAge] = useState<number>(0);
    const [location, setLocation] = useState<string>("");
    const [role, setRole] = useState<Role>(100);
    const [dobDay, setDobDay] = useState<number>(0);
    const [dobMonth, setDobMonth] = useState<Month>(1);
    const [dobYear, setDobYear] = useState<number>(0);
    // User Plan
    const [planId, setPlanId] = useState<number>(0);
    // User History
    const [assignedMedic, setAssignedMedic] = useState<number>(0);
    const [notes, setNotes] = useState<string>("");
    // Medic
    const [assignedClinic, setAssignedClinic] = useState<number>(0);
    const [speciality, setSpeciality] = useState<string>("");
    const [isActive, setActive] = useState<boolean>(false);

    const [userDiffer, setUserDiffer] = useState<boolean>(false);
    const [patientDiffer, setPatientDiffer] = useState<boolean>(false);
    const [historyDiffer, setHistoryDiffer] = useState<boolean>(false);
    const [medicDiffer, setMedicDiffer] = useState<boolean>(false);

    const [loadingMedic, setLoadingMedic] = useState<boolean>(false);
    const [loadingUser, setLoadingUser] = useState<boolean>(false);
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
    const [loadingPatient, setLoadingPatient] = useState<boolean>(false);

    function updateData() {
        if (!server || !id) return;
        server.getActiveMedics()
        .then(({ success, details, error }) => {
            setActiveMedics(details);
            if (!success) addMessage(error);
        });
        server.getClinics()
        .then(({ success, details, error }) => {
            setClinics(details);
            if (!success) addMessage(error);
        });
        server.getMedicalPlans()
        .then(({ success, details, error }) => {
            setMedicalPlans(details);
            if (!success) addMessage(error);
        });
        server.getUser(+id)
        .then(({ success, details, error }) => {
            const user = details?.user_data;
            setUserData(user);
            if (!success) {
                addMessage(error);
                return;
            }
            if (user?.role_id === Roles.db_codes.medic)
                server.getMedicInfo(+id)
                .then(({ success, details, error }) => {
                    setMedicData(details);
                    if (!success) addMessage(error);
                });
            if (user?.role_id === Roles.db_codes.patient){
                server.getPatientInfo(+id)
                .then(({ success, details, error }) => {
                    setPatientData(details);
                    if (!success) addMessage(error);
                });
                server.getHistory(+id)
                .then(({ success, details, error }) => {
                    setHistoryData(details);
                    if (!success) addMessage(error);
                });
            }
        });
    }

    useEffect(() => {
        updateData();
        // eslint-disable-next-line
    }, [server, id]);

    useEffect(() => {
        if (!userData) return;
        const dob = new Date(userData.birth_date);
        setName(userData.name);
        setEmail(userData.email);
        setPhone(userData.phone);
        setLocation(userData.location);
        setRole(userData.role_id);
        setAge(getAge(dob));
        setDobMonth(dob.getMonth() + 1 as Month);
        setDobDay(dob.getDay() + 1);
        setDobYear(dob.getFullYear());
    }, [userData]);
    useEffect(() => {
        if (!historyData) return;
        setAssignedMedic(historyData.medic_id);
        setNotes(historyData.notes);
    }, [historyData]);
    useEffect(() => {
        if (!medicData) return;
        setAssignedClinic(medicData.clinic_id);
        setSpeciality(medicData.speciality);
        setActive(medicData.active);
    }, [medicData]);
    useEffect(() => {
        if (!patientData) return;
        setPlanId(patientData.plan_id);
        setActive(patientData.active);
    }, [patientData]);

    useEffect(() => {
        // console.log(dobDay, dobMonth, dobYear);
        if (!dobDay || !dobMonth || !dobYear) return;
        console.log(new Date(`${dobMonth}-${dobDay}-${dobYear}`));
        setAge(getAge(new Date(`${dobMonth}-${dobDay}-${dobYear}`)));
    }, [dobDay, dobMonth, dobYear]);

    useEffect(() => {
        if (userData){
            if (
                userData.name !== name ||
                userData.age !== age ||
                new Date(userData.birth_date).getTime() !== new Date(`${dobMonth}-${dobDay}-${dobYear}`).getTime() ||
                userData.location !== location ||
                userData.role_id !== role ||
                userData.email !== email ||
                userData.phone !== phone
            ) setUserDiffer(true);
            else setUserDiffer(false);
        }
        if (patientData) {
            if (
                patientData.active !== isActive ||
                patientData.plan_id !== planId
            ) setPatientDiffer(true);
            else setPatientDiffer(false);
        }
        if (historyData){
            if (
                historyData.medic_id !== assignedMedic ||
                historyData.notes !== notes
            ) setHistoryDiffer(true);
            else setHistoryDiffer(false);
        }
        if (medicData) {
            if (
                medicData.active !== isActive ||
                medicData.clinic_id !== assignedClinic ||
                medicData.speciality !== speciality
            ) setMedicDiffer(true);
            else setMedicDiffer(false);
        }
    }, [
        userData,
        patientData,
        historyData,
        medicData,
        name,
        age,
        location,
        email,
        phone,
        role,
        planId,
        assignedMedic,
        notes,
        assignedClinic,
        speciality,
        isActive,
        dobDay,
        dobMonth,
        dobYear,
    ]);

    function handleSubmit() {
        if (!server || !(medicDiffer || userDiffer || patientDiffer || historyDiffer)) return;
        if (medicDiffer) {
            setLoadingMedic(true);
            const clinic = clinics?.find(clinic => clinic.id === assignedClinic)
            server.updateMedic(+id!, {
                active: isActive,
                clinic_id: assignedClinic,
                clinic_name: `${clinic?.name}, ${clinic?.location}`,
                speciality,
            })
            .then(({ success, error }) => {
                if (!success) addMessage(error);
                setLoadingMedic(false);
            });
        }
        if (userDiffer) {
            setLoadingUser(true);
            server.updateUser(+id!, {
                name,
                age,
                location,
                role_id: role,
                birth_date: new Date(`${dobMonth}-${dobDay}-${dobYear}`).getTime(),
                email,
                phone,
            })
            .then(({ success, error }) => {
                if (!success) addMessage(error);
                setLoadingUser(false);
                updateData();
            });
        }
        if (patientDiffer) {
            setLoadingPatient(true);
            const plan = medicalPlans?.find(plan => plan.id === planId);
            const today = new Date();
            server.updatePatient(+id!, {
                plan_id: planId,
                plan_benefit_level: plan?.benefit_level,
                plan_expiration: new Date(`${today.getMonth() + 1}-${today.getDay()}-${today.getFullYear() + (plan?.duration || 1)}`).getTime(),
                plan_price_month: plan?.price_month,
                plan_type: plan?.type,
                active: isActive,
            })
            .then(({ success, error }) => {
                if (!success) addMessage(error);
                setLoadingPatient(false);
            });
        }
        if (historyDiffer) {
            setLoadingHistory(true);
            server.updateHistory(+id!, {
                medic_id: assignedMedic,
                medic_name: activeMedics?.find(medic => medic.id === assignedMedic)?.medic_name,
                notes,
            })
            .then(({ success, error }) => {
                if (!success) addMessage(error);
                setLoadingHistory(false);
            });
        }
    }

    return <Cover fullscreen className="edit-user">
        <h2>Editar informacion del usuario #{id}</h2>
        <Loader dependency={!(loadingMedic || loadingHistory || loadingUser || loadingPatient) && userData}>
            {userData && <div className="edit-container">
                <Input<string, true> state={[name, setName]} title="Nombre" />
                <Input<string, true> state={[email, setEmail]} title="Correo" />
                <Input<string, true> state={[phone, setPhone]} title="Teléfono" />
                <Input<Role, true> state={[role, setRole]} title="Rol" options={[
                    { name: "Paciente", value: 100 },
                    { name: "Recepcionista", value: 200 },
                    { name: "Médico", value: 300 },
                    { name: "Administrador", value: 400 },
                ].filter(each => each.value <= (user?.role_id || 300)) as { name: string, value: Role }[]} />
                <Input<string, true> state={[location, setLocation]} className="location" title="Ubicación" />
                <div className="dob_edit">
                    <div className="dob-estimated">{age} años</div>
                    <Input<number, true> state={[dobDay, setDobDay]} min={0} max={daysPerMonth[dobMonth || 1]} title="Dia" type="number" />
                    <Input<Month, true> state={[dobMonth, setDobMonth]} title="Mes" type="number" options={[
                        { name: "Enero", value: 1 },
                        { name: "Febrero", value: 2 },
                        { name: "Marzo", value: 3 },
                        { name: "Abril", value: 4 },
                        { name: "Mayo", value: 5 },
                        { name: "Junio", value: 6 },
                        { name: "Julio", value: 7 },
                        { name: "Agosto", value: 8 },
                        { name: "Septiembre", value: 9 },
                        { name: "Octubre", value: 10 },
                        { name: "Noviembre", value: 11 },
                        { name: "Diciembre", value: 12 },
                    ]} />
                    <Input<number, true> state={[dobYear, setDobYear]} title="Año" type="number" />
                </div>
                {patientData && <Fragment>
                    <Input<number, true> state={[planId, setPlanId]} title="Plan" type="number" options={
                        medicalPlans?.map(
                            plan => ({
                                name: `${plan.type} | ${plan.price_month.toFixed(2)}$/mes (${plan.duration} año${plan.duration > 1 ? "s" : ""})`,
                                value: plan.id
                            })
                        ) || []
                    } />
                </Fragment>}
                {historyData && <Fragment>
                    <Input<number, true> state={[assignedMedic, setAssignedMedic]} title="Médico asignado" options={
                        activeMedics?.map(
                            medic => ({ name: `${medic.medic_name}, desde ${medic.clinic_name}`, value: medic.id })
                        ) || []
                    } />
                    <Input<string, true> state={[notes, setNotes]} title="Notas médicas" type="text" className="notes" />
                </Fragment>}
            </div>}
        </Loader>
        <div className="buttons">
            {(medicDiffer || userDiffer || patientDiffer || historyDiffer) && <Button type="button" action={handleSubmit} title="Actualizar" />}
            <Link to={id ? `/users/${id}` : "/users"} title="Volver" />
        </div>
    </Cover>
}

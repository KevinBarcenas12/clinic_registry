import { Fragment, useEffect, useState } from "react";

import { type FullUser, type User, type Role, MedicalPlan, Clinic } from "../../api/definitions";

import { useModal } from "../../_components/modal";
import Input from "../../_components/input";
import Cover from "../../_components/cover";
import Link from "../../_components/link";

import PageList from "../pagelist";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import getValidId from "../../hooks/getValidId";
import { Roles } from "../../hooks/roles";
import SuspenseComponent from "../../_components/suspense";
import Label from "../../_components/label";

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

function getAge(birth_date: string) {
    let diff = new Date().getTime() - new Date(birth_date).getTime();
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

export default function EditUser() {
    const { server, user } = useAuth();
    const [userInfo, setUserInfo] = useState<FullUser>();

    const [name, setName] = useState<string>();
    const [email, setEmail] = useState<string>();
    const [phone, setPhone] = useState<string>();
    const [age, setAge] = useState<number>();
    const [location, setLocation] = useState<string>();
    const [role, setRole] = useState<Role>();
    const [dobDay, setDobDay] = useState<number>();
    const [dobMonth, setDobMonth] = useState<Month>();
    const [dobYear, setDobYear] = useState<number>();
    const [planId, setPlanId] = useState<number>();
    const [planExpiration, setPlanExpiration] = useState<string>();
    const [planPrice, setPlanPrice] = useState<number>();
    const [clinicId, setClinicId] = useState<number>();
    const [speciality, setSpeciality] = useState<string>();

    const [availablePlans, setAvailablePlans] = useState<MedicalPlan[]>();
    const [clinics, setClinics] = useState<Clinic[]>()

    const { addMessage } = useModal();
    const { id } = useParams();

    useEffect(() => {
        if (!server) return;

        let userId = getValidId(id, user?.id);
        if (!userId) return;

        server.getClinics()
        .then(({ success, details, error }) => {
            if (!success || error) {
                setClinics(undefined);
                addMessage(error);
                return;
            }
            setClinics(details);
        });

        server.getMedicalPlans()
        .then(({ success, details, error }) => {
            if (!success || error) {
                setAvailablePlans(undefined);
                addMessage(error);
                return;
            }
            setAvailablePlans(details);
        });

        server.getUser(userId)
        .then(({ success, details, error }) => {
            if (!success || error) {
                setUserInfo(undefined);
                addMessage(error);
                return;
            }
            const user = details?.user_data;
            setUserInfo(user);

            if (user?.role_id == 300) {
                server.getMedicInfo(user.id)
                .then(({ success, details, error }) => {
                    if (!success || error) {
                        setClinicId(undefined);
                        setSpeciality(undefined);
                        addMessage(error);
                        return;
                    }
                    setClinicId(details?.clinic_id);
                    setSpeciality(details?.speciality);
                });
            }
            if (user?.role_id == 100) {
                server.getPatientInfo(user.id)
                .then(({ success, details, error }) => {
                    if (!success || error) {
                        addMessage(error);
                        return;
                    }
                    setPlanId(details?.plan_id);
                    setPlanExpiration(details?.plan_expiration);
                    setPlanPrice(details?.plan_price_month);
                });
            }
        });
    }, [id]);

    useEffect(() => {
        if (!userInfo) return;

        setName(userInfo.name);
        setPhone(userInfo.phone);
        setEmail(userInfo.email);
        setDobMonth(parseInt(userInfo.birth_date?.split("-")[0]) as Month);
        setDobDay(parseInt(userInfo.birth_date?.split("-")[1]));
        setDobYear(parseInt(userInfo.birth_date?.split("-")[2]));
        setAge(getAge(userInfo.birth_date));
        setLocation(userInfo.location);
        setRole(userInfo.role_id);
    }, [userInfo]);

    useEffect(() => {
        if (!dobDay || !dobMonth || !dobYear) return;
        setAge(getAge(`${dobMonth}-${dobDay}-${dobYear}`));
    }, [dobDay, dobMonth, dobYear]);

    return <Fragment>
        <SuspenseComponent dependency={userInfo}>
            <Cover className="edit_user_container">
                <div id="edit_user">
                    <h2>Edit user {userInfo?.name}</h2>
                    <Input<string> state={[name, setName]} title="Nombre" />
                    <Input<string> state={[email, setEmail]} title="Correo" />
                    <Input<string> state={[phone, setPhone]} title="Teléfono" />
                    <Input<Role> state={[role, setRole]} title="Rol" options={
                        userInfo?.role == "Administrador"
                            ? [
                                { name: "Paciente", value: 100 },
                                { name: "Recepcionista", value: 200 },
                                { name: "Médico", value: 300 },
                                { name: "Administrador", value: 400 },
                            ]
                            : userInfo?.role_id
                                ? [
                                    { name: "Paciente", value: 100 },
                                    { name: userInfo.role, value: userInfo.role_id },
                                ]
                                : [
                                    { name: "Paciente", value: 100 },
                                ]
                    } />
                    <Input<string> state={[location, setLocation]} className="location" title="Ubicación" />
                    <div className="dob_edit">
                        <div><Label title={`${age} años`} l={2} /></div>
                        <Input<number> state={[dobDay, setDobDay]} min={0} max={daysPerMonth[dobMonth || 1]} title="Dia" type="number" />
                        <Input<Month> state={[dobMonth, setDobMonth]} title="Mes" type="number" options={[
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
                        <Input<number> state={[dobYear, setDobYear]} title="Año" type="number" />
                    </div>
                    {
                        userInfo?.role == "Médico" && <Fragment>
                            <Input<number> state={[clinicId, setClinicId]} title="Clinica" type="number" options={
                                clinics?.map(clinic => ({ name: `${clinic.name}, ${clinic.location}`, value: clinic.id })) || []
                            } />
                            <Input<string> state={[speciality, setSpeciality]} title="Especialidad" type="text" />
                        </Fragment>
                    }
                    {
                        userInfo?.role == "Paciente" && <Fragment>
                            <Input<number> state={[planId, setPlanId]} title="Plan" type="number" options={
                                availablePlans?.map(plan => ({ name: `${plan.type} | ${plan.price_month} (${plan.expires}a)`, value: plan.id })) || []
                            } />
                            <Input<number> state={[planPrice, setPlanPrice]} title="Precio del plan" type="number" />
                        </Fragment>
                    }
                    <Link to={PageList.dashboard}>Volver</Link>
                </div>
            </Cover>
        </SuspenseComponent>
    </Fragment>
}

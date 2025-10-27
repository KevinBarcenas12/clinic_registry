import { useState } from "react";
import Cover from "../../_components/cover";
import type { Role } from "../../api/definitions";

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

export default function AddUser() {
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

    return <Cover>
        
    </Cover>
}

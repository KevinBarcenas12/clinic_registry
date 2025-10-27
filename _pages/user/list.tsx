import classNames from "classnames";
import { Role, User } from "../../api/definitions";
import Layout from "../../_components/layout";
import SuspenseComponent from "../../_components/suspense";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import Input from "../../_components/input";
import { Roles } from "../../hooks/roles";
import Cover from "../../_components/cover";

function UserComponent({ userInfo }: { userInfo: User }) {
    // console.log(userInfo);
    return <div className={classNames("user_information", Roles.Codes[userInfo.role_id])}>
        <div className="user_information_section">
            <div className="user_name">{userInfo.name}</div>
            <div className="user_role">{userInfo.role}</div>
            <div className="user_age">{userInfo.age}</div>
            <div className="user_phone">{userInfo.phone}</div>
        </div>
        <div className="user_links">

        </div>
    </div>
}

export default function UserList() {
    const { server, user } = useAuth();
    const [userList, setUserList] = useState<User[]>();
    const [errorMessage, setErrorMessage] = useState<string>();
    // Filters
    const [minAge, setMinAge] = useState<number>(0);
    const [maxAge, setMaxAge] = useState<number>(100);
    const [minRegistered, setMinRegistered] = useState<number>(0);
    const [maxRegistered, setMaxRegistered] = useState<number>(1000000000000);
    const [roleFilter, setRoleFilter] = useState<Role | 0>(0);
    const [genderFilter, setGenderFilter] = useState<"Masculino" | "Femenino" | "None">();

    useEffect(() => {
        if (!server) return;
        (
            (user?.role === "Administrador")
                ? server.getAllUsers()
                : server.getAllActiveUsers()
        )
        .then(response => {
            if (!response.success) {
                setUserList(undefined);
                setErrorMessage(response.error);
                return;
            }

            setUserList(response.details);
            setErrorMessage(undefined);
        });
    }, [server]);

    useEffect(() => {
        if (!userList) return;
        let _minAge = 100;
        let _maxAge = 0;
        let _minRegistered = 10000000000000;
        let _maxRegistered = 0;
        userList.forEach(user => {
            if ([20000, 20001].includes(user.id)) return;
            if (user.age < _minAge) _minAge = user.age;
            if (user.age > _maxAge) _maxAge = user.age;
            let registered = new Date(user.registered_at).getTime();
            if (registered < _minRegistered) _minRegistered = registered;
            if (registered > _maxRegistered) _maxRegistered = registered;
        });
        setMaxAge(_maxAge);
        setMinAge(_minAge);
        setMaxRegistered(_maxRegistered);
        setMinRegistered(_minRegistered);
    }, [userList]);

    return <SuspenseComponent dependency={userList || errorMessage}>
        <Cover className="user_list">
            <h2>Lista de usuarios</h2>
            <div className="filters">
                <Input<number, true> state={[minAge, setMinAge]} title="Edad mínima" />
                <Input<number, true> state={[maxAge, setMaxAge]} title="Edad máxima" />
                <Input<number, true> state={[minRegistered, setMinRegistered]} title="Fecha de registro mínima" />
                <Input<number, true> state={[maxRegistered, setMaxRegistered]} title="Fecha de registro máxima" />
                <Input<Role | 0, true> state={[roleFilter, setRoleFilter]} title="Rol" options={[
                    { name: "No filtrar", value: 0 },
                    { name: Roles.Names[100], value: 100, },
                    { name: Roles.Names[200], value: 200, },
                    { name: Roles.Names[300], value: 300, },
                    { name: Roles.Names[400], value: 400, },
                ]} />
                <Input state={[genderFilter, setGenderFilter]} title="Genero" options={[
                    { name: 'No filtrar', value: 'None' },
                    { name: 'Masculino', value: 'Masculino' },
                    { name: 'Femenino', value: 'Femenino' },
                ]} />
            </div>
            {
                userList
                    ?.filter(user => user.age <= maxAge)
                    .filter(user => user.age >= minAge)
                    .filter(user => new Date(user.registered_at).getTime() <= maxRegistered)
                    .filter(user => new Date(user.registered_at).getTime() >= minRegistered)
                    .filter(user => roleFilter == 0 ? true : user.role_id == roleFilter)
                    .filter(user => !genderFilter || genderFilter == 'None' ? true : user.gender === genderFilter)
                    .map(user => <UserComponent userInfo={user} />)
            }
        </Cover>
    </SuspenseComponent>
}

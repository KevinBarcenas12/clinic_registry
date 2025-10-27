import { useEffect, useState } from "react";
import Container from "../../components/Container";
import Cover from "../../components/Cover";
import { Role, type User } from "../../api/definitions";
import "./user-styles.scss";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import Link from "../../components/Link";
import Input from "../../components/Input";
import RangeSlider from "../../components/RangeSlider";
import { Roles } from "../../hooks/roles";
import { formatDate } from "../../hooks/formatDate";
import { Outlet, useLocation, useParams } from "react-router-dom";
import classNames from "classnames";

interface Range {
    min: number;
    max: number;
}

export default function UserList() {
    const { server } = useAuth();
    const [userList, setUserList] = useState<User[]>();
    const [userListError, setUserListError] = useState<string>();

    const { id } = useParams();

    // filters
    const [ageRange, setAgeRange] = useState<Range>();
    const [ageRangeLimits, setAgeRangeLimits] = useState<Range>();
    const [registeredRange, setRegisteredRange] = useState<Range>();
    const [registeredRangeLimits, setRegisteredRangeLimits] = useState<Range>();
    const [roleFilter, setRoleFilter] = useState<Role | 0>(0);
    const [genderFilter, setGenderFilter] = useState<"Masculino" | "Femenino" | "None">();

    const [isEditing, setEditing] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        setEditing(location.pathname.endsWith("/edit"));
    }, [location.pathname]);

    function updateInfo() {
        if (!server) return;

        server.getAllUsers()
        .then(({ success, details, error }) => {
            if (!success) {
                setUserList(undefined);
                setUserListError(error);
                return;
            }
            setUserList(details);
            setUserListError(undefined);
        });
    }

    useEffect(() => {
        if (!isEditing) updateInfo();
        // eslint-disable-next-line
    }, [isEditing]);

    useEffect(() => {
        updateInfo();
        // eslint-disable-next-line
    }, [server]);

    useEffect(() => {
        if (!userList) return;
        let minAge = 100;
        let maxAge = 0;
        let minRegistered = 10000000000000;
        let maxRegistered = 0;
        userList.forEach(user => {
            if ([20000, 20001].includes(user.id)) return;
            if (user.age < minAge) minAge = user.age;
            if (user.age > maxAge) maxAge = user.age;
            let registered = new Date(user.registered_at).getTime();
            if (registered < minRegistered) minRegistered = registered;
            if (registered > maxRegistered) maxRegistered = registered;
        });
        setAgeRangeLimits({ max: maxAge, min: minAge });
        setAgeRange({ max: maxAge, min: minAge });
        setRegisteredRangeLimits({ max: maxRegistered, min: minRegistered });
        setRegisteredRange({ max: maxRegistered, min: minRegistered });
    }, [userList]);

    return <div className="user-list">
        <Container className="main-container">
            <h1>Lista de Usuarios</h1>

            <Loader dependency={userList || userListError}>
                {userList && <div className="filters">
                    {registeredRangeLimits && registeredRange && <RangeSlider
                        className="registered-range"
                        range={{ ...registeredRangeLimits, step: 1000 * 60 * 60 * 24 * 30.5 }}
                        state={[registeredRange, setRegisteredRange]}
                        title={<><strong>Registrado:</strong> entre {new Date(registeredRange.min).toLocaleDateString("es-HN", { month: "long", year: "numeric" })} y {new Date(registeredRange.max).toLocaleDateString("es-HN", { month: "long", year: "numeric" })}</>}
                    />}
                    {ageRangeLimits && ageRange && <RangeSlider
                        className="age-range"
                        range={{ ...ageRangeLimits }}
                        state={[ageRange, setAgeRange]}
                        title={<><strong>Edad:</strong> {ageRange.min} a {ageRange.max} años</>}
                    />}
                    {roleFilter !== undefined && <Input<Role | 0, true> state={[roleFilter, setRoleFilter]} title="Rol" options={[
                        { name: "No filtrar", value: 0 },
                        { name: Roles.public_codes[100], value: 100, },
                        { name: Roles.public_codes[200], value: 200, },
                        { name: Roles.public_codes[300], value: 300, },
                        { name: Roles.public_codes[400], value: 400, },
                    ]} />}
                    <Input<"Masculino" | "Femenino" | "None"> state={[genderFilter, setGenderFilter]} title="Genero" options={[
                        { name: 'No filtrar', value: 'None' },
                        { name: 'Masculino', value: 'Masculino' },
                        { name: 'Femenino', value: 'Femenino' },
                    ]} />
                </div>}
                {userList && ageRange && registeredRange && <div className="user-list-container">
                    {userList
                    .filter(user => user.age <= ageRange.max)
                    .filter(user => user.age >= ageRange.min)
                    .filter(user => new Date(user.registered_at).getTime() <= registeredRange.max)
                    .filter(user => new Date(user.registered_at).getTime() >= registeredRange.min)
                    .filter(user => +roleFilter === 0 ? true : user.role_id === +roleFilter)
                    .filter(user => !genderFilter || genderFilter === 'None' ? true : user.gender === genderFilter)
                    .map(user => <Link to={`/users/${user.id}`} key={`user-link-${user.id}`} className={classNames({ active: id != null && +id === user.id })}>
                        <div className={classNames("user", { active: id != null && +id === user.id })}>
                            <span className="user-id"><strong>Id:</strong><br />#{user.id}</span>
                            <span className="user-name"><strong>Nombre:</strong><br />{user.name}</span>
                            <span className="user-gender"><strong>Género:</strong><br />{user.gender}</span>
                            <span className="user-role"><strong>Rol:</strong><br />{user.role}</span>
                            <span className="user-registered_at"><strong>Registrado:</strong><br />{formatDate(user.registered_at, "long")}</span>
                        </div>
                    </Link>)}
                </div>}
                {userListError && <Cover>{userListError}</Cover>}
            </Loader>

            <Outlet />
        </Container>
    </div>
}

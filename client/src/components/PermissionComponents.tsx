import { Fragment } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Permission as PermissionList } from "../api/definitions";
import { Navigate } from "react-router-dom";

interface Permissions {
    children?: React.ReactNode;
    permission?: PermissionList;
    permissions?: PermissionList[];
}

export function Protected({ children }: { children: React.ReactNode }) {
    const { validLogin } = useAuth();

    if (!validLogin) return <Navigate to="/login" />
    return <Fragment>{children}</Fragment>
}

export function Permission({ children, permission, permissions }: Permissions): React.JSX.Element {
    const { hasPermission } = useAuth();
    if (!permission && !permissions) {
        console.log("invalid permissions");
        return <></>;
    }
    if (!hasPermission(permission || permissions)) {
        console.log("not enough permissions");
        return <></>;
    }

    return <Fragment>
        {children}
    </Fragment>
}

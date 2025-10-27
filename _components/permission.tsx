import React, { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Permission } from "../api/definitions";

interface Props {
    permission: Permission | Permission[];
    children?: React.ReactNode;
    redirect?: string;
    fallback?: React.ReactNode;
}

export default function Permission({ permission, children, redirect, fallback }: Props) {
    const { hasPermission: checkPermission } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean>();

    useEffect(() => {
        if (!permission) return;
        setHasPermission(checkPermission(permission));
    }, [permission]);

    if (checkPermission === undefined) return null;
    return hasPermission 
        ? <Fragment>{children}</Fragment>
        : fallback
            ? <Fragment>{fallback}</Fragment>
            : redirect
                ? <Navigate to={redirect} /> 
                : null;
}

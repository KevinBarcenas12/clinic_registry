import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Fragment } from "react/jsx-runtime";
import { useModal } from "../client/src/hooks/modal";
import { useEffect, useState } from "react";
// import type { Permission } from "../../api/_definitions";

export default function Protected({ children }: { children?: React.ReactNode }) {
    const { validLogin } = useAuth();

    if (!validLogin) return <Navigate to="/login" />
    return <Fragment>{children}</Fragment>
}

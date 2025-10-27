import React, { Fragment, JSX } from "react";
import Loading from "./loading";

interface Props {
    children?: React.ReactNode;
    Fallback?: () => JSX.Element;
    dependency?: any;
}

export default function SuspenseComponent({ children, Fallback, dependency }: Props): JSX.Element {
    if (!dependency || !children) return Fallback ? <Fallback /> : <Loading />;

    return <Fragment>
        {children}
    </Fragment>
}

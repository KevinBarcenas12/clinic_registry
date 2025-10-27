import React, { Fragment, JSX } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import Cover from "./Cover";
import classNames from "classnames";

function Loading({ fullscreen }: { fullscreen?: boolean; }) {
    return <Cover className={classNames("loading", { fullscreen })}>
        <AiOutlineLoading className="icon" />
    </Cover>
}

interface Props {
    children?: React.ReactNode;
    Fallback?: () => JSX.Element;
    dependency?: any;
    fullscreen?: boolean;
    keep?: boolean;
}

export default function Loader({ children, Fallback, dependency, fullscreen, keep }: Props): JSX.Element {
    if (!dependency || !children) return Fallback ? <Fallback /> : <Loading fullscreen={fullscreen} />;
    if (fullscreen && keep) return <Cover fullscreen>
        {children}
    </Cover>
    return <Fragment>
        {children}
    </Fragment>
}

import classNames from "classnames";
import React from "react";

export default function Layout({ children, className, full }: { children?: React.ReactNode, className?: string, full?: boolean }) {
    return <div className={classNames("full-height layout", className, { "full-cover": full })} style={{ overflow: 'auto' }}>
        <div className={classNames("container")}>
            {children}
        </div>
    </div>
}

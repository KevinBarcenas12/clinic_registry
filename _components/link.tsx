import classNames from "classnames";
import { NavLink, useLocation } from "react-router-dom";

interface Props {
    to: string;
    children?: React.ReactNode;
    className?: string;
}

export default function Link({ to, children, className }: Props) {
    const location = useLocation();
    return <NavLink
        to={to}
        className={
            classNames(
                "custom",
                { current: location.pathname == to },
                className,
            )
        }
    >
        {children}
    </NavLink>
}

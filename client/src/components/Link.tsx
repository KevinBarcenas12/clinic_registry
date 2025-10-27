import classNames from "classnames";
import { NavLink } from "react-router-dom";

interface Props {
    to: string;
    className?: string;
    title?: string;
    children?: React.ReactNode;
    inline?: boolean;
    action?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export default function Link({ to, className, action, title, children, inline }: Props) {
    return <div onClick={action} className={classNames("link", className, { text: title != null, block: children != null, inline })}>
        <NavLink to={to} className="link-a">
            {title || children}
        </NavLink>
    </div>
}

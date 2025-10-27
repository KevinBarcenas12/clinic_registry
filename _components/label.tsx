import classNames from "classnames";
import { JSX } from "react";

interface Props {
    title: string;
    sub?: string;
    className?: string;
    l?: 1 | 2 | 3;
}

export default function Label({ title, sub, className, l }: Props): JSX.Element {
    if (!l) l = 1;
    return <span className={classNames("label", `l${l}`, className)}>
        {title}
        {sub && <span className={classNames("sublabel", `l${l+1}`)}>{sub}</span>}
    </span>
}

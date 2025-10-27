import classNames from "classnames";

interface Props {
    className?: string;
    children?: React.ReactNode;
    dependency?: any;
}

export default function Container({ className, children }: Props) {
    return <div className={classNames("container", className)}>
        <div className="container-content">
            {children}
        </div>
    </div>
}

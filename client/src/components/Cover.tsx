import classNames from "classnames";

interface Props {
    fullscreen?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export default function Cover({ fullscreen, children, className }: Props) {
    return <div className={classNames("cover container", { fullscreen }, className)}>
        <div className="container-content">
            {children}
        </div>
    </div>
}

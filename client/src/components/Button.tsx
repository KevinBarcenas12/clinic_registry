import classNames from "classnames";

interface Props {
    className?: string;
    action?: () => void;
    icon?: React.ReactNode;
    title?: React.ReactNode;
    type: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
    disabled?: boolean;
}

export default function Button({ title, type, action, className, icon, disabled }: Props) {
    return <button disabled={disabled} className={classNames("button", className, { 'icon-only': !title && icon })} onClick={action} type={type}>
        {title && <div className="button-title">{title}</div>}
        {icon}
    </button>
}

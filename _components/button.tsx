import classNames from "classnames";

interface Props {
    title: string | React.ReactNode;
    className?: string;
    action?: () => void;
    type: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

export default function Button({ title, className, action, type }: Props) {
    return <button 
        onClick={e => action?.()}
        className={classNames("custom_button", className)}
        type={type}
    >
        {title}
    </button>
}

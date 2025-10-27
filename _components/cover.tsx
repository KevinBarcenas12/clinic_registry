import classNames from "classnames";


export default function Cover({ children, className }: { children?: React.ReactNode, className?: string }) {
    return <div className={classNames("cover", className)}>
        <div className="cover_container">
            {children}
        </div>
    </div>
}

import { useEffect, useRef, useState } from "react";
import { IoIosArrowDropdown } from "react-icons/io";
import { State } from "../api/definitions";
import classNames from "classnames";

interface Props<T extends string | number, K extends boolean = false> {
    state: State<T, K>;
    type?: React.HTMLInputTypeAttribute;
    className?: string;
    title?: string;
    step?: string | number;
    min?: number;
    max?: number;
    required?: boolean;
    options?: {
        name: string;
        value: T
    }[];
}

function defaultProps<
    T extends string | number,
    K extends object | undefined = undefined,
    J extends boolean = false
>(
    extra?: K extends undefined ? undefined : K
): K extends undefined ? Props<T, J> : Props<T, J> & K
{
    const obj: Props<T, J> = { state: [0 as T, (v) => {}], type: "text" };
    return extra ? { ...obj, ...extra } as any : obj as any;
}

interface InputExtra<K extends boolean = false> {
    focus: State<boolean, K>;
    ref: React.Ref<HTMLInputElement | HTMLSelectElement>;
}

function InputElement<T extends string | number, K extends boolean = false>(
    {
        state: [value, setValue],
        focus: [, setFocus],
        type,
        ref,
        title,
        step,
        min,
        max,
        options,
        required,
    }: Props<T, K> & InputExtra
    = defaultProps<T, InputExtra, K>({ focus: [false, () => {}], ref: null })
) {
    let _props = {
        'data-title': title,
        value,
        onChange: (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => setValue(event.target.value as T),
        onFocus: (event: React.FocusEvent<HTMLSelectElement | HTMLInputElement, Element>) => setFocus(true),
        onBlur: (event: React.FocusEvent<HTMLSelectElement | HTMLInputElement, Element>) => setFocus(false),
        required,
    };
    if (options) return <select
        ref={ref as React.Ref<HTMLSelectElement>}
        {..._props}
    >
        {options.map(option => <option key={`option-${option.name}-${option.value}`} className="input_option" value={option.value}>{option.name}</option>)}
    </select>

    return <input
        {...{
            min,
            max,
            step,
        }}
        {..._props}
        ref={ref as React.Ref<HTMLInputElement>}
        type={type}
    />
}

export default function Input<T extends string | number, K extends boolean = false>({
    className,
    title,
    ...props
}: Props<T, K> = defaultProps<T, undefined, K>()) {
    const [focus, setFocus] = useState<boolean>();
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!ref.current || !focus) return;
        ref.current.focus();
    }, [focus]);

    return <div
        className={
            classNames(
                "input_container",
                className,
                {
                    empty: !props.state[0] && !focus,
                    title_inline: title != null && props.options != null
                },
            )
        }
        onClick={e => setFocus(true)}
        onFocus={e => setFocus(true)}
        onBlur={e => setFocus(false)}
    >
        {title && <span className="input_title_bg">{title}</span>}
        <div className="input_content">
            {props.options && <IoIosArrowDropdown className="icon" />}
            <InputElement<T, K> {...{title, ...props}} focus={[focus, setFocus]} ref={ref} />
        </div>
        {title && <span className="input_title">{title}</span>}
    </div>
}

import classNames from "classnames";
import { useEffect, useState } from "react";
import './RangeSlider.scss';
import { State } from "../api/definitions";

interface Props<T extends boolean = false> {
    className?: string;
    state: State<{ min: number; max: number; }, T>;
    range: {
        min: number;
        max: number;
        step?: number;
    };
    title?: React.ReactNode;
}

export default function RangeSlider<T extends boolean = false>({ range, className, title, state: [state, setState] }: Props<T>) {

    const width = range.max - range.min;
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(width);
    const [values, setValues] = useState<{ min: number; max: number; }>(state || { min: minValue, max: maxValue });

    // console.log(range, state);

    const minValuePercent = minValue / width * 100;
    const maxValuePercent = maxValue / width * 100;

    useEffect(() => {
        setValues({
            min: range.min + minValue,
            max: range.min + maxValue,
        });
    }, [minValue, maxValue, range.min]);

    useEffect(() => {
        setMinValue(0);
        setMaxValue(width);
    }, [width]);

    useEffect(() => {
        setState(values);
    }, [values, setState]);

    return <div className={classNames("double-slider", className)}>
        {title && <span className="title_bg">{title}</span>}
        <div className="slider-bg"></div>
        <div className="slider" style={{ position: 'relative' }}>
            <div className="slider-track"></div>
            <div
                style={{
                    width: `${maxValuePercent - minValuePercent}%`,
                    left: `${minValuePercent}%`,
                }}
                className="slider-range"
            ></div>
        </div>
        <input
            type="range"
            min={0}
            max={width}
            step={range.step}
            value={minValue}
            onChange={event => setMinValue(Math.min(+event.target.value, maxValue - 1))}
            className="min range"
        />
        <input
            type="range"
            min={0}
            max={width}
            step={range.step}
            value={maxValue}
            onChange={event => setMaxValue(Math.max(+event.target.value, minValue + 1))}
            className="max range"
        />
        {title && <span className="title-handle">{title}</span>}
    </div>
}

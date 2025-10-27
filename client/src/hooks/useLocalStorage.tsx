import { useState } from "react";

export default function useLocalStorage(keyname: string, defaultValue: string | number | undefined): [string, (newValue: string | undefined) => void] {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.localStorage.getItem(keyname);
            if (value) return JSON.parse(value);
            if (!defaultValue) return null;
            window.localStorage.setItem(keyname, JSON.stringify(defaultValue));
            return defaultValue;
        }
        catch (error) {
            console.error(error);
            return defaultValue;
        }
    });

    function setValue(newValue: string | undefined) {
        try {
            if (newValue == null) window.localStorage.removeItem(keyname);
            else window.localStorage.setItem(keyname, JSON.stringify(newValue));
            setStoredValue(newValue);
        }
        catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

import { createContext, useContext, useLayoutEffect, useState } from "react";

interface Context {
    width: number;
    height: number;
    ratio: number;
    isVertical: (threshold: number) => boolean;
}

const DimensionsContext = createContext<Context>({
    width: 0,
    height: 0,
    ratio: 16/9,
    isVertical: () => false,
});

export function DimensionsHookProvider({ children }: { children: React.ReactNode }) {
    const [dimensions, setDimensions] = useState<Context>({
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight,
        isVertical: () => false,
    });

    function updateDimensions() {
        setDimensions(prev => ({
            height: window.innerHeight,
            width: window.innerWidth,
            ratio: window.innerWidth / window.innerHeight,
            isVertical: (threshold = 18/16) => threshold > (window.innerWidth / window.innerHeight),
        }));
    }

    useLayoutEffect(() => {
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return <DimensionsContext.Provider value={dimensions}>
        {children}
    </DimensionsContext.Provider>
}

export function useDimensions() {
    return useContext(DimensionsContext);
}

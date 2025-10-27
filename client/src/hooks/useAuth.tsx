import useLocalStorage from "./useLocalStorage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { API, Permission, User, UserType } from "../api/definitions";
import Server from "../api";
// import { useModal } from "../../../_components/modal";
import { getToken, getUserData } from "../api/auth";
import { useModal } from "./modal";

interface UserContextProps {
    token?: string;
    user?: User;
    validLogin: boolean;
    type?: UserType;
    server?: API;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: () => void;
    hasPermission: (permission: Permission | Permission[] | undefined) => boolean;
};

function validatePermission(permission: Permission | Permission[], userPermissions: Permission[]): boolean {
    if (typeof permission === 'string') return userPermissions.includes(permission);
    for (let perm in permission)
        for (let _perm in userPermissions)
            if (perm === _perm) return true;
    return false;
}

const UserContext = createContext<UserContextProps>({
    login: async () => ({ success: false }),
    logout: () => {},
    updateUser: () => {},
    validLogin: false,
    hasPermission: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useLocalStorage("userToken", undefined);
    const [user, setUser] = useState<User | undefined>();
    const [type, setType] = useState<UserType | undefined>();
    const [server, setServer] = useState<API>();

    // useEffect(() => {
    //     let timer = setInterval(checkValidSession, 30000);
    //     return () => { if (timer) clearInterval(timer); };
    //     // eslint-disable-next-line
    // }, []);

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const { addMessage } = useModal();

    useEffect(() => {
        if (user != null) return;
        updateUser();
        // eslint-disable-next-line
    }, [user]);
    useEffect(() => {
        if (!token) return;
        setServer(Server(token));
    }, [token]);

    function hasPermission(permission: Permission | Permission[] | undefined): boolean {
        if (!permission) return false;
        return validatePermission(permission, permissions);
    }

    async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
        let _token: string | undefined = token;
        let response1 = await getToken(username, password);
        if (!response1.success || !response1.token) {
            setToken(undefined);
            setType(undefined);
            addMessage(response1.error);
            return { success: false, error: response1.error };
        }

        _token = response1.token;
        setToken(_token);

        const server = Server(_token);
        setServer(server);

        let response2 = await server.getCurrentUser();
        if (!response2.success || !response2.details) {
            setUser(undefined);
            setType(undefined);
            setPermissions([]);
            addMessage(response2.error);
            return { success: false, error: response2.error };
        }

        let currentUser: User = response2.details!.user_data!;

        setUser(currentUser);
        setType(response2.details.user_type);
        setPermissions(response2.details.permissions || []);
        return { success: true };
    };

    function logout() {
        setToken(undefined);
        setUser(undefined);
        setType(undefined);
        setServer(undefined);
        setPermissions([]);
        addMessage("Logged out.");
    };

    // eslint-disable-next-line
    async function checkValidSession() {
        if (!token && !server) {
            return;
        }
        if (!token) {
            logout();
            return;
        }
        if (!(await getUserData(token)).success) {
            logout();
            return;
        }
    }

    async function updateUser() {
        if (!token) {
            logout();
            return;
        }

        let response = await getUserData(token);
        if (!response.success || !response.user) {
            logout();
            return;
        }

        setUser(response.user);
        setType(response.type);
        setPermissions(response.permissions || []);
    };

    const currentContext = useMemo<UserContextProps>(() => ({
        validLogin: token != null,
        token,
        user,
        type,
        server,
        login,
        logout,
        updateUser,
        hasPermission,
        // eslint-disable-next-line
    }), [token, user]);

    return <UserContext.Provider value={currentContext}>{children}</UserContext.Provider>;
}

export function useAuth() {
    return useContext(UserContext);
}

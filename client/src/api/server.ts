import axios, { AxiosResponse } from "axios";
import {
    Clinic,
    MedicalPlan,
    type API,
    type Appointment,
    type Chat,
    type InfoProps,
    type MedicInfo,
    type PatientInfo,
    type Prediction,
    type ServerResponse,
    type User,
} from "./definitions";

const BaseURL = 'http://localhost:8000';
const conn = axios.create({
    baseURL: BaseURL,
});

const DefaultError = "Error with the request.";
const Error = <T>(error: any): ServerResponse<T> => {
    let obj: ServerResponse<T> = {
        success: false,
        error: error?.response?.data?.detail || error?.message || error?.details || DefaultError,
    };
    console.log(obj.error);
    return obj;
};
const Headers = (token: string) => ({ headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
const HandleResponse = <T>(response: AxiosResponse<any, any>): ServerResponse<T> => response.data?.success ? response.data : Error<T>(response.data);

export const _server = {
    get: async function<T = string>(url: string): Promise<ServerResponse<T>> {
        return await conn.get(url)
            .then(response => HandleResponse<T>(response))
            .catch(e => Error<T>(e));
    },
    post: async function<T = string, K extends object = {}>(url: string, body?: K): Promise<ServerResponse<T>> {
        return await conn.post(url, body)
            .then(response => HandleResponse<T>(response))
            .catch(e => Error<T>(e));
    },
    patch: async function<T = string>(url: string, body: T): Promise<ServerResponse<string>> {
        return await conn.patch(url, body)
            .then(response => HandleResponse<string>(response))
            .catch(e => Error<string>(e));
    },
    put: async function<T = string>(url: string, body?: T): Promise<ServerResponse<string>> {
        return await conn.put(url, body)
            .then(response => HandleResponse<string>(response))
            .catch(e => Error<string>(e));
    },
    delete: async function(url: string): Promise<ServerResponse<string>> {
        return await conn.delete(url)
            .then(response => HandleResponse<string>(response))
            .catch(e => Error<string>(e));
    },
    _get: conn.get,
    _post: conn.post,
    _patch: conn.patch,
    _put: conn.put,
    _delete: conn.delete,
    handler: conn,
}

// User API instance creator
export default function Server(token: string): API {
    // Current authenticated connection
    let connection = axios.create({
        baseURL: BaseURL,
        headers: Headers(token).headers,
    });

    // Main server request object
    const server = {
        get: async function<T = string>(url: string): Promise<ServerResponse<T>> {
            return await connection.get(url)
                .then(response => HandleResponse<T>(response))
                .catch(e => Error<T>(e));
        },
        post: async function<T = string, K extends object = {}>(url: string, body?: K): Promise<ServerResponse<T>> {
            return await connection.post(url, body)
                .then(response => HandleResponse<T>(response))
                .catch(e => Error<T>(e));
        },
        patch: async function<T = string>(url: string, body: T): Promise<ServerResponse<string>> {
            return await connection.patch(url, body)
                .then(response => HandleResponse<string>(response))
                .catch(e => Error<string>(e));
        },
        put: async function<T = string>(url: string, body?: T): Promise<ServerResponse<string>> {
            return await connection.put(url, body)
                .then(response => HandleResponse<string>(response))
                .catch(e => Error<string>(e));
        },
        delete: async function(url: string): Promise<ServerResponse<string>> {
            return await connection.delete(url)
                .then(response => HandleResponse<string>(response))
                .catch(e => Error<string>(e));
        },
        _get: connection.get,
        _post: connection.post,
        _patch: connection.patch,
        _put: connection.put,
        _delete: connection.delete,
        handler: connection,
    };

    // Main API object for all main requests
    const api: API = {
        getUser:                async (userId)              => server.get<InfoProps>            (`/users/${userId}`),
        getCurrentUser:         async ()                    => server.get<InfoProps>            (`/users/`),
        getAllUsers:            async ()                    => await server.get<User[]>         (`/users/list`),
        getAllActiveUsers:      async ()                    => await server.get<User[]>         (`/users/list/active`),
        getTopUsers:            async (top)                 => await server.get<User[]>         (`/users/list/top/${top}`),
        getTopActiveUsers:      async (top)                 => await server.get<User[]>         (`/users/list/top/${top}/active`),
        updateUser:             async (userId, userData)    => await server.patch               (`/users/${userId}/update`, userData),
        deleteUser:             async (userId)              => await server.delete              (`/users/${userId}/delete`),
        getMedicInfo:           async (userId)              => await server.get<MedicInfo>      (`/medic/${userId}`),
        updateMedic:        async (userId, medicInfo)       => await server.patch               (`/medic/${userId}/update`, medicInfo),
        getActiveMedics:        async ()                    => await server.get                 (`/medics`),
        getPatientInfo:         async (userId)              => await server.get<PatientInfo>    (`/patient/${userId}`),
        updatePatient:      async (userId, medicInfo)       => await server.patch               (`/patient/${userId}/update`, medicInfo),
        getHistory:             async (userId)              => await server.get<History>        (`/history/${userId}`) as any,
        updateHistory:          async (userId, historyData) => await server.patch               (`/medic/${userId}/update`, historyData),
        getChat:                async (chatId)              => await server.get<Chat>           (`/chats/${chatId}`),
        getAllChats:            async ()                    => await server.get<Chat[]>         (`/chats/list`),
        getAllActiveChats:      async ()                    => await server.get<Chat[]>         (`/chats/active`),
        getTopChats:            async (top)                 => await server.get<Chat[]>         (`/chats/list/top/${top}`),
        getAllUserChats:        async (userId)              => await server.get<Chat[]>         (`/chats/user/${userId}`),
        getTopUserChats:        async (userId, top)         => await server.get<Chat[]>         (`/chats/user/${userId}/top/${top}`),
        getAllAppointments:     async ()                    => await server.get<Appointment[]>  (`/appointments/list`),
        getTopAppointments:     async (top)                 => await server.get<Appointment[]>  (`/appointments/list/top/${top}`),
        getUserAppointments:    async (userId)              => await server.get<Appointment[]>  (`/appointments/user/${userId}`),
        getTopUserAppointments: async (userId, top)         => await server.get<Appointment[]>  (`/appointments/user/${userId}/top/${top}`),
        getAppointment:         async (appointmentId)       => await server.get<Appointment>    (`/appointments/${appointmentId}`),
        addAppointment:         async (appointmentData)     => await server.put                 (`/appointments/new`, appointmentData),
        requestAppointment:     async ()                    => await server.post<number>        (`/appointments/request`),
        getPrediction:          async (userId)              => await server.get<Prediction>     (`/predict/${userId}`),
        getClinics:             async ()                    => await server.get<Clinic[]>       (`/clinics`),
        getMedicalPlans:        async ()                    => await server.get<MedicalPlan[]>  (`/medical_plans`),
        connection: server,
    }

    return api;
}

export enum MessageTypes {
    CLIENT_CONNECT = "client_connect",
    CLIENT_DISCONNECT = "client_disconnect",
    CHAT_START = "chat_start",
    CHAT_MESSAGE = "chat_message",
    LOG_MESSAGE = "log_message",
    UNKNOWN_MESSAGE = "unknown_message",
    CLIENT_INFORMATION = "client_information",
    APPOINTMENT_CREATED = "appointment_created",
    CHAT_MESSAGE_WITH_LINKS = "chat_message_with_links",
}

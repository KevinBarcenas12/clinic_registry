import { AxiosInstance } from "axios";
import React from "react";

type targets<extra extends string | void = void> = extra extends void ? "self" | "others" : "self" | "others" | extra;

type user_permissions = `users:${"view" | "edit" | "delete"}:${targets}` | "users:create";
type medical_plan_permissions = `medical_plan:${"edit" | "delete" | "create"}` | `medical_plan:view:${targets}`;
type appointments_permissions = `appointments:${"view" | "edit" | "delete"}:${targets<"all">}` | `appointments:create:${targets}`;
type history_permissions = `history:${"edit" | "delete" | "create"}` | `history:view:${targets}`;
type chats_permissions = `chats:view:${targets}`;
type clinic_permissions = `clinics:${"view" | "edit" | "delete" | "create"}`;
export type Permission = user_permissions | medical_plan_permissions | appointments_permissions | history_permissions | chats_permissions | clinic_permissions | "predictive_diagnosis:use";
export type UserType = "medic" | "user" | "patient";
export type Role = 100 | 200 | 300 | 400;

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    birth_date: number;
    gender: "Masculino" | "Femenino";
    age: number;
    location: string;
    registered_at: number;
    role: "Médico" | "Recepcionista" | "Paciente" | "Administrador";
    role_id: 100 | 200 | 300 | 400;
    permissions?: Permission[];
    user_type?: UserType;
};
export interface MedicalPlan {
    id: number;
    type: string;
    benefit_level: number;
    price_month: number;
    // expires: string;
    duration: number;
};
export interface PatientInfo {
    id: number;
    plan_benefit_level: number;
    plan_expiration: number;
    plan_id: number;
    plan_price_month: number;
    plan_type: string;
    active: boolean;
};
export interface MedicInfo {
    id: number;
    medic_name: string;
    clinic_id: number;
    clinic_name: string;
    speciality: string;
    active: boolean;
};
export interface FullUser extends User, Partial<MedicInfo>, Partial<PatientInfo> {}
export interface Medic extends User, MedicInfo {};
export interface Patient extends User, PatientInfo {};
export interface Appointment {
    id: number;
    history_id: number;
    medic_id: number;
    medic_name: string;
    user_id: number;
    user_name: string;
    date: number;
    diagnose: string;
    treatment: string;
    clinic_id: number;
    clinic_name: string;
};
export interface History {
    medic_id: number;
    medic_name: string;
    notes: string;
    created_at: number;
    last_modified_at: number;
    appointments?: Appointment[];
};
export interface Clinic {
    id: number;
    name: string;
    location: string;
    phone: string;
};
export interface Message {
    id: number;
    chat_id: number;
    message: string;
    sender_id: number;
    sender_name: string;
    sent_at: number;
    links?: string[];
};
export interface Chat {
    id: number;
    medic_id: number;
    medic_name: string;
    user_id: number;
    user_name: string;
    created_at: string;
    active: boolean;
    messages?: Message[];
};
export interface Prediction {
    diagnose: string;
    probability: number;
    date: number;
}

interface InfoProps {
    user_data?: User;
    user_type?: UserType;
    permissions?: Permission[];
};

export interface ServerResponse<T> {
    success: boolean;
    details?: T;
    error?: string;
};

export type State<T, K extends boolean = false> = [
    K extends false ? T | undefined : T,
    React.Dispatch<React.SetStateAction<K extends false ? T | undefined : T>>,
];

export type StateObj<T, K extends boolean = false> = {
    value: K extends false ? T | undefined : T,
    set: React.Dispatch<React.SetStateAction<K extends false ? T | undefined : T>>,
};

export type Response<T> = Promise<ServerResponse<T>>;
export interface API {
    getUser:                (userId: number)                                    => Response<InfoProps>;
    getCurrentUser:         ()                                                  => Response<InfoProps>;
    getAllUsers:            ()                                                  => Response<User[]>;
    getAllActiveUsers:      ()                                                  => Response<User[]>;
    getTopUsers:            (top: number)                                       => Response<User[]>;
    getTopActiveUsers:      (top: number)                                       => Response<User[]>;
    updateUser:             (userId: number, userData: Partial<User>)           => Response<string>;
    deleteUser:             (userId: number)                                    => Response<string>;
    getMedicInfo:           (userId: number)                                    => Response<MedicInfo>;
    getActiveMedics:        ()                                                  => Response<Medic[]>;
    updateMedic:        (userId: number, medicInfo: Partial<MedicInfo>)     => Response<string>;
    getPatientInfo:         (userId: number)                                    => Response<PatientInfo>;
    updatePatient:      (userId: number, patientInfo: Partial<PatientInfo>) => Response<string>;
    getHistory:             (userId: number)                                    => Response<History>;
    updateHistory:          (userId: number, historyData: Partial<History>)     => Response<string>;
    getChat:                (chatId: number)                                    => Response<Chat>;
    getAllChats:            ()                                                  => Response<Chat[]>;
    getAllActiveChats:      ()                                                  => Response<Chat[]>;
    getTopChats:            (top: number)                                       => Response<Chat[]>;
    getAllUserChats:        (userId: number)                                    => Response<Chat[]>;
    getTopUserChats:        (userId: number, top: number)                       => Response<Chat[]>;
    getAllAppointments:     ()                                                  => Response<Appointment[]>;
    getTopAppointments:     (top: number)                                       => Response<Appointment[]>;
    getUserAppointments:    (userId: number)                                    => Response<Appointment[]>;
    getTopUserAppointments: (userId: number, top: number)                       => Response<Appointment[]>;
    getAppointment:         (appointmentId: number)                             => Response<Appointment>;
    addAppointment:         (appointmentData: Partial<Appointment>)             => Response<string>;
    requestAppointment:     ()                                                  => Response<number>;
    getPrediction:          (userId: number)                                    => Response<Prediction>;
    getClinics:             ()                                                  => Response<Clinic[]>;
    getMedicalPlans:        ()                                                  => Response<MedicalPlan[]>;
    connection: {
        get: <T = string>(url: string) => Response<T>;
        post: <T = string, K extends object = {}>(url: string, body?: K) => Response<T>;
        patch: <T = string>(url: string, body?: T) => Response<string>;
        put: <T = string>(url: string, body?: T) => Response<string>;
        delete: (url: string) => Response<string>;
        _get: Axios["get"];
        _post: Axios["post"];
        _patch: Axios["patch"];
        _put: Axios["put"];
        _delete: Axios["delete"];
        handler: AxiosInstance;
    }
}

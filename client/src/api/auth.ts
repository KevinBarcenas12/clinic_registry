import { _server as server } from "./server";
import { Permission, User, UserType } from "./definitions";

export async function getToken(username: string, password: string): Promise<{success: boolean; token?: string; error?: string }> {
    let request: { success: boolean, token?: string, error?: string } = await server
        ._post(
            '/token',
            `grant_type=password&username=${username}&password=${password}&scope=&client_id=&client_secret=`,
            { headers: { Accept: 'application/json', "Content-Type": 'application/x-www-form-urlencoded' } },
        )
        .then(response => ({ success: true, token: response.data.access_token }))
        .catch(error => ({ success: false, error: error?.response?.data?.detail }));
    return request;
}

export async function getUserData(token: string): Promise<{ success: boolean, user?: User, type?: UserType; permissions?: Permission[], error?: string }> {
    if (!token) return { success: false };
    let request: { success: boolean; details?: { user_data: User, user_type: UserType; permissions: Permission[] }, error?: string } = await server
        ._get('/users/', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
        .then(response => ({ success: true, details: response.data?.details as { user_data: User, user_type: UserType; permissions: Permission[] } }))
        .catch(error =>  ({ success: false, error: error?.response?.detail || error }));
    return {
        success: request?.success,
        user: request?.details?.user_data,
        type: request?.details?.user_type,
        permissions: request?.details?.permissions,
        error: request?.error,
    };
}

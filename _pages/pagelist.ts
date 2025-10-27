const PageList = {
    user: {
        id: "/user/:id:",
        list: "/user/list",
        root: "user",
        edit: "/user/:id:/edit",
    },
    chats: {
        list: "/chat/list",
        id: "/chat/:id:",
        root: "chat",
    },
    login: "/login",
    dashboard: "/dashboard",
    appointments: {
        root: "appointments",
        list: "/appointments/list",
        id: "/appointments/:id:"
    }
};

export default PageList;

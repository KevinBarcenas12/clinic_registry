class Links:
    class User:
        current = "/"
        add = "/new"
        list = "/list"
        id = "/{user_id}"
        update = "/{user_id}/update"
        delete = "/{user_id}/delete"
    class Patient:
        id = "/{user_id}"
        update = "/{user_id}/update"
    class Medic:
        id = "/{user_id}"
        update = "/{user_id}/update"
    class History:
        current = "/"
        id = "/{user_id}"
    class Chats:
        list = "/list"
        top = "/list/top/{top}"
        user_list = "/user/{user_id}"
        user_top = "/user/{user_id}/top/{top}"
        id = "/{chat_id}"
    class Appointments:
        list = "/list"
        top = "/list/top/{top}"
        user_list = "/user/{user_id}"
        user_top = "/user/{user_id}/top/{top}"
        add = "/new"
        id = "/{appointment_id}"

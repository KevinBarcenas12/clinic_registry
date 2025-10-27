// Modules
import { Fragment } from "react/jsx-runtime";
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from "react-router-dom";
// Pages
import Dashboard from "./pages/dashboard";
import UserFromId from "./pages/user/UserFromId";
import UserList from "./pages/user/UserList";
import Login from "./pages/login";
import Home from "./pages/home";
// Components
import { Permission, Protected } from "./components/PermissionComponents";
import Navigation from "./components/Navigation";
import { Modal } from "./hooks/modal";
import UserEdit from "./pages/user/UserEdit";
import AppointmentList from "./pages/appointment/AppointmentList";
import Chat from "./components/Chat";
import AppointmentFromId from "./pages/appointment/AppointmentFromId";

function App() {
    // const location = useLocation();
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path='/' element={<Fragment>
                <Navigation />
                <Outlet />
                <Chat />
                <Modal />
            </Fragment>}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="dashboard" element={<Protected><Dashboard /></Protected>}>
                    <Route path="appointments/list" element={<>appointments/list</>} />
                    <Route path="appointments/:id" element={<AppointmentFromId />} />
                    <Route path="chats/list" element={<>chat/list</>} />
                    <Route path="chats/:id" element={<>chat/:id</>} />
                </Route>
                <Route
                    path="users"
                    element={<Protected>
                        <Permission permission="users:view:others">
                            <UserList />
                        </Permission>
                    </Protected>}
                >
                    <Route path=":id" element={<UserFromId />}>
                        <Route path="edit" element={<Permission permission="users:edit:others"><UserEdit /></Permission>} />
                    </Route>
                    <Route path="new" element={<Permission permission="users:create">UserEdit</Permission>} />
                </Route>
                <Route
                    path="appointments"
                    element={<Protected>
                        <Permission permissions={["appointments:view:all", "appointments:view:self"]}>
                            <AppointmentList />
                        </Permission>
                    </Protected>}
                >
                    <Route path=":id" element={<AppointmentFromId />}>
                        
                    </Route>
                </Route>
            </Route>
        )
    )

    return <RouterProvider router={router} />
}

export default App;

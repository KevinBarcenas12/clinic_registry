// Modules
import { Fragment } from "react";
import classNames from "classnames";
// Components
import Label from "../../_components/label";
import SuspenseComponent from "../../_components/suspense";

import AppointmentLabel from "./appointment";
import ChatLabel from "./chat";
import { useParams } from "react-router-dom";
import Layout from "../../_components/layout";
import UserInfo from "../user/info";

export default function Dashboard() {

    return <Layout className="dashboard">
        <UserInfo />
    </Layout>
}

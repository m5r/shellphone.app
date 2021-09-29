import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import SettingsLayout from "../../components/settings-layout";

const Notifications: BlitzPage = () => {
	return <div>Coming soon</div>;
};

Notifications.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

Notifications.authenticate = { redirectTo: Routes.SignIn() };

export default Notifications;

import type { BlitzPage } from "blitz";

import SettingsLayout from "../../components/settings-layout";

const Notifications: BlitzPage = () => {
	return <div>Coming soon</div>;
};

Notifications.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Notifications;

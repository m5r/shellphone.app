import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import SettingsLayout from "../../components/settings-layout";

const PhoneSettings: BlitzPage = () => {
	return <div>Coming soon</div>;
};

PhoneSettings.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

PhoneSettings.authenticate = { redirectTo: Routes.SignIn() };

export default PhoneSettings;

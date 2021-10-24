import type { BlitzPage } from "blitz";

import SettingsLayout from "../../components/settings-layout";
import ProfileInformations from "../../components/account/profile-informations";
import UpdatePassword from "../../components/account/update-password";
import DangerZone from "../../components/account/danger-zone";

const Account: BlitzPage = () => {
	return (
		<div className="flex flex-col space-y-6">
			<ProfileInformations />

			<UpdatePassword />

			<DangerZone />
		</div>
	);
};

Account.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export default Account;

import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import SettingsLayout from "../../components/settings-layout";
import ProfileInformations from "../../components/account/profile-informations";
import UpdatePassword from "../../components/account/update-password";
import DangerZone from "../../components/account/danger-zone";
import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";

const Account: BlitzPage = () => {
	useRequireOnboarding();

	return (
		<div className="flex flex-col space-y-6">
			<ProfileInformations />

			<UpdatePassword />

			<DangerZone />
		</div>
	);
};

Account.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

Account.authenticate = { redirectTo: Routes.SignIn() };

export default Account;

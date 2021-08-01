import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import SettingsLayout from "../../components/settings-layout";
import ProfileInformations from "../../components/profile-informations";
import Divider from "../../components/divider";
import UpdatePassword from "../../components/update-password";
import DangerZone from "../../components/danger-zone";
import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";

const Account: BlitzPage = () => {
	useRequireOnboarding();

	return (
		<SettingsLayout>
			<div className="flex flex-col space-y-6 p-6">
				<ProfileInformations />

				<div className="hidden lg:block">
					<Divider />
				</div>

				<UpdatePassword />

				<div className="hidden lg:block">
					<Divider />
				</div>

				<DangerZone />
			</div>
		</SettingsLayout>
	);
};

Account.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

Account.authenticate = { redirectTo: Routes.SignIn() };

export default Account;

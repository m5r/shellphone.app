import type { NextPage } from "next";

import useUser from "../../hooks/use-user";

import SettingsLayout from "../../components/settings/settings-layout";
import Alert from "../../components/alert";
import ProfileInformations from "../../components/settings/profile-informations";
import Divider from "../../components/divider";
import UpdatePassword from "../../components/settings/update-password";
import DangerZone from "../../components/settings/danger-zone";
import { withPageOnboardingRequired } from "../../../lib/session-helpers";

const Account: NextPage = () => {
	const user = useUser();

	if (user.isLoading) {
		return <SettingsLayout>Loading...</SettingsLayout>;
	}

	if (user.error !== null) {
		return (
			<SettingsLayout>
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<Alert
						title="Oops, there was an issue"
						message={user.error.message}
						variant="error"
					/>
				</div>
			</SettingsLayout>
		);
	}

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

export const getServerSideProps = withPageOnboardingRequired();

export default Account;

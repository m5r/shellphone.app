import accountAction from "~/features/settings/actions/account";
import ProfileInformations from "~/features/settings/components/account/profile-informations";
import UpdatePassword from "~/features/settings/components/account/update-password";
import DangerZone from "~/features/settings/components/account/danger-zone";

export const action = accountAction;

export default function Account() {
	return (
		<div className="flex flex-col space-y-6">
			<ProfileInformations />

			<UpdatePassword />

			<DangerZone />
		</div>
	);
}

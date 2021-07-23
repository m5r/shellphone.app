import type { FunctionComponent } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAtom } from "jotai";

import { conversationsAtom, customerAtom, customerPhoneNumberAtom, messagesAtom, phoneCallsAtom } from "../state";
import supabase from "../supabase/client";
import type { Customer } from "../database/customer";
import { PhoneNumber } from "../database/phone-number";
import { Message } from "../database/message";
import { PhoneCall } from "../database/phone-call";

type Props = {}

const ConnectedLayout: FunctionComponent<Props> = ({
	children,
}) => {
	useRequireOnboarding();
	const { isInitialized } = useInitializeState();

	if (!isInitialized) {
		return (
			<>Loading...</>
		);
	}

	return (
		<>
			{children}
		</>
	);
};

export default ConnectedLayout;

function useRequireOnboarding() {
	const router = useRouter();
	const [customer] = useAtom(customerAtom);

	useEffect(() => {
		(async () => {
			if (!customer) {
				// still loading
				return;
			}

			if (!customer.accountSid || !customer.authToken) {
				return router.push("/welcome/step-two");
			}

			const phoneNumberResponse = await supabase
				.from<PhoneNumber>("phone-number")
				.select("*")
				.eq("customerId", customer.id)
				.single();
			if (phoneNumberResponse.error) {
				return router.push("/welcome/step-three");
			}
		})();
	}, [customer, router]);
}

function useInitializeState() {
	useInitializeCustomer();
	useInitializeMessages();
	useInitializePhoneCalls();

	const customer = useAtom(customerAtom)[0];
	const messages = useAtom(messagesAtom)[0];
	const phoneCalls = useAtom(phoneCallsAtom)[0];

	return {
		isInitialized: customer !== null && messages !== null && phoneCalls !== null,
	};
}

function useInitializeCustomer() {
	const router = useRouter();
	const setCustomer = useAtom(customerAtom)[1];
	const setCustomerPhoneNumber = useAtom(customerPhoneNumberAtom)[1];

	useEffect(() => {
		(async () => {
			const redirectTo = `/auth/sign-in?redirectTo=${router.pathname}`;
			// TODO: also redirect when no cookie
			try {
				await supabase.auth.refreshSession();
			} catch (error) {
				console.error("session error", error);
				return router.push(redirectTo);
			}
			const user = supabase.auth.user();
			if (!user) {
				return router.push(redirectTo);
			}

			const customerId = user.id;
			const customerResponse = await supabase
				.from<Customer>("customer")
				.select("*")
				.eq("id", customerId)
				.single();
			if (customerResponse.error) throw customerResponse.error;

			const customer = customerResponse.data;
			setCustomer(customer);

			const customerPhoneNumberResponse = await supabase
				.from<PhoneNumber>("phone-number")
				.select("*")
				.eq("customerId", customerId)
				.single();
			if (customerPhoneNumberResponse.error) throw customerPhoneNumberResponse.error;
			setCustomerPhoneNumber(customerPhoneNumberResponse.data);
		})();
	}, []);
}

function useInitializeMessages() {
	const customer = useAtom(customerAtom)[0];
	const setMessages = useAtom(messagesAtom)[1];

	useEffect(() => {
		(async () => {
			if (!customer) {
				return;
			}

			const messagesResponse = await supabase
				.from<Message>("message")
				.select("*")
				.eq("customerId", customer.id);
			if (messagesResponse.error) throw messagesResponse.error;
			setMessages(messagesResponse.data);
		})();
	}, [customer, setMessages]);
}


function useInitializePhoneCalls() {
	const customer = useAtom(customerAtom)[0];
	const setPhoneCalls = useAtom(phoneCallsAtom)[1];

	useEffect(() => {
		(async () => {
			if (!customer) {
				return;
			}

			const phoneCallsResponse = await supabase
				.from<PhoneCall>("phone-call")
				.select("*")
				.eq("customerId", customer.id);
			if (phoneCallsResponse.error) throw phoneCallsResponse.error;
			setPhoneCalls(phoneCallsResponse.data);
		})();
	}, [customer, setPhoneCalls]);
}

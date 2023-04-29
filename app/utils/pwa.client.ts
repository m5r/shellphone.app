type ResponseObject = {
	status: "success" | "bad";
	message: string;
};

// use case: prevent making phone calls / queue messages when offline -- TODO
export async function checkConnectivity(online: () => void, offline: () => void): Promise<ResponseObject> {
	try {
		if (navigator.onLine) {
			online();
			return {
				status: "success",
				message: "Connected to the internet",
			};
		} else {
			offline();
			return {
				status: "bad",
				message: "No internet connection available",
			};
		}
	} catch (err) {
		console.debug(err);
		throw new Error("Unable to check network connectivity!");
	}
}

// use case: display unread messages + missed phone calls count
export async function addBadge(numberCount: number): Promise<ResponseObject> {
	try {
		//@ts-ignore
		if (navigator.setAppBadge) {
			//@ts-ignore
			await navigator.setAppBadge(numberCount);
			return {
				status: "success",
				message: "Badge successfully added",
			};
		} else {
			return {
				status: "bad",
				message: "Badging API not supported",
			};
		}
	} catch (err) {
		console.debug(err);
		throw new Error("Error adding badge!");
	}
}
export async function removeBadge(): Promise<ResponseObject> {
	try {
		//@ts-ignore
		if (navigator.clearAppBadge) {
			//@ts-ignore
			await navigator.clearAppBadge();
			return {
				status: "success",
				message: "Cleared badges",
			};
		} else {
			return {
				status: "bad",
				message: "Badging API not supported in this browser!",
			};
		}
	} catch (error) {
		console.debug(error);
		throw new Error("Error removing badge!");
	}
}

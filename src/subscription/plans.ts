export type PlanId = string;

export type PaidPlan = {
	id: PlanId;
	name: string;
	description: string;
	price: number;
	features: readonly string[];
};

export type FreePlan = Omit<PaidPlan, "id" | "billingCycle" | "price"> & {
	id: "free";
	billingCycle: null;
	price: "free";
};

export type Plan = FreePlan | PaidPlan;

export const FREE: FreePlan = {
	id: "free",
	billingCycle: null,
	name: "Free",
	description: "Try out our software",
	price: "free",
	features: [
		"Potenti felis, in cras at at ligula nunc.",
		"Orci neque eget pellentesque.",
	],
};

export const MONTHLY: PaidPlan = {
	id: "647654",
	name: "Monthly",
	description: "All the basics for starting a new business",
	price: 21,
	features: [
		"Potenti felis, in cras at at ligula nunc.",
		"Orci neque eget pellentesque.",
		"Donec mauris sit in eu tincidunt etiam.",
	],
};

export const ANNUALLY: PaidPlan = {
	id: "647656",
	name: "Annually",
	description: "All the basics for starting a new business",
	price: 19,
	features: [
		"Potenti felis, in cras at at ligula nunc.",
		"Orci neque eget pellentesque.",
		"Donec mauris sit in eu tincidunt etiam.",
	],
};

export const PLANS = {
	[FREE.id]: FREE,
	[MONTHLY.id]: MONTHLY,
	[ANNUALLY.id]: ANNUALLY,
};

export type PlanName = Lowercase<Plan["name"]>;

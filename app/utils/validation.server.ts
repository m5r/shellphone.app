import type { z } from "zod";

type ErrorMessage = string;
type Errors<Schema> = Partial<Record<keyof Schema, ErrorMessage>>;
export type FormError<Schema extends z.Schema<unknown>> = Partial<
	Record<keyof Schema["_type"] | "general", ErrorMessage>
>;
type ValidationResult<Data, Schema> = { data: Data; errors: undefined } | { data: undefined; errors: Errors<Schema> };

export function validate<Data, Schema = z.Schema<Data>["_type"]>(
	schema: z.Schema<Data>,
	value: unknown,
): ValidationResult<Data, Schema> {
	const result = schema.safeParse(value);
	if (result.success) {
		return {
			data: result.data,
			errors: undefined,
		};
	}

	const errors: Errors<Schema> = {};
	result.error.issues.forEach((error) => {
		const path = error.path[0] as keyof Schema;
		if (!errors[path]) {
			errors[path] = error.message;
		}
	});

	return {
		data: undefined,
		errors,
	};
}

type FormFailureData<Validations extends Record<string, z.Schema>, Action extends keyof Validations> = {
	errors: FormError<Validations[Action]>;
	submitted?: never;
};
type FormSuccessData = {
	errors?: never;
	submitted: true;
};
export type FormActionData<Validations extends Record<string, z.Schema>, Action extends keyof Validations> = Record<
	Action,
	FormSuccessData | FormFailureData<Validations, Action>
>;

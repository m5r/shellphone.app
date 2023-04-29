import { type LoaderArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
	return redirect("/messages");
}

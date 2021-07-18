import type { NextApiRequest, NextApiResponse } from "next";

import supabase from "../../../supabase/server";

export default async function session(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	return supabase.auth.api.setAuthCookie(req, res);
}

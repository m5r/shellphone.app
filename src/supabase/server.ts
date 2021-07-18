import getConfig from "next/config";
import { createClient } from "@supabase/supabase-js";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const { supabase: { url } } = publicRuntimeConfig;
const { supabase: { roleKey } } = serverRuntimeConfig;

const supabase = createClient(url, roleKey);

export default supabase;
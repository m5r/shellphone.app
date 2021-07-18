import getConfig from "next/config";
import { createClient } from "@supabase/supabase-js";

const { publicRuntimeConfig } = getConfig();

const { supabase: { url, anonKey } } = publicRuntimeConfig;

const supabase = createClient(url, anonKey);

export default supabase;
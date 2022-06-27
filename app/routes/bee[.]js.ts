import type { LoaderFunction } from "remix";

export const loader: LoaderFunction = () => fetch("https://cdn.splitbee.io/sb.js");

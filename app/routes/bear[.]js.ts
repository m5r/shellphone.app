import type { LoaderFunction } from "remix";

export const loader: LoaderFunction = () => fetch("https://cdn.panelbear.com/analytics.js");

import { useRef } from "react";
import { usePress } from "@react-aria/interactions";

import { useRemoveDigit } from "./atoms";

export default function useOnBackspacePress() {
	const removeDigit = useRemoveDigit();
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const { pressProps: onBackspacePressProps } = usePress({
		onPressStart() {
			timeoutRef.current = setTimeout(() => {
				removeDigit();
				intervalRef.current = setInterval(removeDigit, 75);
			}, 325);
		},
		onPressEnd() {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
				return;
			}

			removeDigit();
		},
	});

	return onBackspacePressProps;
}

import { useCallback, useEffect } from "react";

export default function useKeyPress(onKeyPress: (key: string) => void) {
	const onKeyDown = useCallback(
		({ key }: KeyboardEvent) => {
			onKeyPress(key);
		},
		[onKeyPress],
	);

	useEffect(() => {
		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [onKeyDown]);
}

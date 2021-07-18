import type { ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

type Handler = (event: MouseEvent) => void;

type Props = {
	children: ReactNode;
	handler: Handler;
};

function OutsideAlerter({ children, handler }: Props) {
	const wrapperRef = useRef(null);
	useOutsideAlerter(wrapperRef, handler);

	return <div ref={wrapperRef}>{children}</div>;
}

function useOutsideAlerter(ref: RefObject<HTMLElement>, handler: Handler) {
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				handler(event);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref, handler]);
}

export default OutsideAlerter;

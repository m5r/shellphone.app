import { type FunctionComponent, type PropsWithChildren, useRef } from "react";
import { usePress } from "@react-aria/interactions";
import { useLongPressDigit, usePressDigit } from "~/features/keypad/hooks/atoms";

const Keypad: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => {
	return (
		<section>
			<Row>
				<Digit digit="1" />
				<Digit digit="2">
					<DigitLetters>ABC</DigitLetters>
				</Digit>
				<Digit digit="3">
					<DigitLetters>DEF</DigitLetters>
				</Digit>
			</Row>
			<Row>
				<Digit digit="4">
					<DigitLetters>GHI</DigitLetters>
				</Digit>
				<Digit digit="5">
					<DigitLetters>JKL</DigitLetters>
				</Digit>
				<Digit digit="6">
					<DigitLetters>MNO</DigitLetters>
				</Digit>
			</Row>
			<Row>
				<Digit digit="7">
					<DigitLetters>PQRS</DigitLetters>
				</Digit>
				<Digit digit="8">
					<DigitLetters>TUV</DigitLetters>
				</Digit>
				<Digit digit="9">
					<DigitLetters>WXYZ</DigitLetters>
				</Digit>
			</Row>
			<Row>
				<Digit digit="*" />
				<ZeroDigit />
				<Digit digit="#" />
			</Row>
			{typeof children !== "undefined" ? <Row>{children}</Row> : null}
		</section>
	);
};

export default Keypad;

const Row: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => (
	<div className="grid grid-cols-3 p-4 my-0 mx-auto text-black">{children}</div>
);

const DigitLetters: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => (
	<div className="text-xs text-gray-600">{children}</div>
);

type DigitProps = {
	digit: string;
};

const Digit: FunctionComponent<PropsWithChildren<DigitProps>> = ({ children, digit }) => {
	const pressDigit = usePressDigit();
	const onPressProps = {
		onPress() {
			// navigator.vibrate(1); // removed in webkit
			pressDigit(digit);
		},
	};
	const { pressProps } = usePress(onPressProps);

	return (
		<div {...pressProps} className="text-3xl cursor-pointer select-none">
			{digit}
			{children}
		</div>
	);
};

const ZeroDigit: FunctionComponent = () => {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pressDigit = usePressDigit();
	const longPressDigit = useLongPressDigit();
	const onPressProps = {
		onPressStart() {
			pressDigit("0");
			timeoutRef.current = setTimeout(() => {
				longPressDigit("+");
			}, 750);
		},
		onPressEnd() {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		},
	};
	const { pressProps } = usePress(onPressProps);

	return (
		<div {...pressProps} className="text-3xl cursor-pointer select-none">
			0 <DigitLetters>+</DigitLetters>
		</div>
	);
};

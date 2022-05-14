import type { FunctionComponent, PropsWithChildren } from "react";
import type { PressHookProps } from "@react-aria/interactions";
import { usePress } from "@react-aria/interactions";

type Props = {
	onDigitPressProps: (digit: string) => PressHookProps;
	onZeroPressProps: PressHookProps;
};

const Keypad: FunctionComponent<PropsWithChildren<Props>> = ({ children, onDigitPressProps, onZeroPressProps }) => {
	return (
		<section>
			<Row>
				<Digit onPressProps={onDigitPressProps} digit="1" />
				<Digit onPressProps={onDigitPressProps} digit="2">
					<DigitLetters>ABC</DigitLetters>
				</Digit>
				<Digit onPressProps={onDigitPressProps} digit="3">
					<DigitLetters>DEF</DigitLetters>
				</Digit>
			</Row>
			<Row>
				<Digit onPressProps={onDigitPressProps} digit="4">
					<DigitLetters>GHI</DigitLetters>
				</Digit>
				<Digit onPressProps={onDigitPressProps} digit="5">
					<DigitLetters>JKL</DigitLetters>
				</Digit>
				<Digit onPressProps={onDigitPressProps} digit="6">
					<DigitLetters>MNO</DigitLetters>
				</Digit>
			</Row>
			<Row>
				<Digit onPressProps={onDigitPressProps} digit="7">
					<DigitLetters>PQRS</DigitLetters>
				</Digit>
				<Digit onPressProps={onDigitPressProps} digit="8">
					<DigitLetters>TUV</DigitLetters>
				</Digit>
				<Digit onPressProps={onDigitPressProps} digit="9">
					<DigitLetters>WXYZ</DigitLetters>
				</Digit>
			</Row>
			<Row>
				<Digit onPressProps={onDigitPressProps} digit="*" />
				<ZeroDigit onPressProps={onZeroPressProps} />
				<Digit onPressProps={onDigitPressProps} digit="#" />
			</Row>
			{typeof children !== "undefined" ? <Row>{children}</Row> : null}
		</section>
	);
};

export default Keypad;

const Row: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => (
	<div className="grid grid-cols-3 p-4 my-0 mx-auto text-black">{children}</div>
);

const DigitLetters: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => <div className="text-xs text-gray-600">{children}</div>;

type DigitProps = {
	digit: string;
	onPressProps: Props["onDigitPressProps"];
};

const Digit: FunctionComponent<PropsWithChildren<DigitProps>> = ({ children, digit, onPressProps }) => {
	const { pressProps } = usePress(onPressProps(digit));

	return (
		<div {...pressProps} className="text-3xl cursor-pointer select-none">
			{digit}
			{children}
		</div>
	);
};

type ZeroDigitProps = {
	onPressProps: Props["onZeroPressProps"];
};

const ZeroDigit: FunctionComponent<PropsWithChildren<ZeroDigitProps>> = ({ onPressProps }) => {
	const { pressProps } = usePress(onPressProps);

	return (
		<div {...pressProps} className="text-3xl cursor-pointer select-none">
			0 <DigitLetters>+</DigitLetters>
		</div>
	);
};

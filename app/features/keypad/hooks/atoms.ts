import { atom, useAtom } from "jotai";

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	if ("0123456789+#*".indexOf(digit) === -1) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState + digit);
});
const longPressDigitAtom = atom(null, (get, set, replaceWith: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState.slice(0, -1) + replaceWith);
});
const pressBackspaceAtom = atom(null, (get, set) => {
	if (get(phoneNumberAtom).length === 0) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState.slice(0, -1));
});

export const usePhoneNumber = () => useAtom(phoneNumberAtom);
export const useRemoveDigit = () => useAtom(pressBackspaceAtom)[1];
export const usePressDigit = () => useAtom(pressDigitAtom)[1];
export const useLongPressDigit = () => useAtom(longPressDigitAtom)[1];

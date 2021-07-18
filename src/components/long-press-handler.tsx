import { FunctionComponent } from "react";
import usePress from "react-gui/use-press";

const LongPressHandler: FunctionComponent = ({ children }) => {
	const onLongPress = (event: any) => console.log("event", event);
	const ref = usePress({ onLongPress });

	return (
		<div ref={ref} onContextMenu={e => e.preventDefault()}>
			{children}
		</div>
	);
};

export default LongPressHandler;

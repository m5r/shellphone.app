import * as React from "react";
import { StyleSheet } from "react-native";

import EditScreenInfo from "../components/EditScreenInfo";
import { Text, View } from "../components/Themed";
import type { Conversation } from "../../api/src/controller/sms";

export default function TabTwoScreen() {
	const [conversations, setConversations] = React.useState<Conversation>({});
	const conversationsEntries = Object.entries(conversations);

	React.useEffect(() => {
		fetch("http://192.168.1.40:3000/conversations")
			.then(response => response.json())
			.then(conversations => setConversations(conversations))
			.catch(error => console.error("error", error));
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Tab Two</Text>
			<View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
			{conversationsEntries.map(([recipient, messages], index) => {
				const lastMessage = messages[messages.length - 1];
				return (
					<>
						<View>
							<Text>{recipient}</Text>
							<Text>{lastMessage.content}</Text>
							<Text>{new Date(lastMessage.sentAt).toDateString()}</Text>
						</View>
						{index + 1 < messages.length && (
							<View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
						)}
					</>
				)
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: "80%",
	},
});

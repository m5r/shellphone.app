import { render } from "../../test/utils"
import Home from "./index"
import useCurrentCustomer from "../core/hooks/use-current-customer"

jest.mock("../core/hooks/use-current-customer")
const mockUseCurrentCustomer = useCurrentCustomer as jest.MockedFunction<typeof useCurrentCustomer>

test.skip("renders blitz documentation link", () => {
	// This is an example of how to ensure a specific item is in the document
	// But it's disabled by default (by test.skip) so the test doesn't fail
	// when you remove the the default content from the page

	// This is an example on how to mock api hooks when testing
	mockUseCurrentCustomer.mockReturnValue({
		customer: {
			id: uuidv4(),
			encryptionKey: "",
			accountSid: null,
			authToken: null,
			twimlAppSid: null,
			paddleCustomerId: null,
			paddleSubscriptionId: null,
			user: {} as any,
		},
		hasCompletedOnboarding: false,
	})

	const { getByText } = render(<Home />)
	const linkElement = getByText(/Documentation/i)
	expect(linkElement).toBeInTheDocument()
})

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

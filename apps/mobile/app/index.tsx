import { Redirect } from "expo-router";

/**
 * Root route - redirect to main app (tabs)
 * Users can browse the app freely without authentication.
 * Authentication is only required for protected actions.
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

import { getAuth } from "firebase/auth";

export async function getAuthToken(): Promise<string> {
  const auth = getAuth();

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated");
  }

  // Force refresh to avoid stale tokens
  const token = await user.getIdToken(true);

  return token;
}
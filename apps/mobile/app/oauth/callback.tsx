import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function OAuthCallback() {
  const { code, error } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      // handle OAuth error
    //   router.replace("/login");
      return;
    }

    if (code) {
      // send code to backend
      finishLogin(code as string);
    }
  }, [code, error]);

  return null; // or loading spinner
}

async function finishLogin(code: string) {
  // POST code to backend
  // receive session/JWT
  // store securely
}
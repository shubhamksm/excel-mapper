import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function Login() {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <Button onClick={handleLogin}>Sign in with Google</Button>;
}

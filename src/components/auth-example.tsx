// Example of how to use the auth store and hook in your components

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AuthExample() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    register 
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: "user@example.com",
        password: "password123"
      });
      toast.success("Login successful!");
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        confirmPassword: "password123"
      });
      toast.success("Registration successful!");
    } catch (error) {
      toast.error("Registration failed: " + (error as Error).message);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">Welcome, {user.name}!</h2>
        <p>Email: {user.email}</p>
        <p>Role: {user.role || "Not set"}</p>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Not logged in</h2>
      <div className="space-x-2">
        <Button onClick={handleLogin}>
          Login
        </Button>
        <Button onClick={handleRegister} variant="outline">
          Register
        </Button>
      </div>
    </div>
  );
}

// How to integrate with your existing sign-in page:
/*
In your sign-in page, you can replace the manual token handling with:

import { useAuth } from "@/hooks/use-auth";

export default function SignInPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login({ email, password });
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
    }
  };

  // ... rest of your component
}
*/
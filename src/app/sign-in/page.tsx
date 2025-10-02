"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";
import { toast } from "sonner";
import { Eye, EyeClosed, UserPlus } from "lucide-react";
import Link from "next/link";
import { JAVA_SERVER_URL } from "@/lib/api/constant";

export default function SignInPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loginPromise = async () => {
      const res = await fetch(`${JAVA_SERVER_URL}/api/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to sign in");
      }

      const response = await res.json();
      const token = response.data.token;

      if (!token) {
        throw new Error("No token returned from server");
      }

      // simpan token di localStorage atau cookie (sesuai kebutuhan auth-mu)
      localStorage.setItem("token", token);
    };

    toast.promise(loginPromise(), {
      loading: "Signing in...",
      success: () => {
        startTransition(() => {
          router.push("/dashboard");
        });
        return "Signed in successfully!";
      },
      error: (error) => {
        setIsSubmitting(false);
        console.log(error.message);
        return error.message || "Something went wrong. Try again.";
      },
    });
  };

  const isDisabled = isSubmitting || isPending;

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <Image
                      src="/bmri-icon.png"
                      alt="BMRI Icon"
                      width={32}
                      height={32}
                    />
                  </div>
                </Link>
                <h1 className="text-xl font-bold">Welcome to DCD</h1>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    required
                    type="email"
                    placeholder="example@bankmandiri.co.id"
                    defaultValue="albert@bankmandiri.co.id"
                  />

                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>

                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      defaultValue="password_albert"
                      className="pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:underline"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="w-full flex justify-end">
                    <a
                      href="#"
                      className="text-sm underline underline-offset-4"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isDisabled}
                  className="w-full bg-sky-900 hover:bg-sky-700"
                >
                  {isDisabled ? "Signing in..." : "Sign In"}
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-background text-muted-foreground relative z-10 px-2">
                  Or
                </span>
              </div>
              <Button
                variant="outline"
                type="button"
                className="w-full bg-zinc-900 hover:bg-zinc-700 hover:text-white text-white"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Toaster theme="light" position="bottom-center" richColors />
    </div>
  );
}

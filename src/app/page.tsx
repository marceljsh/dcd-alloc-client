// import { cookies } from "next/headers"
import { redirect } from "next/navigation";

export default async function Home() {
  // const cookieStore = await cookies()
  // const token = cookieStore.get("auth_token")

  const token = process.env.LOGIN_SUCCESS === "true";

  if (!token) {
    redirect("/sign-in");
  }

  redirect("/dashboard");
}

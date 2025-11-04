import { redirect } from "next/navigation";

// Login is now at the root page (/), redirect here
export default async function LoginPage() {
  redirect("/");
}

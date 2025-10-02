import { redirect } from "next/navigation";

export default async function RegisterPage() {
  // Public registration is disabled
  // Accounts must be created by administrators
  redirect("/login");
}

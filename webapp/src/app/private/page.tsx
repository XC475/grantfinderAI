import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/login/actions";

export default async function PrivatePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Private Dashboard</h1>
      <p className="mb-4">Hello {data.user.email}</p>

      <form action={logout}>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </form>
    </div>
  );
}

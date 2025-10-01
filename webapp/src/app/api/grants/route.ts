import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("opportunities").select("*");

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Error fetching grants:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

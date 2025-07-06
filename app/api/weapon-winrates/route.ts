import { NextResponse } from "next/server";
import { getWeaponStats } from "@/lib/albion";

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getWeaponStats();
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
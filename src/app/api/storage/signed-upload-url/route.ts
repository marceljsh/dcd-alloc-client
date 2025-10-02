import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { path, bucket = "contracts" } = await req.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'path'" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY) as string;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server storage is not configured. Missing SUPABASE envs." },
        { status: 500 }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to create signed URL" },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = admin.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      bucket,
      path,
      signedUrl: data.signedUrl,
      token: data.token || null,
      publicUrl: publicUrlData?.publicUrl || null,
    });
  } catch (err) {
    const errorMessage =
      err && typeof err === "object" && "message" in err
        ? (err as Error).message
        : "Unexpected server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  const urlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const serviceSet = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  return NextResponse.json({
    ok: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: urlSet,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonSet,
      SUPABASE_SERVICE_ROLE_KEY: serviceSet,
    },
  })
}

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ ok: false, message: "Email is required" }, { status: 400 })
    }

    // Mock forgot password - in production, send actual reset email
    // You would typically:
    // 1. Check if email exists in your database
    // 2. Generate a reset token
    // 3. Save token to database with expiry
    // 4. Send email with reset link

    return NextResponse.json({ ok: true, message: "Reset link sent to email" })
  } catch (e) {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 })
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, hashIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const ipH = hashIp(ip);

    // Limit to 5 contact messages per hour per IP
    const rateCheck = checkRateLimit(`contact-${ipH}`, 5, 3600000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many messages sent. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const saved = await prisma.contactMessage.create({
      data: {
        name: String(name).slice(0, 100),
        email: String(email).slice(0, 150),
        subject: String(subject || "General Inquiry").slice(0, 200),
        message: String(message).slice(0, 5000),
        ipHash: ipH,
      },
    });

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: "Thank you! Your message has been received.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}

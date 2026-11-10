import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/security";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });

  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: admin });
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.id },
  });

  if (!admin) {
    return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    const updateData: any = {};

    // 1. Update Name
    if (name && typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }

    // 2. Update Email (Requires current password verification)
    const isEmailChanging =
      email &&
      typeof email === "string" &&
      email.trim().toLowerCase() !== admin.email.toLowerCase();

    if (isEmailChanging) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change email" },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Check if email already used by another admin
      const existingUser = await prisma.adminUser.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (existingUser && existingUser.id !== admin.id) {
        return NextResponse.json(
          { error: "This email address is already in use by another account" },
          { status: 400 }
        );
      }
      updateData.email = email.trim().toLowerCase();
    }

    // 3. Update Password (Requires current password verification)
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters long" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No changes provided to update" },
        { status: 400 }
      );
    }

    const updatedAdmin = await prisma.adminUser.update({
      where: { id: admin.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, avatar: true },
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin credentials updated successfully",
      user: updatedAdmin,
    });

    // If email was changed, reissue the session cookie with new email
    if (updateData.email) {
      const newToken = signAdminToken({
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
      });
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    return response;
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "An error occurred while updating admin credentials" },
      { status: 500 }
    );
  }
}

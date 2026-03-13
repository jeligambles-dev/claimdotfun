import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function checkAuth(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const password = req.headers.get("x-admin-password");
  return password === expected;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "stats") {
    const totalTokens = await prisma.token.count();
    const claimedTokens = await prisma.token.count({ where: { claimStatus: "CLAIMED" } });
    const totalClaims = await prisma.claim.count();
    const verifiedClaims = await prisma.claim.count({ where: { verified: true } });
    return NextResponse.json({
      success: true,
      stats: { totalTokens, claimedTokens, unclaimedTokens: totalTokens - claimedTokens, totalClaims, verifiedClaims },
    });
  }

  if (action === "tokens") {
    const tokens = await prisma.token.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, tokens });
  }

  if (action === "claims") {
    const claims = await prisma.claim.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, claims });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  if (type === "token") {
    // Delete associated claims first
    const token = await prisma.token.findUnique({ where: { id } });
    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }
    await prisma.claim.deleteMany({ where: { tokenId: id } });
    await prisma.token.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Deleted token ${token.name} (${token.symbol})` });
  }

  if (type === "claim") {
    const claim = await prisma.claim.findUnique({ where: { id } });
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    await prisma.claim.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `Deleted claim ${claim.verificationCode}` });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

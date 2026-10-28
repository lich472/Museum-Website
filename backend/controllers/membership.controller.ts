import { Request, Response } from "express";
import crypto from "crypto";
import Membership from "../models/membership.model.ts";
import mongoose from "mongoose";


const PLAN = { name: "Annual membership", cents: 3500 }; // server owns the price

function addOneYear(from: Date) {
  const d = new Date(from);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCFullYear(d.getUTCFullYear() + 1);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

async function summary(userId: mongoose.Types.ObjectId) {
  const memberships = await Membership.find({ userId }).sort({ createdAt: -1 });
  const now = new Date();
  const active = memberships.filter((m) => m.status === "active" && m.expiresAt > now);
  const expiresAt = active.reduce<Date | null>(
    (latest, m) => (!latest || m.expiresAt > latest ? m.expiresAt : latest),
    null
  );
  return { isMember: active.length > 0, expiresAt, plan: PLAN, memberships };
}

export const getMyMembership = async (req: Request, res: Response) => {
  try {
    res.status(200).json(await summary((req as any).user._id));
  } catch (error) {
    console.error("getMyMembership error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const purchaseMembership = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { requestId } = req.body ?? {};
    if (typeof requestId !== "string" || !requestId) {
      return res.status(400).json({ message: "Missing request id" });
    }

    const existing = await Membership.findOne({ requestId, userId });
    if (existing) return res.status(200).json(existing);

    // A renewal starts when the current membership ends, so no time is lost
    const { expiresAt: currentExpiry } = await summary(userId);
    const now = new Date();
    const startsAt = currentExpiry && currentExpiry > now ? currentExpiry : now;

    const membership = await Membership.create({
      userId,
      requestId,
      reference: "MEM-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
      cents: PLAN.cents,
      startsAt,
      expiresAt: addOneYear(startsAt),
    });
    res.status(201).json(membership);
  } catch (error) {
    console.error("purchaseMembership error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelMyMembership = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const result = await Membership.updateMany(
      { userId, status: "active", expiresAt: { $gt: new Date() } },
      { status: "cancelled", cancelledAt: new Date() }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "No active membership to cancel" });
    }
    res.status(200).json(await summary(userId));
  } catch (error) {
    console.error("cancelMyMembership error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
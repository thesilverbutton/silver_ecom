"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Settings } from "@/models/settings.model";
import { AuditLog } from "@/models/audit-log.model";
import { logger } from "@/lib/logger";

export interface SettingsInput {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  gstEnabled: boolean;
  gstPercent?: number;
  flatShippingRate: number;
  freeShippingThreshold?: number;
  codEnabled: boolean;
  returnWindowDays: number;
  originPincode: string;
}

export async function updateSettingsAction(input: SettingsInput) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return { ok: false, error: "Only admin can update settings" };
    }

    await connectDB();

    const settings = await Settings.findOne({});
    if (!settings) return { ok: false, error: "Settings not found. Run seed first." };

    settings.storeName = input.storeName;
    settings.supportEmail = input.supportEmail;
    settings.supportPhone = input.supportPhone;
    settings.gstEnabled = input.gstEnabled;
    settings.gstPercent = input.gstPercent;
    settings.flatShippingRate = input.flatShippingRate;
    settings.freeShippingThreshold = input.freeShippingThreshold;
    settings.codEnabled = input.codEnabled;
    settings.returnWindowDays = input.returnWindowDays;
    settings.originPincode = input.originPincode;

    await settings.save();

    await AuditLog.create({
      actorId: session.user.id,
      actorEmail: session.user.email,
      actorRole: session.user.role as "admin" | "staff",
      action: "settings.update",
      entity: "Settings",
      entityId: String(settings._id),
    });

    logger.info("Settings updated", { by: session.user.email });
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return { ok: true };
  } catch (err) {
    logger.error("updateSettingsAction failed", { error: String(err) });
    return { ok: false, error: "Failed to update settings" };
  }
}

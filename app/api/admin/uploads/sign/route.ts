import { cloudinary } from "@/lib/cloudinary";
import { auth } from "@/lib/auth";

/**
 * Returns a signed Cloudinary upload payload.
 * Used by the admin product form to upload images directly to Cloudinary.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session || !["admin", "staff"].includes(session.user.role)) {
      return Response.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "products";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return Response.json({
      ok: true,
      data: {
        signature,
        timestamp,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch {
    return Response.json(
      { ok: false, error: { code: "INTERNAL", message: "Failed to sign upload" } },
      { status: 500 },
    );
  }
}

"use server";

import { connectDB } from "@/lib/db";
import { ContactQuery } from "@/models/contact-query.model";

export async function submitContactForm(formData: FormData) {
  try {
    // Basic honeypot check
    const website = formData.get("website");
    if (website) {
      // Spam detected, pretend it succeeded
      return { success: true };
    }

    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const subject = formData.get("subject")?.toString() || "";
    const message = formData.get("message")?.toString();

    if (!name || !email || !message) {
      return { success: false, error: "Name, email, and message are required." };
    }

    await connectDB();

    await ContactQuery.create({
      name,
      email,
      subject,
      message,
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "Failed to submit message. Please try again later." };
  }
}

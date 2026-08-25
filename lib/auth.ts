import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models/customer.model";
import { AdminUser } from "@/models/admin-user.model";
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    role: UserRole;
    permissions?: string[];
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      permissions?: string[];
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // 30 days
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      id: "customer",
      name: "Customer",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const customer = await Customer.findOne({
          email: (credentials.email as string).toLowerCase(),
        });

        if (!customer || !customer.passwordHash) return null;
        if (customer.isBlocked) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          customer.passwordHash,
        );
        if (!valid) return null;

        // Update last login
        customer.lastLoginAt = new Date();
        await customer.save();

        return {
          id: customer._id.toString(),
          name: customer.name,
          email: customer.email,
          role: "customer" as const,
        };
      },
    }),
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const admin = await AdminUser.findOne({
          email: (credentials.email as string).toLowerCase(),
        });

        if (!admin || !admin.isActive) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash,
        );
        if (!valid) return null;

        admin.lastLoginAt = new Date();
        await admin.save();

        return {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions ? Array.from(admin.permissions) : [],
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.permissions = token.permissions as string[] | undefined;
      return session;
    },
  },
});

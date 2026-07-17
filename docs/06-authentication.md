# 06 — Authentication & Authorization

> Auth.js (NextAuth v5) on the App Router. Two distinct principals: **Customers** and **Admins/Staff**. Guests can check out without an account.

## 1. Principals

| Principal | Store | Roles | Area |
| --- | --- | --- | --- |
| Guest | none (cookie cart + order snapshot) | — | storefront, guest checkout |
| Customer | `Customer` collection | `customer` | `/account/*` |
| Admin/Staff | `AdminUser` collection | `admin`, `staff` | `/admin/*` |

Keep Customer and Admin credentials in **separate collections** for privilege isolation. A customer account can never escalate to admin.

## 2. Strategy

- **Sessions:** JWT strategy (stateless, Vercel-friendly). Store `sub`, `role`, `email`, `name` in the token. Session max age 30 days, rolling.
- **Credentials provider** for both customer and admin login (email + password, bcrypt with cost ≥ 12).
- Optional (post-launch, not default): Google OAuth for customers. Do not build unless requested.
- Use the **Mongoose adapter** only if DB sessions are chosen; default is JWT so an adapter is optional. If OAuth is added later, add the adapter then.

## 3. Configuration (`src/lib/auth.ts`)

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: '/login', error: '/login' },
  providers: [
    Credentials({
      id: 'customer',
      authorize: async (creds) => { /* validate via customer.service, return {id, role:'customer', ...} */ },
    }),
    Credentials({
      id: 'admin',
      authorize: async (creds) => { /* validate via admin.service, return {id, role, permissions} */ },
    }),
  ],
  callbacks: {
    jwt({ token, user }) { if (user) { token.role = user.role; token.permissions = user.permissions; } return token; },
    session({ session, token }) { session.user.role = token.role; session.user.permissions = token.permissions; return session; },
  },
});
```
- `AUTH_SECRET` required; `AUTH_TRUST_HOST=true` on Vercel.
- Login inputs validated with Zod; generic error message on failure (never reveal which field was wrong).

## 4. Registration & Login Flows

### Customer registration
1. Zod-validate `{ name, email, password }` (password ≥ 8, complexity check).
2. Reject if email exists (generic message).
3. Hash password (bcrypt ≥ 12), create `Customer` with `role:'customer'`.
4. (Optional) send verification email via Resend; allow shopping before verification, gate sensitive actions if needed.
5. Auto sign-in.

### Customer login
- Credentials provider `id:'customer'`. Rate-limited (see §7). Update `lastLoginAt`.

### Guest checkout
- No account required. Collect email + shipping at checkout. Order stored with `isGuest:true`, `customerId:null`.
- Offer "create an account" post-purchase (prefill from order). On later signup with same email, allow linking past guest orders by email match (manual/admin or on-verify).

### Admin login
- Separate route `/admin/login` using Credentials `id:'admin'`. Never expose admin login from storefront nav.
- First admin seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` via `scripts/seed.ts` (idempotent). Force password change on first login (recommended).

## 5. Authorization

- **Route protection** in `middleware.ts`:
  - `/account/*` → require any authenticated customer session; else redirect `/login?next=`.
  - `/admin/*` → require session with `role in {admin, staff}`; else redirect `/admin/login`. `/admin/login` itself is public.
- **Server-side enforcement is mandatory.** Middleware is a first gate, not the guarantee. Every account/admin action and route handler re-checks the session and ownership/role server-side before mutating.
- **Ownership checks:** a customer may only read/modify their own orders, addresses, wishlist. Enforce `resource.customerId === session.user.id`.
- **Permissions (staff):** `staff` role limited by `permissions[]` (e.g., `orders:read`, `orders:write`, `products:write`). `admin` has all. Check permission in the service, not the UI.

Helper:
```ts
async function requireAdmin(perm?: string) {
  const session = await auth();
  if (!session || !['admin','staff'].includes(session.user.role)) throw new ForbiddenError();
  if (perm && session.user.role === 'staff' && !session.user.permissions?.includes(perm)) throw new ForbiddenError();
  return session;
}
```

## 6. Sessions & Cookies

- HTTP-only, `Secure`, `SameSite=Lax` session cookies.
- Guest cart cookie: HTTP-only, `SameSite=Lax`, 30-day expiry, opaque `cartId`.
- On login, call `mergeGuestCart()` then clear the guest cart cookie.
- Sign-out clears session; account area becomes inaccessible immediately.

## 7. Security Controls

- **Rate limiting** (MongoDB TTL counter, no Redis): login/register max ~5 attempts / 15 min / IP+email; lock with backoff message.
- **Password reset:** signed, single-use, time-limited token (store hashed token + expiry on Customer); delivered via Resend; never email the password.
- **Brute-force / enumeration:** identical response + timing for unknown vs wrong-password.
- **CSRF:** Auth.js handles provider CSRF; server actions are origin-checked by Next.js. For custom state-changing route handlers, verify same-origin.
- **PII:** store minimal PII; never log passwords or tokens; redact in AuditLog.
- **Blocked users:** `Customer.isBlocked` / `AdminUser.isActive=false` → deny login and invalidate sessions on next request.

## 8. Acceptance Criteria

- [ ] Customer can register, log in, log out; session persists 30 days rolling.
- [ ] Guest can complete checkout with no account.
- [ ] `/account/*` and `/admin/*` are inaccessible without the correct role (verified server-side, not just middleware).
- [ ] Admin and customer credential stores are separate; a customer cannot obtain admin role.
- [ ] Login is rate-limited; errors are generic; passwords are bcrypt-hashed.
- [ ] Guest cart merges into customer cart on login.
- [ ] Password reset works end to end and tokens are single-use.

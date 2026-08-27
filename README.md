# The Silver Button 🥈 - E-Commerce Platform

A modern, full-stack e-commerce platform built for high performance and seamless user experience. This project uses the latest tools in the React ecosystem including Next.js App Router, Tailwind CSS v4, and MongoDB.

## 🏗️ Tech Stack & Architecture

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://react.dev/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
- **Authentication:** [Auth.js](https://authjs.dev/) (NextAuth v5)
- **Payments:** [Cashfree Payments](https://www.cashfree.com/) (PG v6 SDK)
- **Logistics:** Shiprocket (for delivery and order tracking)
- **Media Management:** [Cloudinary](https://cloudinary.com/) (for product images)
- **Email Service:** [Resend](https://resend.com/)

### Core Architecture
- **`(storefront)`:** The main customer-facing UI (products, cart, checkout).
- **`(admin)`:** Protected dashboard for store administrators to manage inventory, view orders, and handle logistics.
- **`(account)`:** Protected area for logged-in customers to view their order history and track deliveries.
- **`api/`:** Next.js Route Handlers powering webhooks (Cashfree, Shiprocket) and client-side fetches.
- **`services/`:** Business logic separation (e.g., `payment.service.ts`, `cart.service.ts`, `order.service.ts`).
- **`models/`:** Mongoose schemas defining the data layer.

## 📂 Project Structure

```text
.
├── app/                  # Next.js App Router (pages, layouts, api routes)
│   ├── (admin)/          # Admin Dashboard routes
│   ├── (storefront)/     # Customer facing routes (shop, cart, checkout)
│   ├── (account)/        # Customer profile & order history
│   └── api/              # API Endpoints (including webhooks)
├── components/           # Reusable UI components (buttons, cards, forms)
├── lib/                  # Utilities (db connection, auth config, env validation)
├── models/               # Mongoose DB schemas (Order, Product, User, Payment)
├── services/             # Core business logic
├── schemas/              # Zod validation schemas
├── scripts/              # Utility scripts (e.g., db seeding)
└── public/               # Static assets
```

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** (v20 or newer recommended)
- **pnpm** (Package manager)
- A **MongoDB** instance (local or MongoDB Atlas)

### 2. Environment Variables
Copy the example environment file and fill in your credentials.

```bash
cp .env.example .env
```
Ensure you have the required keys for MongoDB, Auth.js (generate a secret using `npx auth secret`), Cloudinary, and Cashfree (Sandbox keys for local dev).

### 3. Installation
Install the dependencies using `pnpm`:

```bash
pnpm install
```

### 4. Database Seeding (Optional)
To populate your local database with initial admin credentials or sample products:

```bash
pnpm run seed
```

### 5. Run the Development Server

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 6. Test Checkout Locally with ngrok

1. Start the app on port 3000 with `pnpm dev`.
2. Start the tunnel with `ngrok http 3000`.
3. Set these local environment values, then restart the app:

```dotenv
NEXT_PUBLIC_APP_URL=https://your-current-subdomain.ngrok-free.app
CASHFREE_ENV=SANDBOX
NEXT_PUBLIC_CASHFREE_ENV=sandbox
```

4. In the Cashfree test dashboard, configure the webhook URL as `https://your-current-subdomain.ngrok-free.app/api/webhooks/cashfree`, use webhook version `2025-01-01`, and subscribe to payment success, payment failed, payment user dropped, and refund status events.
5. In Shiprocket under **Settings > API > Webhooks**, configure `https://your-current-subdomain.ngrok-free.app/api/webhooks/shipping`. Set the Shiprocket security token to the same value as `SHIPROCKET_WEBHOOK_SECRET`; Shiprocket sends it in the `x-api-key` header.
6. Replace `NEXT_PUBLIC_APP_URL` and both dashboard webhook URLs whenever the ngrok hostname changes.

Expected progression after a successful sandbox payment:

```text
Payment: Paid
Delivery: Preparing for dispatch -> In transit -> Delivered
```

Cashfree redirects are not treated as proof of payment. The return page and webhook both verify or process the same database order, and repeated webhooks are safe to retry.

## 🌍 Deployment to Production (Vercel)

This project is optimized for deployment on Vercel.

### Steps to Deploy:
1. Push your code to a GitHub/GitLab repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository.
4. Expand the **Environment Variables** section and add all necessary production keys.

### ⚠️ Critical Production Environment Variables:

- `NODE_ENV`: Set to `production`
- `NEXT_PUBLIC_APP_URL`: **Must** be set to your exact production domain (e.g., `https://silverbutton.in`). *This is strictly required for Cashfree return URLs to function correctly!*
- `CASHFREE_APP_ID`: Your **Production** Cashfree App ID.
- `CASHFREE_SECRET_KEY`: Your **Production** Cashfree Secret Key (starts with `cfsk_ma_prod_`).
- `CASHFREE_ENV`: Set to `PRODUCTION`.
- `NEXT_PUBLIC_CASHFREE_ENV`: Set to `production`.
- `SHIPROCKET_EMAIL`: A dedicated Shiprocket API user email.
- `SHIPROCKET_PASSWORD`: The password for that Shiprocket API user.
- `SHIPROCKET_PICKUP_LOCATION`: The exact pickup nickname configured in Shiprocket, such as `Primary`; do not use the street address.
- `SHIPROCKET_WEBHOOK_SECRET`: A long random token used both in Vercel and as the Shiprocket webhook security token.

> **Note on Payments:** Do not mix Sandbox and Production keys in your environment variables. Ensure the `CASHFREE_SECRET_KEY` matches the environment you intend to use.

### Production Dashboard Checklist

1. Set `NEXT_PUBLIC_APP_URL=https://silverbutton.in` without a path and redeploy after changing environment variables.
2. In the Cashfree production dashboard, complete KYC, whitelist `silverbutton.in`, enable the required payment methods, and register `https://silverbutton.in/api/webhooks/cashfree` with version `2025-01-01`.
3. Subscribe the Cashfree production webhook to payment success, payment failed, payment user dropped, and refund status events. Production webhook configuration does not carry over from sandbox.
4. If the firewall restricts inbound traffic, allow Cashfree production webhook IPs listed in Cashfree's current documentation.
5. In Shiprocket, register `https://silverbutton.in/api/webhooks/shipping` and use the same security token stored in `SHIPROCKET_WEBHOOK_SECRET`.
6. Process one small real payment, confirm the order becomes paid and a Shiprocket order plus shipment ID are stored, verify AWB generation, send one Shiprocket webhook test, and process a test refund before opening checkout to customers.

## 💳 Third-Party Integrations

### Cashfree Payments
- Handles processing of all store orders.
- Order creation is handled server-side via `services/payment.service.ts`.
- The webhook endpoint `app/api/webhooks/cashfree/route.ts` listens for successful payments and marks orders as paid automatically using cryptographically verified webhook signatures.

### Cloudinary
- Used for hosting product images securely.
- Ensure your Cloudinary Cloud Name, API Key, and API Secret are properly set in your environment variables to allow admin image uploads.

### Shiprocket
- Handles fulfillment and delivery tracking. 
- Integrated to sync orders upon successful Cashfree payment.

---
*Built with ❤️ for The Silver Button.*

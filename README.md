# KitGrid

> Online store for football coaches and team managers: matchday kits, training wear, training equipment and coach and staff apparel, with bulk pricing and an AI Kit Advisor. Open to individual players too.

**Environment:** Local development (`http://localhost:5173` client / `http://localhost:3000` API & Admin).  
**Admin dashboard:** `http://localhost:3000/admin` (port set via `PORT` in `.env`)  
**Seeded test accounts** *(created by `src/db/seed.sql`)*:
* **Admin:** `admin@kitgrid.example` / `Admin123!`
* **Customer:** `cust.test@example.com` / `Cust12345`

## Contents
1. [Business Context & Goals](#1-business-context--goals)
2. [UX/UI Design](#2-uxui-design)
3. [Features, Algorithms & AI](#3-features-algorithms--ai)
4. [Use Cases](#4-use-cases)
5. [Tech Stack & Architecture](#5-tech-stack--architecture)
6. [Testing](#6-testing)
7. [Deployment & Local Setup](#7-deployment--local-setup)
8. [Credits](#8-credits)

---

## 1. Business Context & Goals

**The problem:** Most sportswear shops are built for one shopper buying one shirt in one size. A coach/manager buying for a squad, such as 18 jerseys across three sizes and 12 training bibs, has to add every size separately, only sees bulk pricing at the end (or must email a supplier for a quote), and often finds out late that a size is out of stock. In Singapore, this buyer is usually the team manager of a amateur/semi-pro/pro team working with a fixed or tight budget.

**How KitGrid solves it:** KitGrid puts all sizes on one interactive grid, calculates bulk discounts upfront across combined sizes, and validates live stock before checkout.

**Project goals:**
- Let a team manager asks from a brief (*"U12 team of 16, S$800 budget"*) to a stock-checked bundle in one chat.
- Give admins one dashboard to manage orders, products, stock, and users.
- Build a secure, layered full-stack app (API, service layer, DAL, JWT, CSRF protection, and rate limiting).

---

## 2. UX/UI Design

### User stories

| # | As a... | I want to... | So that... | Acceptance criteria |
|---|---|---|---|---|
| 1 | Manager | filter products by colour, age group, size and price | I only see gear that suits my team | Filters combine; results update; out-of-stock sizes are marked |
| 2 | Manager | enter quantities for every size on one product page and add them in one click | I can order a full squad kit quickly | All sizes in one grid with stock; blank sizes are ignored; out-of-stock sizes are disabled |
| 3 | Manager | see the bulk discount for my total units of a product, and what the next tier needs | I know the real price and how many more to add | Units across all sizes count; the cart shows "Add 3 more for 15% off" |
| 4 | Manager | tell the Kit Advisor my squad size and budget | I get a ready bundle | Only in-stock items are suggested; prices come from the server, not the AI; "Add all to cart" adds the whole kit |
| 5 | Guest | add items to a cart without an account | I can browse before committing | Cart persists on refresh; merges into my account after login |
| 6 | Individual player | buy a single item | I can shop like any customer | Checkout works for one item; bulk discounts only apply at their quantities |
| 7 | Customer | view my past orders and their progress | I know what I bought and where each order is | Search by order number or product name; each order shows its items, totals, address and a status timeline |
| 8 | Admin | change an order's status | customers see progress | The change is saved with who and when in the status history |
| 9 | Admin | see low-stock items | I can restock in time | The list shows variants at or below their threshold |
| 10 | Admin | ask an assistant for an order summary and the low-stock list, and change a threshold in plain language | I see what needs action without reading tables | Figures match the database; a threshold change is only saved after I confirm it |

### Wireframes / mockups

Designed in Figma: [KitGrid wireframes](https://www.figma.com/design/cq6XiwBgeNEqBSj6JBGxTi/kitgrid?node-id=0-1&t=alvIKCQRt4xwdID4-1). 
- **Customer frames:** Home, Product list, Product detail, Cart, Checkout (Delivery, Review & pay), Login/Register, Order confirmation, Order history and detail, Team profile, Kit Advisor, States (loading, empty, error), Mobile (Home, Product detail, Cart), and Design system.  
- **Admin frames:** Sign in, Orders, Order detail, Dashboard with the assistant, Products, Product form, and Users.

### Five Planes of UI/UX

| Plane | Decisions |
|---|---|
| **Strategy** | Users: coaches and team managers. Goal: fast team buying in bulk. |
| **Scope** | The features below; additionals under Pending features. Prices in SGD. Four categories. Guests can fill a cart, but must log in to check out. |
| **Structure** | Home → Category list → Product → Cart → Checkout (Delivery, Review & pay) → Confirmation → My orders. |
| **Skeleton** | Filters on the left of the product list. A size grid on the product page. The cart groups sizes by product. A 2-step checkout with no main menu or Kit Advisor. The Kit Advisor button floats on the other pages. |
| **Surface** | Navy `#0F172A`, slate `#475569`, white, and accent blue `#0369A1` for actions; green for stock and discounts, red for errors. DM Sans font, 12 px rounded cards. The blue, slate and green are one shade darker than in the design-system wireframe. Grey boxes instead of product photos. |

---

## 3. Features, Algorithms & AI

### Customer & Admin Features
- **Authentication & roles:** Customer and admin roles with JWT (access + refresh tokens; refresh tokens are revoked on logout) and inline Yup validation matching server schemas.
- **Home & catalog:** Hero landing page with four categories (*Matchday Kits, Training Wear, Training Equipment, Coach & Staff Apparel*) and football-specific variant attributes (size, colour, age group, SKU, stock).
- **URL-synced multi-criteria search:** Filter by category, price, colour, age group, size, and minimum stock, persisted in query parameters.
- **Multi-size product grid:** Enter quantities across all sizes and colours on one product page, view live bulk discount tiers and totals, and add all in one click.
- **Bulk discount tiers:** Per-product discounts based on combined units across all sizes/colours (`10+` units = `10%`, `15+` = `15%`, `25+` = `20%`).
- **Guest & customer cart:** Persistent guest cart (`localStorage`) that merges into the user's account after login.
- **2-step checkout & delivery:** Delivery and Review steps for Singapore addresses with a flat `S$8.00` delivery fee (free from `15` items) and an order confirmation page.
- **Order history:** Searchable past orders (`5` per page) with an order detail page and full status timeline.
- **UI resilience:** Loading, empty, and error states with retry actions on every page.
- **EJS admin dashboard:** Server-rendered admin panel for orders, products, stock, and users with cookie authentication and CSRF protection on every form.
- **Rate limiting & logging:** Rate limits on login, registration, and Kit Advisor routes; request logs written to `logs/access.log` (`morgan`) and server errors to `logs/error.log`.

### Algorithms & Security Logic
- **Bulk discount & price snapshots:** Tiers are calculated server-side from total units of a product in the cart and applied to that product only. Unit prices, discount percentages, and variant details are copied into `order_items` at checkout so future price edits never alter historical orders.
- **Atomic stock deduction:** Checkout runs inside a single database transaction executing `UPDATE ... SET stock = stock - ? WHERE id = ? AND stock >= ?` for each line item. If any variant has insufficient stock, the entire transaction rolls back. Cancelling an order restores stock atomically the same way.
- **Server-priced guest cart:** `localStorage` stores only `{ variantId, quantity }` pairs. The server prices guest carts using the same pricing function as saved carts and caps merged quantities at live stock upon login.
- **Parameterized search & allowlisted sorting:** Queries start with `WHERE products.is_active = 1` and append `AND ...` conditions using `?` placeholders. `ORDER BY` clauses map strictly to a fixed allowlist, never raw user input.
- **Admin CSRF protection:** At admin login, a random token is embedded inside the signed admin JWT and sent back in a hidden `_csrf` field on every admin form; middleware rejects mismatches with `403`.

### AI Features (n8n Agents)
- **Kit Advisor (logged-in customers):** A two-tab chat panel (**For my team** and **For me**) proxied through Express so webhook URLs and keys never reach the browser. The n8n agent can only call two read-only tools: product search (in-stock items only) and cart quote. It returns structured JSON (`{ reply, items }`). **Zero-trust server validation:** Express re-checks every suggested variant against live stock and recalculates prices server-side before rendering the bundle card.
- **Admin Assistant (admins):** Supports quick prompts (*"This week's orders"*, *"Show low stock"*, *"Orders waiting to ship"*) and natural-language queries backed by read-only tools (low stock, order summaries, orders to ship by postal district, variant lookup). Low-stock threshold updates are only **proposed** by the AI—nothing changes until the admin clicks **Confirm** and Express validates the range (`0` to `1000`). In testing, an AI proposal of `2000` was rejected by the server (`400`).

### Known Limitations & Pending Features
- **In progress:** Stripe Checkout integration (test mode only; orders currently save as `pending_payment` for manual admin confirmation).
- **Planned features:** Team profile page, custom printing (player names and numbers), reorder from past orders, wishlist, PDF invoices, and product photo uploads.
- **Technical caveats:**
  - Guests must log in or register to check out.
  - Customer JWTs are stored in localStorage (an httpOnly cookie, as used by the admin panel, would harden against XSS).
  - Rate-limit counters are stored in server memory and reset on restart; POST /api/cart/quote is not rate limited.
  - Admin logout deletes the cookie, though the admin JWT remains valid until natural expiry.
  - (Kit Advisor) AI endpoints run on free tier (responses take 5–60 seconds and may be temporarily unavailable during provider load), do not retain multi-turn conversation history, and clear on user switch.
  - Product cards and pages display grey placeholders instead of photos, and size grids list sizes in database insertion order rather than XS → XL.

---

## 4. Use Cases

| Use case | Objective | Steps |
|---|---|---|
| Place a team order | Buy kit in bulk | 1. Browse and filter. 2. Enter quantities per size and add to cart. 3. Check the bulk discount in the cart. 4. Log in and enter delivery details. 5. Review and place the order. |
| Ask the Kit Advisor | Get a stock-checked bundle | 1. Log in. 2. Click "Ask the Kit Advisor". 3. Describe the squad, sizes and budget. 4. Check the suggested kit and total. 5. Add all to cart. |
| Update an order | Move an order along | 1. Log in to admin. 2. Open the order. 3. Change the status. 4. Check the status history. |

---

## 5. Tech Stack & Architecture

| Area | Technology |
|---|---|
| Frontend | React 19 with Vite (in `/client`), wouter, axios, Jotai, Formik with Yup, Bootstrap 5.3, Bootstrap Icons |
| Backend | Node.js, Express |
| Admin UI | EJS (server-rendered) |
| Database | MariaDB with `mysql2` (raw SQL in the DAL only) |
| Security | JWT (`jsonwebtoken`), bcrypt, own CSRF middleware, `express-rate-limit`, `cors`, Yup validation |
| Logging | `morgan` (request log) and a log file for server errors |
| Payments | Stripe Checkout (test mode, in progress) |
| AI | N8N agents (run locally). Kit Advisor: Groq `openai/gpt-oss-120b` (fallback `openai/gpt-oss-20b`). Admin assistant: Google Gemini `gemini-3.5-flash` (fallback `gemini-flash-latest`) |
| Testing | Manual end-to-end testing |
| Hosting | Localhost (MariaDB, Node.js, Vite, local n8n) |

**Repo:** https://github.com/fiqmeister/kitgrid-ecommerce-shop

### Architecture

```
React SPA  --JWT-->  Express API  -->  Controllers -> Services -> DAL -> MariaDB
EJS admin  --admin JWT cookie + CSRF token-->  Express /admin
Express    --webhook secret header-->  N8N agent
N8N agent  --API key-->  Express /api/tools (read-only)
```

### Data model (summary)

users (1:1 optional team_profiles), categories, products (1:M product_variants with size, colour, age group, SKU, stock and `low_stock_threshold`), tags (M:N through product_tags), cart_items, orders (1:M order_items, 1:M order_status_history), bulk_discount_rules, refresh_tokens.

- **Football-specific columns on `products`:** `pitch_surface`, `skill_level`, `material`, `weight_grams`, `durability_rating` (nullable where not applicable to a category).
- **Price snapshot on `order_items`:** unit price, discount percent, line total, product name, size and colour are copied when the order is placed.
- **Order statuses:** `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`. Every change is saved in `order_status_history`.

### Database setup

```
src/db/
├── database.js     mysql2 connection pool (reads the DB_ settings from .env)
├── reset.sql       drops every table (only for a rebuild)
├── schema.sql      creates every table
├── seed.sql        categories, discount rules, an admin, a test customer, products and variants
└── demo.sql        extra customers and orders #1001 to #1037 for the admin pages
```

Run order: `reset.sql` (only for a rebuild), `schema.sql`, `seed.sql`, `demo.sql` (optional).

---

## 6. Testing

### Manual test cases

| # | Test | Steps | Expected result |
|---|---|---|---|
| 1 | Register and log in | On `/login`, create an account with a new email and the password `password1`. Log out, then log in again | Both work. Wrong password: "Invalid email or password" |
| 2 | Guest cart merges after login | Log in, add Matchday Jersey Navy S 3, log out. As a guest, add Navy S 4, Navy L 5 and Training Bib Yellow 2, then log in | The cart shows Navy S 7 (3 + 4), Navy L 5, Bib 2 |
| 3 | Order reduces stock | Note the stock of Navy S and Navy L in the admin. Order Navy S 4 and Navy L 5 | The confirmation page opens; the admin shows the order as pending payment with S$350.00, and the stock is 4 and 5 lower |
| 4 | Bulk tier uses total units across sizes | Add 4 + 8 + 6 of one jersey in three sizes | 18 units get 15% off |
| 5 | Free delivery at 15+ items | Check out with 15 items, then with 14 | S$0.00, then S$8.00 |
| 6 | Product page total | On the Matchday Jersey page, type Navy S 4 and Navy L 5, switch to Red and type Red S 6 | 15 units, 15% off: S$570.00 − S$85.50 = S$484.50 |
| 7 | Shop filters stay in the URL | On `/products`, open Matchday Kits, tick size M, sort by price low to high, then press F5 | 3 products, cheapest first; after F5 the same filters are still shown |
| 8 | Over stock blocks checkout | As a guest, add Jersey Red M 3 twice (3 in stock), then open the cart | "Only 3 in stock" and Proceed to checkout is disabled until the quantity is lowered |
| 9 | Stock changes during checkout | Keep the Review step open, lower Navy S stock to 2 in the admin, then click Place order | "Only 2 qty left for Matchday Jersey (S)"; no order is created |
| 10 | Log out revokes the refresh token | Copy the `refreshToken` from `localStorage`, log out, then send it to `POST /api/auth/refresh` | 401 "Invalid refresh token" |
| 11 | My orders | Log in as Daniel Lim (demo data), open My Orders, search `1006`, then `zzz` | `1006` shows one order; `zzz` shows "No orders match" |
| 12 | Another customer's order | As Daniel Lim, open `/orders/1034` | "We couldn't find this order" (404, not 403) |
| 13 | Forged admin form is refused | In DevTools, change the hidden `_csrf` value of a Deactivate form to `abc`, then submit | 403 "This form has expired. Reload the page and try again." |
| 14 | Login rate limit | Enter a wrong admin password 5 times, then the correct one | "Too many failed logins. Please wait 15 minutes and try again." (429) |
| 15 | AI proposal outside the allowed range | Ask the admin assistant to set a threshold to 2000, then press Confirm | 400 "Threshold cannot be above 1000"; nothing is saved |
| 16 | Kit Advisor team kit | Log in; For my team: "U12 team of 16 players, S$800 budget. We need match jerseys and training bibs." | A reply and a kit card with a bulk discount and a total under S$800 |
| 17 | Kit Advisor add to cart | On the card from test 16, click Add all to cart | The cart shows the same products, sizes and total |
| 18 | Kit Advisor when N8N is down | Stop N8N, send any message | "The Kit Advisor is not available right now. Please try again in a minute." |
| 19 | Kit Advisor rate limit | Send 6 advisor messages within a minute | The 6th gets "You are sending messages too quickly. Please wait a minute and try again." |
| 20 | Chat is cleared for the next person | As customer A, chat; log out, log in as customer B and open the advisor | An empty chat greeting B; none of A's messages |
| 21 | Home page | Open `/`, click each category's Shop button, then Ask the Kit Advisor | Each opens its category; the Kit Advisor panel opens |

Unhandled exceptions and console errors count as failing tests, so the browser console was checked on every page.

---

## 7. Deployment & Local Setup

#### Prerequisites
* **Node.js** 
* **MariaDB** 
* **n8n** (optional — required only for the AI Kit Advisor and Admin Assistant)
* **Stripe CLI** (optional — required only for testing Stripe webhooks locally)

#### 1. Clone & Install Dependencies
```bash
git clone https://github.com/fiqmeister/kitgrid-ecommerce-shop.git
cd kitgrid-ecommerce-shop

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

#### 2. Configure Environment Variables
1. Copy `.env.example` to `.env` in the root folder and fill in your values:
   ```bash
   cp .env.example .env
   ```
   Example local configuration:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_db_password
   DB_NAME=kitgrid
   DB_PORT=3306

   PORT=3000
   CLIENT_URL=http://localhost:5173

   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   ADMIN_JWT_SECRET=your_admin_secret
   ADMIN_TOKEN_EXPIRES_IN=4h

   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   N8N_TOOLS_API_KEY=your_tools_api_key
   N8N_ADMIN_WEBHOOK_URL=http://localhost:5678/webhook/...
   N8N_ADMIN_WEBHOOK_KEY=your_admin_webhook_key
   N8N_ADVISOR_WEBHOOK_URL=http://localhost:5678/webhook/...
   N8N_ADVISOR_WEBHOOK_KEY=your_advisor_webhook_key
   ```
2. Create `client/.env` and point it to the Express server:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

#### 3. Set Up the Database

Run all commands below from the **project root directory**.

> **Note for Linux (Ubuntu/Debian) users:** If your MariaDB/MySQL `root` user uses `unix_socket` authentication, replace `mysql -u root -p` with `sudo mariadb` (or `sudo mysql`).

##### First-Time Setup (Required)
Creates the `kitgrid` database, sets up all tables, and loads the base products, variants, and test accounts (press **Enter** if your `root` user has no password):

```bash
mysql -u root -p -e "SOURCE src/db/schema.sql; SOURCE src/db/seed.sql;"
```

**Default Seed Accounts:**
* **Admin:** `admin@kitgrid.example`
* **Customer:** `cust.test@example.com`

##### Load Demo Data (Optional)
Adds 8 sample customers, 5 team profiles, and 37 orders (`#1001`–`#1037`) across all statuses with relative timestamps. Load this **once** on top of a fresh seed:

```bash
mysql -u root -p -e "SOURCE src/db/demo.sql;"
```
*(All demo customer accounts use the password `Password123`.)*

##### Reset the Database
To wipe all tables and return to a clean initial seed (for example, before running manual test cases or removing demo data):

```bash
mysql -u root -p -e "SOURCE src/db/reset.sql; SOURCE src/db/schema.sql; SOURCE src/db/seed.sql;"
```

#### 4. Start the Application
Run the backend and frontend in separate terminals:

* **Backend API & EJS Admin Dashboard (`http://localhost:3000`):**
  ```bash
  npm run dev      # Development mode with nodemon (src/server.js)
  # or: npm start  # Production mode
  ```
* **Frontend React App (`http://localhost:5173`):**
  ```bash
  cd client
  npm run dev
  ```
* **n8n AI Agents (optional):**
  Start your local n8n instance and ensure the Kit Advisor and Admin Assistant workflows are active and configured with the webhook URLs/keys in `.env`. If n8n is offline, the rest of the store continues working normally.

---

## 8. Credits

- **UX Research & UI Inspiration:** [Baymard Institute](https://baymard.com) (e-commerce UX research on product lists, product pages, cart, and checkout; ideas paraphrased with no text or images reused) and [Dribbble](https://dribbble.com) (UI layout and visual inspiration).
- **UI & Design System:** [Figma](https://figma.com), [Bootstrap 5.3](https://getbootstrap.com), [Bootstrap Icons](https://getbootstrap.com), and [Google Fonts (DM Sans)](https://google.com).
- **Backend Libraries:** Express, `mysql2`, `jsonwebtoken`, `bcrypt`, `yup`, `cookie-parser`, `cors`, `dotenv`, `ejs`, `express-rate-limit`, `morgan`, `nodemon`, and Stripe SDK.
- **Frontend Libraries:** React 19, Vite, `wouter`, `axios`, `jotai`, `formik`, `yup`.
- **AI & Workflows:** [n8n](https://n8n.io), Groq (`openai/gpt-oss-120b`), and Google Gemini (`gemini-3.5-flash`).


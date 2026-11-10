# KitGrid

> Online store for football coaches and team managers: matchday kits, training wear, training equipment and coach and staff apparel, with bulk pricing and an AI Kit Advisor. Open to individual players too.

**Deployed URL:** TODO (deployment is planned for later; during development everything runs locally)
**Admin dashboard:** `http://localhost:3000/admin` on the local server (the port comes from `PORT` in `.env`)
**Test admin login:** TODO (create a demo account; never commit real credentials)

---

## 1. Project Name & Summary

**KitGrid** is a private-label football teamwear and equipment shop: every product is sold under the KitGrid brand, with no third-party brand names or partner claims. It helps coaches and team managers of grassroots and amateur squads buy in bulk. Team buyers order many items at once (for example 18 jerseys across three sizes, 12 training bibs), reorder every season, and care about durability and quantity discounts. Individual players can shop the same store: the team profile is optional and checkout never requires it.

**Product categories:** Matchday Kits, Training Wear, Training Equipment, Coach & Staff Apparel.

**Business context:** Most sportswear shops are built for one shopper buying one shirt in one size. A coach kitting out a squad has to add every size separately, cannot see the bulk price until checkout (or has to email a teamwear supplier for a quote), and only finds out at the end that a size is out of stock. In Singapore this buyer is often a volunteer coach or team manager of a school team, academy or amateur league side, working to a fixed budget. KitGrid makes the team order the main path (all sizes on one grid, bulk prices shown upfront, stock checked before checkout), while individual players can still buy a single item like in any other shop.

**Goals**
- Let a coach go from a brief ("U12 team of 16, S$800 budget") to a stock-checked bundle in one chat.
- Give admins one place to manage orders, products, stock and users.
- Demonstrate a secure, layered full-stack architecture (API, DAL, service layer, JWT, CSRF, rate limiting).

---

## 2. UX/UI

### User stories

| # | As a... | I want to... | So that... | Acceptance criteria |
|---|---|---|---|---|
| 1 | Coach | filter products by colour, age group, size and price | I only see gear that suits my team | Filters combine; results update; out-of-stock sizes are marked |
| 2 | Coach | tell the Kit Advisor my squad size and budget | I get a ready bundle | Advisor suggests only in-stock items; "Add all to cart" works |
| 3 | Guest | add items to a cart without an account | I can browse before committing | Cart persists on refresh; merges into my account after login |
| 4 | Customer | see bulk discounts in my cart | I know the real price | Discount tier applied and shown per product line |
| 5 | Customer | view my past orders and reorder | I can rebuy last season's kit | History is searchable; reorder rebuilds the cart |
| 6 | Admin | change an order's status | customers see progress | Change is saved with who/when in the status history |
| 7 | Admin | see low-stock items | I can restock in time | List shows variants under the threshold |
| 8 | Individual player | buy a single item without a team profile | I can shop like any customer | Checkout completes with no team profile; bulk discounts apply only at their quantity thresholds |
| 9 | Coach | enter quantities for every size on one product page and add them in one click | I can order a full squad kit quickly | Grid lists all sizes with stock; blank sizes are ignored; one click adds every entered quantity; out-of-stock sizes are disabled |
| 10 | Coach | filter by age group (U6-U9, U10-U16, Senior) | I see gear that fits my players | Age filter combines with other filters; each size row shows its age group |
| 11 | Coach | filter for items with a minimum quantity in stock (for example 15+) | I don't pick gear I can't get for my whole squad | Products whose total in-stock quantity across all sizes is below the number entered are excluded |
| 12 | Shopper | select several values in one filter (for example Red and Black) | I can compare options together | Checked values apply together within a filter; results update without a full page reload |
| 13 | Coach | see bulk-price tiers on product cards | I know the discount before opening a product | Bulk-eligible cards show a "Bulk from S$X" hint |
| 14 | Customer | type quantities directly in the cart | I can change large volumes quickly | Quantity boxes accept typed numbers; invalid values (negative, above stock) show an inline message; 0 removes a size; totals and discounts update |
| 15 | Customer | see form errors only after I finish a field | I'm not interrupted while typing | Errors appear when I leave a field or submit, not on each keystroke |
| 16 | Customer | review my order grouped by product and size before paying | I can check it against my squad list | Final review groups lines by product with sizes and quantities; totals match the cart |
| 17 | Customer | check out without header and footer distractions | I stay focused on finishing | Checkout pages hide the main navigation, footer and Kit Advisor and keep a link back to the cart |
| 18 | Coach | see the discount tier for my total units of a product, and what the next tier needs | I know how many more to add | Tier is based on the product's units across all sizes; the cart shows a prompt such as "Add 3 more for 15% off" |
| 19 | Admin | ask an assistant for an order and delivery summary and the low-stock list, and change a low-stock threshold in plain language | I see what needs action without reading tables | Summary figures match the database; paid orders not yet shipped are listed with how long they have waited; a threshold change is only saved after I confirm it |

TODO: refine the acceptance criteria as you build, and add stories from your own testing.

### Wireframes / mockups

Designed in Figma: [KitGrid wireframes](https://www.figma.com/design/cq6XiwBgeNEqBSj6JBGxTi/kitgrid?node-id=0-1&t=alvIKCQRt4xwdID4-1). All customer frames are drawn: Home, Product list, Product detail, Cart, Checkout step 1 (Delivery), Checkout step 2 (Review & pay), Login/Register, Order confirmation, Order history and detail, Team profile, Kit Advisor panel (team and personal mode), States (loading, empty, error), Mobile (Home, Product detail, Cart) and the Design system sheet. All admin frames are drawn: Admin sign in, Orders list, Order detail (with status history and Mark as paid), Dashboard with the admin assistant panel, Products list, Product form (with football details and variants) and Users list.

### Five Planes of UI/UX

| Plane | Our decisions |
|---|---|
| **Strategy** | Users: coaches and team managers. Goal: fast, bulk-friendly team purchasing. |
| **Scope** | Must-have features listed under Features; nice-to-haves in Pending Features. Prices are in SGD. Private label only (KitGrid brand, no real third-party brands). Login is required at checkout; guests can fill a cart that merges on login. Four categories only. |
| **Structure** | Navigation flow: Home, Category list, Product, Cart, Checkout (Delivery, Review & pay, Stripe), Confirmation, Orders. TODO: add a flow diagram. |
| **Skeleton** | Multi-select filters on the left (price, colour, age group, size, minimum in stock). Product cards show a bulk-price hint. The product page has a bulk-tier strip, a colour selector, and a matrix quantity grid (one row per size with stock, enter every size, add in one click). The cart groups lines by product and size with typed quantities. Checkout is a 2-step, distraction-free flow (no main navigation, footer or Kit Advisor) and ends with a review grouped by product and size. The Kit Advisor button is on every page except checkout. Forms show errors after a field is left, not while typing. |
| **Surface** | Palette: dark navy `#0F172A`, slate `#64748B`, white `#FFFFFF`, with accent blue `#0284C7` for actions and highlights; green for stock and discounts, red for errors. Typeface: DM Sans (headings and body). Rounded cards (12 px), 8 px controls. Imagery: placeholder boxes in wireframes; product photos TODO. |

---

## 3. Features

### Major features

- Customer and admin roles with JWT (access + refresh tokens, blacklist)
- Customer log in and register on one page, with inline validation (the same Yup rules as the server) and Show/Hide password. A new account is logged in straight away. The header shows the customer's name, and Log out revokes the refresh token on the server
- Product catalog with football-specific columns (nullable per category), variants (size, colour, age group, SKU, stock)
- Multi-criteria product search (category, price, colour, age group, size, minimum in stock)
- Cart: guest, logged-in, merged on login
- Matrix quantity grid on product pages: pick a colour, then type a quantity for every size in one table (capped at the stock; out-of-stock sizes are disabled). The bulk tier reached is highlighted and the units, subtotal, discount and total update as you type. Adding every size to the cart in one click comes with the cart
- Bulk discount tiers per product: 10+ units = 10%, 15+ = 15%, 25+ = 20% (units counted across all sizes of that product)
- 2-step checkout (Delivery, Review & pay) with transactional stock deduction and Stripe Checkout in test mode
- Order lifecycle (pending payment, paid, processing, shipped, delivered, cancelled) with status history (audit trail) and order history search
- Flat delivery fee of S$8.00, free on orders of 15+ items; Singapore delivery addresses only
- EJS admin dashboard (orders, products, users) with its own admin login (JWT in an `httpOnly`, `sameSite: strict` cookie), CSRF protection on every admin form, and a login rate limit
- Login rate limits: 5 failed logins per 15 minutes per IP address on the admin login and the customer API login (successful logins are not counted)
- Optional team profile (never required at checkout)
- AI Kit Advisor (customer) and AI admin assistant, built with N8N; the advisor has a team mode (bundles with quantities) and a personal mode (single items); the admin assistant summarizes orders and the delivery backlog, flags low stock and proposes threshold changes that the admin confirms

### Algorithms and key logic

- **Bulk discount:** the tier is chosen from the total units of one product in the cart (all sizes and colours added together), then the percentage applies to that whole product line. Units of different products are never added together. The server calculates it; the price and discount are copied into `order_items` as a snapshot, so later price changes never alter past orders.
- **Delivery fee:** flat S$8.00, S$0.00 when the order has 15 or more items.
- **Stock deduction:** checkout runs in one database transaction. It creates the order, then for each item runs `UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`. If any item updates 0 rows (not enough stock), the whole transaction is rolled back, so no order is created and no stock changes. Otherwise it saves the `order_items` price snapshot, the first `order_status_history` row (`pending_payment`) and empties the cart, then commits. Cancelling an order puts the items back into stock in the same way (one transaction with the status change).
- **Cart merge:** after login, the React app sends the guest cart to `POST /api/cart/merge`. For each item the server adds the guest quantity to the quantity already saved for that account, capped at the variant's stock. An item is only saved when its quantity goes up, so out-of-stock items are skipped and saved quantities are never reduced. The final stock check happens at checkout.
- **Search:** the product list query starts with `WHERE products.is_active = 1`, and each filter that was sent adds one `AND ...` condition with a `?` placeholder (search text, category, price range, pitch surface, skill level, age group, colours, sizes, minimum in stock, tag). Filters on variants or tags use `products.id IN (SELECT product_id ...)`. Minimum in stock counts the total stock of all sizes of a product (`GROUP BY product_id HAVING SUM(stock) >= ?`). Sorting only uses fixed texts from a list (newest, price low to high, price high to low), never text typed by the user. Paging uses `LIMIT ? OFFSET ?` (12 products per page), and a second query counts the total for the page buttons. The colours, age groups and total stock on the product cards come from one extra query for all products on the page (`WHERE product_id IN (?)`), not one query per product. The "Bulk from" price on a card is the base price with the highest bulk tier applied.
- **Shop filters live in the URL:** in the React shop, every filter, the sort, the search words and the page number are kept in the address bar (for example `/products?categoryId=1&size=M,L&sort=price_asc`). Changing a filter copies the current URL with `URLSearchParams`, changes one value, removes `page` (so the customer starts again at page 1) and moves to the new URL. The product list fetches again whenever the URL changes. So a filtered list can be bookmarked or shared, the browser Back button undoes the last filter, and a refresh keeps the filters. A header category link or a new search starts from an empty URL. Removing a chip in "Active filters" removes only that one value.
- **Live total on the product page:** the quantities typed are kept in one object keyed by variant id (one colour + one size), so switching colour keeps what was typed. The page adds up the units of every size and colour, picks the highest tier reached, then works out subtotal = price × units, discount = subtotal × percent, total = subtotal − discount, rounding to cents at each step. These are the same steps and the same rounding as the server's cart (`priceCart` in `src/services/cartService.js`), so the total on the product page matches the cart. The tier boxes show "10% off" rather than a per-unit price, because a rounded per-unit price times the units can differ from the real total by a few cents (S$9.50 × 85% = S$8.08 a unit, but 15 units cost S$121.12, not S$121.20).
- **Admin CSRF token:** at admin login, a random value (`crypto.randomBytes(32)`) is stored inside the signed admin JWT. Every admin form sends it back in a hidden `_csrf` field, and a middleware compares the two before any other check; a missing or wrong value is refused with 403.

### AI features

- **Kit Advisor (grounded + structured):** TODO (describe the N8N tools it calls, the JSON bundle it returns in team mode, and the single-item answer in personal mode)
- **Admin assistant (grounded + structured):** a panel on the EJS admin dashboard, for logged-in admins only. The admin clicks a quick button ("This week's orders", "Show low stock", "Orders waiting to ship") or types a question (up to 300 characters). Express sends the question to an N8N webhook (protected by a secret header) and waits up to 90 seconds. The N8N agent answers only from four read-only `/api/tools` endpoints (API key):
  - `GET /api/tools/stock/low`: variants whose `stock` is at or below their `low_stock_threshold`, with units sold in the last 30 days
  - `GET /api/tools/orders/summary`: counts by status, paid revenue and unpaid orders older than 24 hours, for a date range
  - `GET /api/tools/orders/to-ship`: paid or processing orders not yet shipped, with items and addresses grouped by postal district (a pick list for delivery)
  - `GET /api/tools/variants`: finds a variant by name, colour, size or SKU (used for threshold changes)

  The agent returns JSON (`reply`, `cards`, `attention`, `lowStock`, `proposals`) that the page shows as a short reply, summary cards, a "Needs attention" list and a low-stock table. To change a threshold, the admin asks in plain language; the agent returns a proposal (variant, current and new value), the page shows it with a Confirm button, and only Confirm posts to an admin route (admin cookie and CSRF token) that checks the value is a whole number from 0 to 1000 and saves it. The agent has no write access, and the server re-checks every value: in testing the AI once proposed 2000 and the server refused it. If N8N is down, slow or returns an empty answer, the page shows "The assistant is not available right now" instead of an error. Model: Groq (`openai/gpt-oss-120b`), with Google Gemini as the fallback model in N8N.

### Known limitations / bugs

- Guest checkout is not supported: guests can fill a cart, but must log in or register to check out.
- Singapore delivery addresses only, with one flat delivery fee.
- Payments use Stripe test mode only.
- Login rate-limit counts are kept in the server's memory: they reset when the server restarts and would not be shared between several servers. Register is not rate limited.
- Admin log out only deletes the cookie. The admin JWT itself stays valid until it expires, so a stolen cookie would keep working until then.
- The admin assistant uses free LLM tiers, so an answer can take 10 to 60 seconds, and it can be unavailable when the provider is busy or rate limited.
- An admin form refused by the CSRF check or the threshold rule shows a plain JSON error page instead of the dashboard.
- The React shop keeps the customer's access and refresh tokens in `localStorage`. Any JavaScript on the page can read `localStorage`, so a cross-site scripting (XSS) bug could leak the tokens. This was accepted to keep the project simple. React escapes text it displays, and the access token is short-lived. An `httpOnly` cookie (as the admin side uses) would be safer.
- If a customer changes two filters very quickly, a slow first answer can arrive after the second and briefly show the older results. Changing any filter again fixes it.
- Product cards and product pages show a grey placeholder box instead of product photos.
- On a product page, sizes are listed in the order they were added to the database, not smallest to biggest (for example S, M, L, then the kids' sizes).
- TODO (add more honestly as you find them)

### Pending features

Nice-to-have if time allows:
- Custom printing (player names and numbers)
- Structured generation: supplier notes to product form
- Reorder from a past order
- Wishlist, PDF invoice, image upload

Out of scope for now (deliberately dropped to keep the project feasible):
- Preset kit bundles with fixed prices (the home page banner explains that different items can be bought together as a "kit", with discounts applied per item)
- Kit budget estimator
- Pay by invoice with a PO number, express delivery, separate delivery and billing addresses, estimated delivery dates
- Guest checkout, grid and list view toggle, save for later, kit availability end date
- Future work: export quote or share-cart link, address auto-suggest, per-category spec fields, mobile accordion layout

---

## 4. Use Cases

*(Optional alternative to the user stories and features above; keep or delete.)*

| Use case | Objective | Steps |
|---|---|---|
| Place a team order | Buy kit in bulk | 1. Browse and filter. 2. Enter quantities per size and add to cart. 3. Review bulk discount in the cart. 4. Log in and enter delivery details. 5. Review and pay via Stripe. |
| Ask the Kit Advisor | Get a stock-checked bundle | 1. Open the advisor. 2. Describe the team and budget. 3. Review the bundle. 4. Add all to cart. |
| Update an order | Move an order along | 1. Log in to admin. 2. Open the order. 3. Change status. 4. Check the status history. |

---

## 5. Technologies Used

| Area | Technology |
|---|---|
| Frontend | React 19 with Vite (in `/client`), wouter (pages and links), axios (API calls; interceptors add the access token and refresh it once on a 401), Bootstrap 5.3 (grid and form styles) with KitGrid colours as CSS variables, Jotai (the logged-in customer shared by the header and the forms, through a user store hook that also saves it in `localStorage`), Formik with Yup (forms with inline validation), JavaScript |
| Backend | Node.js, Express |
| Admin UI | EJS (server-rendered) |
| Database | MariaDB via `mysql2` (connection pool, raw SQL written in the DAL only) |
| Security | JWT (`jsonwebtoken`), CSRF token kept in the admin JWT (own middleware, Node `crypto`), `express-rate-limit`, `cors` (restricted to `CLIENT_URL`), bcrypt, Yup validation on every input |
| Payments | Stripe Checkout (test mode, hosted page; webhooks forwarded to the laptop with the Stripe CLI) |
| AI | N8N agents (run locally with `npx n8n`); LLM: Groq (`openai/gpt-oss-120b`), with Google Gemini (`gemini-flash-lite-latest`) as the fallback |
| Testing | TODO (for example Jest, Supertest) |
| Hosting | TODO (deployment planned for later). During development, MariaDB, the Express API, the React app and N8N run locally |

**Repo:** https://github.com/fiqmeister/kitgrid-ecommerce-shop

### Architecture

```
React SPA  --JWT-->  Express API  -->  Controllers -> Services -> DAL -> MariaDB
EJS admin  --admin JWT cookie + CSRF token-->  Express /admin
Express    --webhook secret header-->  N8N agent
N8N agent  --API key-->  Express /api/tools (read-only)
```

### Data model (summary)

users (1:1 optional team_profiles), categories (id, name), products (1:M product_variants with size, colour, age group, SKU, stock and `low_stock_threshold`), tags (M:N through product_tags), cart_items, orders (1:M order_items, 1:M order_status_history), bulk_discount_rules (minimum quantity, discount percent), refresh_tokens (token hash, expiry, `is_revoked`).

- **Football-specific columns on `products`:** `pitch_surface` (FG, AG, indoor, all), `skill_level` (youth, amateur, pro), `material`, `weight_grams`, `durability_rating` (1 to 5). All are nullable because they only apply to some categories. `is_bulk_eligible` decides whether bulk tiers apply.
- **Price snapshot on `order_items`:** `unit_price` (copied from `products.base_price`), `discount_percent` (copied from `bulk_discount_rules`) and `line_total`, plus `product_name`, `size`, `colour` and a `variant_id` reference. Prices are `DECIMAL(10,2)` and percentages `DECIMAL(5,2)`.
- **Delivery address on `orders`:** `recipient_name`, `phone`, `address_line1`, `address_line2` (optional), `postal_code`, with `stripe_session_id` for the payment. Order statuses (also used in `order_status_history`): `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`.
- **Low stock:** `product_variants.low_stock_threshold` (whole number, default 10). A variant is low stock when `stock` is at or below it.
- **Passwords:** only a bcrypt hash is stored (`users.password_hash`).

### Database setup

```
src/db/
├── database.js     mysql2 connection pool, reads the DB_ settings from .env
├── reset.sql       drops every table (use it only to rebuild from scratch)
├── schema.sql      creates the database (utf8mb4) and every table
├── seed.sql        starting data: categories, bulk discount rules, an admin and a test customer, a team profile, sample products with variants, tags
├── demo.sql        demo data: extra customers and orders #1001 to #1037 in every status, so the admin pages and the assistant have something to show
└── migrations/     numbered .sql files for later structure changes (01_..., 02_...)
```

Run order: `reset.sql` (only for a clean rebuild), then `schema.sql`, then `seed.sql`, then `demo.sql` (optional), then any files in `migrations/` in number order. All SQL lives in the DAL and uses `?` placeholders.

---

## 6. Testing

### Automated tests

- How to run: TODO (for example `npm test`)
- Coverage report: TODO (add a screenshot or link)

### Manual test cases

| # | Test | Steps | Expected result | Pass? |
|---|---|---|---|---|
| 1 | Register and log in | On `/login`, fill in "Create an account" with a new email and the password `password1`. Then log out and log in again with the same details on the left card | Register 201, then login 200. The header shows "Hi, (name)" straight away. Logging in again works. Wrong password: "Invalid email or password" and no refresh request | |
| 2 | Guest cart merges after login | TODO | TODO | |
| 3 | Order reduces stock | TODO | TODO | |
| 4 | Customer cannot open `/admin` | TODO | TODO | |
| 5 | Order without a team profile | TODO | Checkout completes and the order is created | |
| 6 | Bulk tier uses total units across sizes | Add 4 + 8 + 6 of one jersey in three sizes | 18 units get 15% off | |
| 7 | Free delivery at 15+ items | Check out with 15 items, then with 14 | S$0.00, then S$8.00 | |
| 8 | Low-stock flag and threshold change | Set a variant's stock at or below its threshold, then ask the admin assistant to change the threshold | The variant appears in the low-stock list; the new threshold is saved only after Confirm | |
| 9 | AI proposal outside the allowed range | Ask the assistant to set a threshold to 2000, then press Confirm | 400 "Threshold cannot be above 1000"; nothing is saved | |
| 10 | Forged admin form is refused | In DevTools, change the hidden `_csrf` value of a Deactivate form to `abc`, then submit | 403 "This form has expired. Reload the page and try again."; the product stays active | |
| 11 | Login rate limit | Enter a wrong admin password 5 times, then try a 6th time with the correct password | The 6th try shows "Too many failed logins. Please wait 15 minutes and try again." (status 429) | |
| 12 | Shop filters combine and stay in the URL | On `/products`, open Matchday Kits, tick size M, sort by price low to high, then press F5 | 3 products, cheapest first; after F5 the same filters, chips and sort are still shown | |
| 13 | Search starts a new list | Open Matchday Kits, then search `tee` in the header | The category is dropped; the title reads Results for "tee" with a `"tee" ×` chip; removing the chip empties the search box | |
| 14 | Expired access token is refreshed once | In DevTools, replace `accessToken` in `localStorage` with an invalid value (keep a valid `refreshToken`), then make a request that needs login | Network tab: 401, then `POST /api/auth/refresh` 200, then the same request 200 | |
| 15 | Log out revokes the refresh token | Log in, copy the `refreshToken` from `localStorage`, click Log out, then send that token to `POST /api/auth/refresh` | Log out: 204, the header shows "Log in / Register", and `localStorage` is empty. The refresh call: 401 "Invalid refresh token" | |
| 16 | Inline validation before sending | On `/login`, click Create account with empty boxes, then type the password `abcdefgh` | "Name is required", "Email is required", "Password is required", then "Password must include a number". No request is sent | |
| 17 | Product page tier counts all sizes and colours | On the Matchday Jersey page, type Navy S 4 and Navy L 5, then switch to Red and type Red S 6 | 15 units; the "15–24 units / 15% off" box is highlighted; S$570.00 − S$85.50 = S$484.50 | |
| 18 | Product page total uses the cart's rounding | On the Training Bib page (S$9.50), type 15 | S$142.50 − S$21.38 = S$121.12 (the same total the cart shows for 15 bibs) | |
| 19 | Quantity is capped at stock | On the Matchday Jersey page, choose Red and type 10 for size M (3 in stock) | The box changes to 3; Red Youth XS (out of stock) is greyed out and cannot be typed in | |
| 20 | Unknown product | Open `/products/999` and `/products/abc` | "Sorry, we could not find this product." with a Back to all products button | |

Note: unhandled exceptions and console errors count as failing tests, so check the browser console on every page.

---

## 7. Deployment

- **Hosting platform:** TODO (deployment is planned for later; the submission checklist asks for a deployed URL)
- **Database hosting:** TODO (local MariaDB during development)
- **N8N hosting:** TODO (local N8N during development). N8N must be running for the Kit Advisor and the admin assistant, or each shows its "unavailable" state.
- **Environment variables:** list the names only, never the values

```
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
CLIENT_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
ADMIN_JWT_SECRET=
ADMIN_TOKEN_EXPIRES_IN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
N8N_TOOLS_API_KEY=
N8N_ADMIN_WEBHOOK_URL=
N8N_ADMIN_WEBHOOK_KEY=
N8N_ADVISOR_WEBHOOK_URL=
```

The React app has its own `client/.env` (copy `client/.env.example`) with a single value, `VITE_API_URL` (the API address, for example `http://localhost:3000/api`). Vite puts every `VITE_` value into the JavaScript sent to the browser, so no secret ever goes in this file.

`N8N_TOOLS_API_KEY` is the key N8N sends to `/api/tools`; `N8N_ADMIN_WEBHOOK_KEY` is the secret header Express sends to the N8N admin webhook. The Stripe and Kit Advisor values are used once those features are built.

- **Local setup:** TODO (clone, `npm install` in the project root for the API and again in `/client`, create `.env` from `.env.example`, run `schema.sql` then `seed.sql`, start the API and the client, start N8N, and run the Stripe CLI to forward webhooks)
- **Deployment steps:** TODO (deploy later). Also TODO: a pre-demo checklist (MariaDB, API, client, N8N and the Stripe CLI all running).

---

## 8. Credits

- Baymard Institute (https://baymard.com): e-commerce UX research articles on product lists and filters, product pages, cart and checkout. Ideas are paraphrased; no text or images are reused.
- TODO: tutorials followed (title and link)
- TODO: libraries and packages
- TODO: images and assets (source and licence)
- TODO: design inspiration (for example kit-shop and sports retail sites you studied)

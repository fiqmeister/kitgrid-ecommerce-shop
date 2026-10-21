# KitGrid

> Online store for football coaches and team managers: matchday kits, training wear, training equipment and coach and staff apparel, with bulk pricing and an AI Kit Advisor. Open to individual players too.

**Deployed URL:** TODO (deployment is planned for later; during development everything runs locally)
**Admin dashboard:** `/admin` on the local server (TODO: add the local URL and port)
**Test admin login:** TODO (create a demo account; never commit real credentials)

---

## 1. Project Name & Summary

**KitGrid** is a private-label football teamwear and equipment shop: every product is sold under the KitGrid brand, with no third-party brand names or partner claims. It helps coaches and team managers of grassroots and amateur squads buy in bulk. Team buyers order many items at once (for example 18 jerseys across three sizes, 12 training bibs), reorder every season, and care about durability and quantity discounts. Individual players can shop the same store: the team profile is optional and checkout never requires it.

**Product categories:** Matchday Kits, Training Wear, Training Equipment, Coach & Staff Apparel.

**Business context:** TODO (1 to 2 sentences on who the shop serves and why existing shops fall short for team buyers)

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

Designed in Figma (link: TODO). All customer frames are drawn: Home, Product list, Product detail, Cart, Checkout step 1 (Delivery), Checkout step 2 (Review & pay), Login/Register, Order confirmation, Order history and detail, Team profile, Kit Advisor panel (team and personal mode), States (loading, empty, error), Mobile (Home, Product detail, Cart) and the Design system sheet. All admin frames are drawn: Admin sign in, Orders list, Order detail (with status history and Mark as paid), Dashboard with the admin assistant panel, Products list, Product form (with football details and variants) and Users list.

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
- Product catalog with football-specific columns (nullable per category), variants (size, colour, age group, SKU, stock)
- Multi-criteria product search (category, price, colour, age group, size, minimum in stock)
- Cart: guest, logged-in, merged on login
- Matrix quantity grid on product pages (enter every size, add in one click)
- Bulk discount tiers per product: 10+ units = 10%, 15+ = 15%, 25+ = 20% (units counted across all sizes of that product)
- 2-step checkout (Delivery, Review & pay) with transactional stock deduction and Stripe Checkout in test mode
- Order lifecycle (pending payment, paid, processing, shipped, delivered, cancelled) with status history (audit trail) and order history search
- Flat delivery fee of S$8.00, free on orders of 15+ items; Singapore delivery addresses only
- EJS admin dashboard (orders, products, users) with sessions and CSRF protection
- Optional team profile (never required at checkout)
- AI Kit Advisor (customer) and AI admin assistant, built with N8N; the advisor has a team mode (bundles with quantities) and a personal mode (single items); the admin assistant summarizes orders and the delivery backlog, flags low stock and proposes threshold changes that the admin confirms

### Algorithms and key logic

- **Bulk discount:** the tier is chosen from the total units of one product in the cart (all sizes and colours added together), then the percentage applies to that whole product line. Units of different products are never added together. The server calculates it; the price and discount are copied into `order_items` as a snapshot, so later price changes never alter past orders.
- **Delivery fee:** flat S$8.00, S$0.00 when the order has 15 or more items.
- **Stock deduction:** TODO (describe the DB transaction)
- **Cart merge:** TODO (describe how guest and saved carts combine)
- **Search:** TODO (describe how filters build the SQL query, parameterized)

### AI features

- **Kit Advisor (grounded + structured):** TODO (describe the N8N tools it calls, the JSON bundle it returns in team mode, and the single-item answer in personal mode)
- **Admin assistant (grounded + structured):** a panel on the EJS admin dashboard, visible to admin sessions only. The admin clicks a quick button ("This week's orders", "Show low stock") or types a question. An N8N agent calls two read-only `/tools/admin` endpoints (API key): `orders-summary` (counts by status, revenue and the delivery backlog, meaning `paid` or `processing` orders not yet `shipped` and how long they have waited, for a date range and optional status) and `low-stock` (variants whose `stock` is at or below their `low_stock_threshold`). The agent returns JSON (`summary`, `low_stock`, `needs_attention`) that the page shows as a short summary plus tables, using figures from the database only. To change a threshold, the admin asks in plain language; the agent returns a proposed change (product and new value), the page shows it with a Confirm button, and only Confirm posts to an admin route (session and CSRF) that validates the value (a whole number in a fixed range, for example 0 to 500) and saves it. The agent has no write access.

### Known limitations / bugs

- Guest checkout is not supported: guests can fill a cart, but must log in or register to check out.
- Singapore delivery addresses only, with one flat delivery fee.
- Payments use Stripe test mode only.
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
| Frontend | React, Jotai, Formik, Yup, JavaScript |
| Backend | Node.js, Express |
| Admin UI | EJS (server-rendered) |
| Database | MariaDB via `mysql2` (connection pool, raw SQL written in the DAL only) |
| Security | JWT, `csrf-csrf`, `express-rate-limit`, `cors` (restricted to `CLIENT_URL`), bcrypt |
| Payments | Stripe Checkout (test mode, hosted page; webhooks forwarded to the laptop with the Stripe CLI) |
| AI | N8N agents, LLM provider TODO |
| Testing | TODO (for example Jest, Supertest) |
| Hosting | TODO (deployment planned for later). During development, MariaDB, the Express API, the React app and N8N run locally |

**Repo:** TODO (GitHub link)

### Architecture

```
React SPA  --JWT-->  Express API  -->  Controllers -> Services -> DAL -> MariaDB
EJS admin  --session + CSRF-->  Express
N8N agent  --API key-->  /tools endpoints
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
└── migrations/     numbered .sql files for later structure changes (01_..., 02_...)
```

Run order: `reset.sql` (only for a clean rebuild), then `schema.sql`, then `seed.sql`, then any files in `migrations/` in number order. All SQL lives in the DAL and uses `?` placeholders.

---

## 6. Testing

### Automated tests

- How to run: TODO (for example `npm test`)
- Coverage report: TODO (add a screenshot or link)

### Manual test cases

| # | Test | Steps | Expected result | Pass? |
|---|---|---|---|---|
| 1 | Register and log in | TODO | TODO | |
| 2 | Guest cart merges after login | TODO | TODO | |
| 3 | Order reduces stock | TODO | TODO | |
| 4 | Customer cannot open `/admin` | TODO | TODO | |
| 5 | Order without a team profile | TODO | Checkout completes and the order is created | |
| 6 | Bulk tier uses total units across sizes | Add 4 + 8 + 6 of one jersey in three sizes | 18 units get 15% off | |
| 7 | Free delivery at 15+ items | Check out with 15 items, then with 14 | S$0.00, then S$8.00 | |
| 8 | Low-stock flag and threshold change | Set a variant's stock at or below its threshold, then ask the admin assistant to change the threshold | The variant appears in the low-stock list; the new threshold is saved only after Confirm | |

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
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
SESSION_SECRET=
CSRF_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
N8N_WEBHOOK_URL=
N8N_TOOLS_API_KEY=
CLIENT_URL=
```

- **Local setup:** TODO (clone, `npm install` in the project root for the API and again in `/client`, create `.env` from `.env.example`, run `schema.sql` then `seed.sql`, start the API and the client, start N8N, and run the Stripe CLI to forward webhooks)
- **Deployment steps:** TODO (deploy later). Also TODO: a pre-demo checklist (MariaDB, API, client, N8N and the Stripe CLI all running).

---

## 8. Credits

- Baymard Institute (https://baymard.com): e-commerce UX research articles on product lists and filters, product pages, cart and checkout. Ideas are paraphrased; no text or images are reused.
- TODO: tutorials followed (title and link)
- TODO: libraries and packages
- TODO: images and assets (source and licence)
- TODO: design inspiration (for example kit-shop and sports retail sites you studied)

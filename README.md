# KitGrid

> Online store for football coaches and team managers: training equipment, team kits, goalkeeper gear and recovery supplies, with bulk pricing and an AI Kit Advisor. Open to individual players too.

**Deployed URL:** TODO (add once deployed)
**Admin dashboard:** TODO (`/admin` on the deployed URL)
**Test admin login:** TODO (create a demo account; never commit real credentials)

---

## 1. Project Name & Summary

**KitGrid** is a private-label football teamwear and equipment shop: every product is sold under the KitGrid brand, with no third-party brand names or partner claims. It helps coaches and team managers of grassroots and amateur squads buy equipment in bulk. Team buyers order many items at once (for example 16 bibs, 8 balls, a full kit by size), reorder every season, and care about durability and quantity discounts. Individual players can shop the same store: the team profile is optional and checkout never requires it.

**Business context:** TODO (1 to 2 sentences on who the shop serves and why existing shops fall short for team buyers)

**Goals**
- Let a coach go from a brief ("U12 team of 16, artificial grass, $800 budget") to a stock-checked bundle in one chat.
- Give admins one place to manage orders, products, stock and users.
- Demonstrate a secure, layered full-stack architecture (API, DAL, service layer, JWT, CSRF, rate limiting).

---

## 2. UX/UI

### User stories

| # | As a... | I want to... | So that... | Acceptance criteria |
|---|---|---|---|---|
| 1 | Coach | filter products by surface, level and price | I only see gear that suits my team | Filters combine; results update; out-of-stock sizes are marked |
| 2 | Coach | tell the Kit Advisor my squad size and budget | I get a ready bundle | Advisor suggests only in-stock items; "Add all to cart" works |
| 3 | Guest | add items to a cart without an account | I can browse before committing | Cart persists on refresh; merges into my account after login |
| 4 | Customer | see bulk discounts in my cart | I know the real price | Discount tier applied and shown per line |
| 5 | Customer | view my past orders and reorder | I can rebuy last season's kit | History is searchable; reorder rebuilds the cart |
| 6 | Admin | change an order's status | customers see progress | Change is saved with who/when in the status history |
| 7 | Admin | see low-stock items | I can restock in time | List shows variants under the threshold |
| 8 | Individual player | buy a single item without a team profile | I can shop like any customer | Checkout completes with no team profile; bulk discounts apply only at their quantity thresholds |
| 9 | Coach | enter quantities for every size on one product page and add them in one click | I can order a full squad kit quickly | Grid lists all sizes with stock; blank sizes are ignored; one click adds every entered quantity; out-of-stock sizes are disabled |
| 10 | Coach | filter by age group (U6-U9, U10-U16, Senior) | I see gear that fits my players | Age filter combines with other filters; each product shows its age group |
| 11 | Coach | filter for items with a minimum quantity in stock (for example 15+) | I don't pick gear I can't get for my whole squad | Products whose total in-stock quantity is below the number entered are excluded |
| 12 | Shopper | select several values in one filter (for example Red and Black) | I can compare options together | Checked values apply together within a filter; results update without a full page reload |
| 13 | Coach | see bulk-price tiers on product cards | I know the discount before opening a product | Bulk-eligible cards show a "bulk pricing from S$X" hint |
| 14 | Customer | type quantities directly in the cart | I can change large volumes quickly | Quantity boxes accept typed numbers; invalid values (0, negative, above stock) show an inline message; totals and discounts update |
| 15 | Customer | see form errors only after I finish a field | I'm not interrupted while typing | Errors appear when I leave a field or submit, not on each keystroke |
| 16 | Customer | review my order grouped by product and size before paying | I can check it against my squad list | Final review groups lines by product with sizes and quantities; totals match the cart |
| 17 | Customer | check out without header and footer distractions | I stay focused on finishing | Checkout pages hide the main navigation and footer and keep a link back to the cart |

TODO: refine the acceptance criteria as you build, and add stories from your own testing.

### Wireframes / mockups

TODO: link or embed your sketches (Figma link, or images in `/docs/wireframes`).

### Five Planes of UI/UX

| Plane | Our decisions |
|---|---|
| **Strategy** | Users: coaches and team managers. Goal: fast, bulk-friendly team purchasing. |
| **Scope** | Must-have features listed under Features; nice-to-haves in Pending Features. Prices are in SGD. Private label only (KitGrid brand, no real third-party brands). Login is required at checkout; guests can fill a cart that merges on login. |
| **Structure** | Navigation flow: Home, Products, Product, Cart, Checkout, Orders. TODO: add a flow diagram. |
| **Skeleton** | Multi-select filters on the left (category, price, colour, size, surface, age group, minimum stock, tags). Product cards show a bulk-price hint. The product page has size button chips and a matrix quantity grid (enter every size, add in one click). The cart uses typed quantities. Checkout is distraction-free (no header or footer) and ends with a review grouped by product and size. The Kit Advisor panel is on every page. Forms show errors after a field is left, not while typing. |
| **Surface** | Colour palette, typography, spacing, imagery. TODO: fill in once chosen. |

---

## 3. Features

### Major features

- Customer and admin roles with JWT (access + refresh tokens, blacklist)
- Product catalog with football-specific columns, variants and stock
- Multi-criteria product search (category, price, surface, level, size in stock, tags)
- Cart: guest, logged-in, merged on login
- Matrix quantity grid on product pages (enter every size, add in one click)
- Checkout with transactional stock deduction
- Order lifecycle with status history (audit trail) and order history search
- EJS admin dashboard (orders, products, users) with sessions and CSRF protection
- Optional team profile (never required at checkout) and bulk discount tiers
- AI Kit Advisor (customer) and AI admin assistant, built with N8N; the advisor has a team mode (bundles with quantities) and a personal mode (single items)
- Stripe Checkout in test mode

### Algorithms and key logic

- **Bulk discount:** TODO (describe the tier rules, for example 10+ units = 10% off)
- **Stock deduction:** TODO (describe the DB transaction)
- **Cart merge:** TODO (describe how guest and saved carts combine)
- **Search:** TODO (describe how filters build the SQL query, parameterized)

### AI features

- **Kit Advisor (grounded + structured):** TODO (describe the N8N tools it calls, the JSON bundle it returns in team mode, and the single-item answer in personal mode)
- **Admin assistant:** TODO (describe what it summarizes)

### Known limitations / bugs

- Guest checkout is not supported: guests can fill a cart, but must log in or register to check out.
- TODO (add more honestly as you find them)

### Pending features

- Structured generation: supplier notes to product form
- Reorder from a past order
- Wishlist, PDF invoice, image upload
- Grid and list view toggle, colour swatches, save for later
- Estimated delivery dates, pay by invoice with a PO number, separate shipping and billing addresses
- Kit availability end date
- Future work: export quote or share-cart link, address auto-suggest, per-category spec fields, mobile accordion layout

---

## 4. Use Cases

*(Optional alternative to the user stories and features above; keep or delete.)*

| Use case | Objective | Steps |
|---|---|---|
| Place a team order | Buy kit in bulk | 1. Browse and filter. 2. Add items. 3. Review bulk discount. 4. Checkout. 5. Pay via Stripe. |
| Ask the Kit Advisor | Get a stock-checked bundle | 1. Open the advisor. 2. Describe the team and budget. 3. Review the bundle. 4. Add all to cart. |
| Update an order | Move an order along | 1. Log in to admin. 2. Open the order. 3. Change status. 4. Check the status history. |

---

## 5. Technologies Used

| Area | Technology |
|---|---|
| Frontend | React, Jotai, Formik, Yup, JavaScript |
| Backend | Node.js, Express |
| Admin UI | EJS (server-rendered) |
| Database | MariaDB via `mysql2` (connection pool) |
| Security | JWT, `csrf-csrf`, `express-rate-limit`, `cors` (restricted to `CLIENT_URL`), bcrypt |
| Payments | Stripe Checkout (test mode) |
| AI | N8N agents, LLM provider TODO |
| Testing | TODO (for example Jest, Supertest) |
| Hosting | TODO |

**Repo:** TODO (GitHub link)

### Architecture

```
React SPA  --JWT-->  Express API  -->  Controllers -> Services -> DAL -> MariaDB
EJS admin  --session + CSRF-->  Express
N8N agent  --API key-->  /tools endpoints
```

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

Note: unhandled exceptions and console errors count as failing tests, so check the browser console on every page.

---

## 7. Deployment

- **Hosting platform:** TODO
- **Database hosting:** TODO
- **N8N hosting:** TODO
- **Environment variables:** list the names only, never the values

```
DB_HOST=
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

- **Local setup:** TODO (clone, `npm install` in `/client` and `/server`, create `.env`, run migrations, run seed, start both)
- **Deployment steps:** TODO

---

## 8. Credits

- Baymard Institute (https://baymard.com): e-commerce UX research articles on product lists and filters, product pages, cart and checkout. Ideas are paraphrased; no text or images are reused.
- TODO: tutorials followed (title and link)
- TODO: libraries and packages
- TODO: images and assets (source and licence)
- TODO: design inspiration (for example booking or kit-shop sites you studied)

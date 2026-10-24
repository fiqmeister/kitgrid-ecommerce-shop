# ROCKET CAPSTONE

## Full-Stack E-Commerce Application

**Stack:** Node.js (Express) · React · MySQL/MariaDB · Stripe  
**Duration:** 3 weeks

## 1.0 Preamble

You will build a domain-specific e-commerce platform consisting of:

- A **React** single-page application for customers.  
- An **Express** backend that serves both a RESTful API and a server-rendered admin dashboard (Handlebars/EJS).  
- **MySQL/MariaDB** for data persistence.  
- **AI-enabled features**  
  - Grounded generation  
  - Structured generation  
  - Agents with N8N  
- **(Optional) Stripe** for payment processing.

## 2.0 Intended Learning Outcomes

By the end of this project you will be able to:

- Architect a backend framework incorporating ORM, migrations, validation, sessions, authentication, routing, and security.  
- Apply software engineering patterns: refactoring, service layers, and data access layers (DAL).  
- Integrate a third-party payment gateway (Stripe) while keeping sensitive data secure.  
- Build a React SPA that consumes RESTful endpoints via HTTP.  
- Implement AI-powered features that adds measurable user value (e.g., natural language search, RAG, recommendations, tools).

## 3.0 Core Requirements

Your submission **must** include:

| \# | Requirement |
| :---- | :---- |
| 1 | **RESTful API** (Express) with validation, JWT authentication/authorization, and database access. |
| 2 | **Role-Based Access:** Features and routes restricted to authorized users (customers vs. admin/vendors). |
| 3 | **React SPA:** Customer-facing frontend consuming dedicated API endpoints. |
| 4 | **AI Integration:** leveraging an LLM or AI service (e.g., RAG product search, structured recommendations, NLP query interface). |
| 5 | **Admin Dashboard:** Order and product management built with **Express \+ Handlebars/EJS** (not React). |
| 6 | **Domain-Specific Store:** Sell a specific product type (e.g., handmade cookies, custom PC builds, vintage watches). The product table must include columns specific to that domain (e.g., flavor, shelf life, ingredients, calories). |

## 4.0 Value-Add Features

Research and implement **at least one** of the following to differentiate your project:

- AI-powered search or recommendations  
- Advanced data modelling and analytics dashboard  
- Cryptocurrency / NFT integration  
- Customer tracking and behavioral analytics  
- Image upload and cloud storage (e.g., Uploadcare, Cloudinary, AWS S3)  
- Real-time chat (customer support)

## 5.0 Mandatory Features

- **Product Search:** Multi-criteria filtering (e.g., category, price range, domain-specific attributes).  
- **Order Management (Admin):** Full order lifecycle viewed and managed through the Express \+ HBS/EJS backend. You can set an item as paid from the backend if not implementing Stripe  
- **Consider adding:** Wishlist, stock management, promotions/discount codes, membership tiers, support tickets, invoicing/PDF generation, image uploads.

### 5.1 Important Note on Tutorials

If you follow a complete YouTube or Udemy project walkthrough, you may struggle to get help from TAs because e-commerce architectures vary widely. It is better to learn techniques from tutorials and then **rebuild them independently** in your own project, incorporating additional features yourself.

## 6.0 Grading Rubric (0 – 100\)

### Category 1: Backend Architecture — 20 points

| Criterion | Points | Description |
| :---- | :---- | :---- |
| Routing & Middleware | 5 | Modular router system, organized folder structure, custom middleware with clear purpose. |
| Security & Authentication | 8 | JWT with access \+ refresh tokens and blacklist invalidation; CSRF protection; rate limiting; session security. |
| Form Handling & Validation | 4 | Server-side validation with custom rules and consistent error handling. |
| Layered Architecture | 3 | Clear service layer and DAL; evidence of refactoring and separation of concerns. |

### Category 2: Data & Product Management — 20 points

| Criterion | Points | Description |
| :---- | :---- | :---- |
| Data Model | 5 | Multiple related tables with complex relationships (1:1, 1:M, M:N); domain-specific product schema. |
| CRUD & Search | 5 | Full CRUD with validation; multi-criteria product search and filtering. |
| DAL & Service Layer | 5 | Comprehensive DAL with error handling; service layer encapsulating business logic. |
| AI features | 5 | Add AI features that help and assist the user |

### Category 3: Payments, Orders & Admin — 20 points

| Criterion | Points | Description |
| :---- | :---- | :---- |
| Order & Purchase Lifecycle | 5 | Order creation, status tracking, purchase history with search/filter; audit trail. |
| Admin Interface | 5 | Order and user management built in Express \+ HBS/EJS; role-based admin access. |
| AI Features | 10 | Add AI features to ease burden on admin, logistics and operations |

### Category 4: React Frontend & AI — 20 points

| Criterion | Points | Description |
| :---- | :---- | :---- |
| Core Features | 5 | Product display with filtering; shopping cart (persist/merge/guest); checkout UI; API integration with loading and error states, authentication. |
| React Architecture | 5 | State management (advanced: Jotai/Zustand; acceptable: Context/Props), protected routes, reusable components. |
| AI-Powered Feature | 10 | Creative, functional LLM integration (RAG, tools, structured responses) that genuinely improves UX. |

### Category 5: UI/UX & Design — 10 points

| Criterion | Points | Description |
| :---- | :---- | :---- |
| Visual Design | 4 | Cohesive design system (typography, color, spacing, imagery); clear branding and identity. |
| Responsiveness & Accessibility | 4 | Optimized for mobile, tablet, and desktop; intuitive navigation, inline validation, and user feedback. |
| Information Architecture | 2 | Clear hierarchy, efficient user flows, logical navigation. |

### Category 6: Software Engineering — 10 points

| Criterion | Points | Description |
| :---- | :---- | :---- |
| Code Organization | 3 | Consistent naming, modular structure, clear separation of concerns. |
| Error Handling & Quality | 3 | Graceful error fallbacks, logging (e.g., log files), consistent style, JSDoc/comments on complex logic. |
| Version Control & Testing | 2 | Regular meaningful commits, branching strategy; unit/integration tests with coverage proof. |
| Environment & Security | 2 | Environment variables for all secrets/keys; no hardcoded credentials. |

## 7.0 Passing Requirements

To receive a passing grade:

- **Overall score ≥ 50 / 100**  
- **Core Competency:** You must earn at least 50% of the points available in **Categories 1–4 combined** (≥ 35 / 70 pts). This ensures the backend, data layer, payments, and frontend are fundamentally functional.

## 8.0 README Requirements

Your repository must include a `README.md` with the following sections:

- **Project Name & Summary:** Elevator pitch, business context, goals, and deployed URL.  
- **UX/UI:** User stories with acceptance criteria, wireframes/mockups/links, and discussion of the Five Planes of UI/UX (strategy, scope, structure, skeleton, surface).  
- **Features:** Major features, algorithms used, known limitations/bugs, pending features.  
- **Use Cases:** Name, objective, and user steps for key workflows (alternative to feature list if preferred).  
- **Technologies Used:** Languages, frameworks, libraries, tools, and GitHub/repo links.  
- **Testing:** Proof of testing; manual test cases with steps and expected results. Unhandled exceptions or console errors will be considered failing tests.  
- **Deployment:** Hosting platform, database hosting, environment variables, dependencies, deployment steps.  
- **Credits:** All external code, assets, libraries, and tutorials used.

## 9.0 Submission Checklist

- [ ] GitHub repository with clean, meaningful commit history.  
- [ ] Deployed application URL.  
- [ ] Functional Stripe payment flow in test mode.  
- [ ] Admin dashboard accessible via Express \+ HBS/EJS.  
- [ ] README.md meeting all section requirements.  
- [ ] AI feature integrated and documented.


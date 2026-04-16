# MDB Light

`MDB Light` is a production-oriented multilingual ecommerce project for LED lighting products, category-driven catalog browsing, project showcase pages, and online order processing.

The platform combines a public storefront, a protected admin area, payment flows, order handling, multilingual SEO pages, and business-oriented content for Riga, Latvia, and Cyprus.

## Portfolio Summary

MDB Light is a custom-built lighting marketplace designed as a real business website rather than a UI concept. The project includes:

- multilingual storefront
- category and product pages
- localized SEO routing
- shopping cart and checkout
- guest checkout and account creation during checkout
- Stripe payments
- bank transfer checkout flow
- order emails for customer and admin
- protected admin panel
- product/category/project management
- manual product sorting inside categories
- legal pages and cookie consent

The site is tailored for a premium lighting brand with commercial and residential use cases.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- next-intl for i18n
- Lucide React icons

### Backend / Infrastructure

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Resend for transactional email delivery
- Stripe Checkout + webhooks
- Vercel deployment

### Supporting Libraries

- `@supabase/ssr`
- `@supabase/supabase-js`
- `stripe`
- `pdf-lib`
- `nodemailer`
- `framer-motion`

## Main Functional Areas

## 1. Public Storefront

The public website includes:

- landing page
- multilingual homepage variants
- category pages
- product pages
- project showcase section
- blog section
- service landing pages
- location landing pages
- cart
- checkout
- success / cancel / bank transfer order states
- legal pages

The interface is built in a premium marketplace style with a strong commercial presentation and responsive layout for desktop and mobile.

## 2. Multilingual Content

The project supports 4 languages:

- English
- Russian
- Latvian
- Greek

Implemented multilingual behavior includes:

- localized page paths
- localized product and category content
- localized legal pages
- localized homepage SEO content
- localized UI copy
- localized order and email copy
- localized cookie banner

Products and categories support separate slug values per language, so URLs are language-specific instead of using a single global slug.

Examples:

- `/en/magnetic-track-systems`
- `/ru/magnitnye-trekovye-sistemy`
- `/lv/magnetiskas-sistemas`
- `/el/magnitika-systimata`

## 3. Catalog And Product System

The catalog supports:

- categories
- products
- localized titles and descriptions
- cover images
- product images
- pricing
- stock quantity
- SKU
- attributes / option metadata
- category-based navigation
- featured products on homepage

Implemented product experience includes:

- product detail page
- image gallery
- quantity selector before add-to-cart
- related products
- localized product URLs
- cart quantity controls
- dynamic total recalculation

## 4. Cart And Checkout

The ecommerce flow supports:

- add to cart
- quantity updates in cart
- cart persistence
- guest checkout
- authenticated checkout
- optional account creation during checkout
- customer details capture
- order note
- Stripe card payment
- bank transfer payment

Guest checkout behavior:

- customer can place an order without login
- order stores contact information directly on the order
- `userId` is optional for guest orders

Checkout with account creation behavior:

- customer can enable “create account”
- password fields appear conditionally
- account is created after successful order submission
- order can be linked to the new user

## 5. Payments

Stripe is integrated for online card payments.

Implemented Stripe flow:

1. create order on backend
2. create Stripe Checkout Session
3. redirect customer to Stripe Checkout
4. receive live webhook
5. verify webhook signature
6. mark order as paid
7. trigger order email flow

Webhook events handled:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

The project also supports bank transfer checkout with a separate post-order flow.

## 6. Email Notifications

The project includes transactional email flows for both admin and customer.

Implemented cases:

- new bank transfer order email
- payment instructions email for bank transfer
- Stripe paid confirmation email
- bank transfer paid confirmation email after manual admin confirmation
- admin order notifications
- contact form email delivery

Emails are sent through Resend and use centralized mail helpers.

## 7. Admin Panel

The site has a protected hidden admin area with role-based access control.

Admin capabilities include:

- admin login
- protected routes
- product management
- category management
- project management
- user management
- order management
- invoice tools
- media uploads
- multilingual content editing
- slug editing per language
- product ordering inside category

Implemented admin-specific functionality:

- manual product sort order
- category → products management screen
- separate language slug fields
- explicit order status updates
- payment confirmation handling for bank transfer orders

## 8. SEO

The project is built with multilingual SEO in mind.

Implemented SEO work includes:

- metadata per locale
- canonical URLs
- hreflang alternates
- sitemap
- robots file
- structured data
- localized slugs for products and categories
- legal page metadata
- homepage geo-targeted content
- brand favicon / app icon setup

SEO content is targeted around:

- MDB / MDB Light brand search
- lighting in Riga
- LED lighting in Latvia
- lighting and installation in Cyprus

## 9. Legal / Compliance

The project includes:

- Privacy Policy
- Cookies Policy
- Delivery / Returns
- Terms of Use
- company info in footer
- cookie consent banner with consent options

Cookie logic follows the expected EU-style behavior:

- accept
- reject
- manage
- block optional cookies before consent

## 10. Security And Architecture

Key architecture and security decisions:

- server-side protected admin actions
- Supabase service role used only on server
- Stripe webhook signature verification
- hidden admin route is not treated as the only protection layer
- guest and authenticated order flows are both supported
- production deployment through Vercel

The project uses separate storefront/admin Supabase configuration for operational boundaries.

## Database / Domain Model

Core entities used by the project include:

- products
- product_translations
- categories
- category_translations
- projects
- project_translations
- carts
- cart_items
- orders
- order_items
- invoices
- invoice_items
- profiles
- attributes
- product_attribute_values

This allows the project to support multilingual ecommerce content, admin workflows, and order processing in a structured way.

## Portfolio Positioning

This project demonstrates:

- full-stack ecommerce implementation
- multilingual architecture
- admin tooling for real content operations
- payment integration with webhook handling
- transactional email flows
- SEO-aware routing and metadata
- practical product-oriented UX

It is suitable for portfolio presentation as a real commercial web product for a niche retail business.

## Short Portfolio Description

MDB Light is a multilingual ecommerce platform for LED lighting products, built with Next.js, Supabase, Stripe, and Resend. The project includes a public storefront, category and product pages, guest and authenticated checkout, online payments, bank transfer order flow, admin management tools, multilingual SEO routing, transactional email flows, and localized legal/compliance pages.

## Stack For Portfolio

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Stripe
- Resend
- Vercel
- next-intl

## Features For Portfolio

- multilingual storefront in 4 languages
- localized category and product slugs
- category and product management
- manual product ordering inside categories
- cart with quantity controls
- guest checkout
- optional account creation in checkout
- Stripe payment flow with webhook confirmation
- bank transfer payment flow
- customer/admin order emails
- protected admin panel
- legal pages and cookie consent
- sitemap, hreflang, canonical metadata, structured data

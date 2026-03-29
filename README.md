# MDB Light

`MDB Light` is a marketplace for LED lighting equipment and related light solutions.

The project is focused on selling different types of lighting products: home lighting, architectural lighting, commercial lighting, decorative fixtures, track systems, linear lights, spotlights, power supplies, accessories, and related equipment.

This README defines the intended product direction so future tasks stay aligned with the real business goal.

## Product Idea

The main product is an online marketplace for lighting equipment with:

- public storefront
- product catalog
- product cards with full descriptions
- shopping cart
- checkout and online payment
- order management
- hidden admin panel

The storefront should look modern, clean, premium, and easy to navigate.

## Main Goals

- Sell LED lighting equipment online
- Support multilingual product content
- Provide convenient product management through admin tools
- Store orders and customer data in a structured backend
- Process payments through Stripe
- Use Supabase as the main backend/database platform

## Core Functional Areas

### 1. Storefront

Public part of the site should include:

- landing page
- catalog page
- category pages
- product detail page
- cart
- checkout
- order success page

Potential catalog filters:

- category
- price
- brand
- wattage
- color temperature
- voltage
- mounting type
- availability

### 2. Product Model

Each product should eventually contain:

- title
- slug
- SKU / internal code
- short description
- full description
- price
- old price / discount
- stock quantity
- category
- brand
- product attributes
- images
- active / inactive status

Possible product attributes for lighting:

- power
- luminous flux
- color temperature
- beam angle
- IP protection
- voltage
- dimensions
- material
- color
- warranty

### 3. Multilingual Content

Admin should be able to manage product content in 4 languages.

At minimum, the following fields should support translations:

- product title
- short description
- full description
- category name
- product characteristics labels if needed

Recommended approach for the first production-ready version:

- store translations explicitly in the database
- keep one base language
- allow manual editing for each language
- optionally add auto-translation as a helper tool for admin, not as the only source

Important note:

Automatic translation can speed up content entry, but it should not fully replace manual review. For product sales, attribute accuracy and wording matter. The safer approach is:

1. admin enters base content
2. system generates translations
3. admin reviews and saves them

## Admin Panel

The project requires a hidden admin panel with a non-obvious URL, for example a custom route similar to:

`/gldpf[gkfd0ij5430i53`

Admin panel should not be linked from the public navigation.

Important:

- hidden URL alone is not security
- admin area must require authentication
- admin access must be restricted by role
- all admin routes must be protected on the server side

Admin panel features should include:

- login for admin
- create product
- edit product
- delete product
- upload product images
- edit multilingual descriptions
- manage stock
- manage prices and discounts
- view cart-related data if we decide to persist carts
- view orders
- update order status

Recommended order statuses:

- pending
- paid
- processing
- shipped
- completed
- canceled

## Cart And Orders

Planned behavior:

- guest user can add products to cart
- cart can work in local state at first
- later cart can optionally be synced to Supabase
- checkout creates an order record
- successful Stripe payment updates order status

Admin should be able to see:

- all orders
- customer data required for fulfillment
- ordered products
- payment status
- order totals
- order timeline/status

About cart visibility in admin:

- viewing active carts is possible
- but it is not required for MVP
- for MVP, orders are more important than live cart monitoring

## Payments

Stripe is the planned payment provider.

Recommended Stripe flow:

- create order draft on backend
- create Stripe Checkout Session
- redirect user to Stripe Checkout
- receive Stripe webhook after payment
- verify event on backend
- mark order as paid in database

This is safer than trusting only client-side success redirects.

## Backend And Database

Supabase is the planned backend platform.

Supabase responsibilities:

- PostgreSQL database
- authentication
- storage for images if we choose Supabase Storage
- row-level security where appropriate

Main entities that will likely be needed:

- admins / users
- products
- product_translations
- categories
- category_translations
- product_images
- orders
- order_items
- carts
- cart_items

## Security Principles

Admin panel should be protected by several layers:

- hidden custom route
- Supabase authentication
- admin role check
- protected server-side actions / route handlers
- secure environment variables
- Stripe webhook signature validation

Hidden URL is acceptable as an extra obscurity layer, but not as the main protection mechanism.

## Current Technical Direction

Planned stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Stripe

## Portfolio Section

### Short Project Description

`MDB Light` is a multilingual marketplace concept for LED lighting products. The project is designed as a modern ecommerce platform with a public storefront, structured product catalog, protected admin area, and future integration with payments, order management, and multilingual content workflows.

This case demonstrates how a product-focused frontend can be prepared for a real business domain: catalog browsing, product presentation, user flows, operational admin tools, and backend-ready architecture.

### Portfolio Description (EN)

MDB Light is a commercial web application concept for the LED lighting industry. I built it as a scalable marketplace interface with multilingual UX, category-based product discovery, and a clean premium visual system. The project is structured to grow from a marketing-driven storefront into a full ecommerce product with catalog management, admin workflows, order processing, and payment integration.

### Portfolio Description (RU)

MDB Light это концепт коммерческого веб-приложения для ниши LED-освещения. Проект собран как масштабируемый marketplace-интерфейс с мультиязычным UX, каталогом по категориям и аккуратной премиальной визуальной подачей. Архитектура и UI уже подготовлены к развитию в полноценный ecommerce-продукт: с управлением товарами, административной частью, заказами, оплатой и мультиязычным контентом.

### Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Supabase (planned backend)
- Stripe (planned payments)

### What This Project Shows

- building multilingual ecommerce storefronts
- designing category-driven marketplaces
- creating product-focused landing pages with premium UI
- preparing admin panels for product, order, and content management
- planning integrations with backend services and payment systems

### Types Of Applications I Build

Based on this project, the portfolio positioning is strongest around:

- ecommerce websites and marketplaces
- multilingual business websites
- product catalogs and showcase platforms
- admin panels and internal management tools
- customer-facing web apps with payment and order flows
- niche commercial platforms for retail, interiors, lighting, furniture, and similar product businesses

Current repository status:

- project foundation exists
- UI is being built step by step
- architecture should now move toward marketplace implementation

## Recommended MVP Scope

To avoid overbuilding too early, the MVP should focus on:

1. landing page
2. catalog with categories
3. product detail page
4. cart
5. Stripe checkout
6. Supabase product storage
7. hidden admin login
8. product CRUD in admin
9. order list in admin
10. multilingual content management

## Recommended Build Sequence

Suggested implementation order:

1. finalize public landing page direction
2. design product and category data model
3. integrate Supabase
4. build catalog and product pages with mock data, then real data
5. build cart
6. integrate Stripe Checkout
7. build admin authentication and route protection
8. build admin product management
9. build order management
10. add translation workflow

## Product Decisions Fixed For Now

These assumptions should be treated as the default until changed:

- project type: LED lighting marketplace
- payment system: Stripe
- database/backend: Supabase
- admin panel: hidden custom URL plus real authentication
- multilingual support: 4 languages
- admin can manage products, descriptions, orders, and pricing

## Open Decisions To Confirm Later

These points are not fully fixed yet and can be refined in future tasks:

- exact 4 supported languages
- whether carts should be stored permanently in database
- whether translations are fully manual or manual + auto-translate assist
- whether admin panel should live inside the same Next.js app or as a separate app section
- whether image storage should use Supabase Storage or another provider

## Working Rule

When future tasks are implemented, this README should be updated if the business logic or architecture changes.
#   m d b - l i g h t  
 
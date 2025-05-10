---
# Step Into Storytime – Product Requirements Document (Updated)

## PRD

Thank you for the detailed breakdown of *Step Into Storytime*! You've provided a fantastic foundation, and I've incorporated your clarifications into a concise PRD using the Sample PRD headings. Here's the markdown output:
---

**Step Into Storytime – Product Requirements Document (Updated)**

**1. Elevator Pitch**

Step Into Storytime is an AI-powered platform that transforms bedtime into a magical, personalized experience for children aged 3-8 and their families. Parents, caregivers, and educators can instantly create unique stories by choosing characters, settings, and themes, with AI generating engaging narratives in seconds. Offering text or narrated output and a "story vault" to save favorites, it solves the struggle of finding fresh, tailored bedtime stories—making every night a creative, screen-free bonding adventure.

**2. Who is this app for**

- **Primary Users:**
  - Parents of children aged 3-8 seeking fun, customized bedtime stories.
  - Caregivers and grandparents wanting to bond through storytelling.
  - Educators and librarians looking for interactive, educational storytelling tools.
- **Personas:**
  - Sarah (Parent, 34): Needs quick, personalized stories for her 5-year-old, accessible on her phone.
  - Mr. Thomas (Teacher, 42): Wants stories to teach preschoolers values like kindness.
  - Grandma Susan (60): Reads to grandkids remotely and wants narrated or downloadable tales.

**3. Functional Requirements (Current Implementation)**

- **Story Customization Wizard:**
  - Step-by-step interface for character (name, gender, traits), setting, theme, and length selection.
  - Progress bar and animated previews.
- **Story Vault:**
  - Save, view, and revisit past stories.
  - Stories organized by child profile.
- **Authentication:**
  - Sign up/login via Supabase (email, Google, Apple).
  - Supports multiple child profiles per account.
  - Protected routes via middleware and RLS.
- **Subscription Model:**
  - Free and premium tiers.
  - Subscription management UI and API endpoints.
- **Audio Narration:**
  - Audio controls for playback (UI implemented; TTS endpoint present, full integration pending).
- **Navigation & Dashboard:**
  - Responsive navbar (mobile/desktop), dashboard for stories and profiles.
- **Accessibility & UX:**
  - Mobile-responsive, dark mode, large touch targets, screen reader support, keyboard navigation.
  - Error boundaries, toasts, and feedback components.
- **Security:**
  - Supabase Auth, role-based access, in-memory rate limiting, RLS policies, error handling.

**4. Backend/API (Implemented)**

- **API Endpoints:**
  - `/api/auth/` – Auth flows (login, logout, session, etc.)
  - `/api/stories/` – Story CRUD operations
  - `/api/story/` – Single story operations (view/generate/narrate)
  - `/api/generate-image/` – Image generation (endpoint present, full feature in progress)
  - `/api/subscriptions/` – Subscription management
- **Supabase Integration:**
  - Database, authentication, RLS, session management
  - Edge functions and OpenAI integration (in progress)

**5. Database/Schema**

- **Schema:**
  - Users, Child_Profiles, Stories tables
  - 1:N relationships between Users-Profiles and Users-Stories
  - RLS policies for secure, role-based access
  - Migration scripts present

**6. User Interface & Experience**

- **Core Components:**
  - Story wizard, character creator, story preview, audio controls, navigation, dashboard, subscription UI
  - Large, colorful, animated, kid-friendly design (bright pastels, soft edges, dark mode)
- **Flows:**
  - Onboarding, story creation, dashboard navigation, subscription management, story vault, audio playback

**7. Security & Middleware**

- **Authentication:**
  - Supabase Auth with multiple providers, session checks, protected routes
- **Middleware:**
  - In-memory rate limiting (per IP)
  - Role-based access control, error handling, logging

**8. Out of Scope/Planned (Not Yet Fully Implemented)**

- **AI Story Generation:**
  - OpenAI-powered dynamic plot and moral lesson generation (API endpoints present, full integration pending)
- **Text-to-Speech:**
  - Full TTS integration in progress
- **Image Generation:**
  - Story illustration generation endpoint present, full feature in progress
- **Mobile App:**
  - Future native app planned

---

This PRD reflects the current, implemented state of Step Into Storytime. Any features marked as "in progress" or "planned" are not yet fully available in production.

---

# Stripe Integration Plan for Subscription Management

## Overview

This document outlines the plan for integrating Stripe as the payment provider for subscription management in the Step Into Storytime project. It includes rationale, pros/cons, and a phased implementation approach. This plan is intended as a reference for future development.

---

## Why Stripe?

- **Industry standard** for SaaS and subscription billing.
- Supports all required features: subscription management, billing history, invoices, payment method updates.
- Excellent documentation and React/Next.js integration examples.
- Integrates well with Supabase (see [Supabase Stripe guide](https://supabase.com/docs/guides/integrations/stripe)).
- Handles PCI compliance via Stripe Elements.

### Pros

- Full-featured subscription and billing platform
- Secure, PCI-compliant payment forms
- Webhooks for real-time updates
- Good developer experience and community support

### Cons

- Requires Stripe account setup and configuration
- Standard payment processing fees

---

## Alternatives Considered

- **Paddle, LemonSqueezy, etc.:**
  - Pros: Some handle tax/VAT, good for global sales
  - Cons: Less direct Supabase integration, less flexible APIs
- **Supabase Native Payments:** Not available; Supabase recommends Stripe for subscriptions.

---

## Implementation Plan

### 1. Stripe Account Setup

- Create a Stripe account (if not already done)
- Set up products and pricing plans in Stripe Dashboard

### 2. Supabase Integration

- Store Stripe customer and subscription IDs in Supabase user records
- Use Stripe webhooks to sync subscription status with Supabase
- Reference: [Supabase Stripe Subscription Starter](https://github.com/vercel/nextjs-subscription-payments)

### 3. Frontend Changes

- Use Stripe Elements for secure card input and payment method updates
- Add UI for billing history and downloadable invoices
- Add UI for updating payment method
- Display next billing date/amount

### 4. Backend/API Changes

- Use Supabase Edge Functions or Next.js API routes to handle secure Stripe operations (if needed)
- Implement endpoints for fetching invoices, updating payment methods, etc.

### 5. Testing & Launch

- Test all flows: new subscription, plan switch, cancellation, payment failure, invoice download
- Ensure mobile responsiveness and accessibility

---

## Additional Ideas for the Manage Subscription Page

These features are recommended to provide a complete and user-friendly subscription management experience. Most are related to billing, but some address user experience, support, and security:

### Billing & Payment Management

- **View Billing History / Invoices:** List of past payments with downloadable invoices.
- **Update Payment Method:** Allow users to change their credit card or payment info securely.
- **Show Next Billing Date/Amount:** Clearly display when and how much the next charge will be.
- **Show Trial Status:** If on trial, show days left and what happens after.
- **Show Renewal/Cancellation Policy:** Explain what happens when canceling (e.g., access until end of period).
- **Show Proration Info:** If switching plans, explain if/when proration applies.
- **Handle Payment Failures:** Show clear message if payment is past due or card is declined, with instructions to update payment.
- **Mask Card Info:** Only show last 4 digits of card in payment method display.

### User Experience & Support

- **Success Feedback:** Toasts or banners for successful actions (plan change, payment update, etc.).
- **Loading States:** Ensure all async actions have clear loading indicators.
- **Accessibility Audit:** Ensure all controls are keyboard/screen reader accessible.
- **Mobile Responsiveness:** Test and optimize for mobile screens.
- **Direct Support Contact:** Button or link to contact support (email, chat, etc.).
- **Contextual Help Tooltips:** Explain plan features, billing, etc., with tooltips or info icons.

### Security & Edge Cases

- **Require Re-auth for Sensitive Actions:** (Optional) Prompt for password re-entry before canceling or changing payment.
- **Handle Subscription in Paused/Pending States:** If supported by backend, show appropriate UI for these states.

---

## Next Steps

- Confirm Stripe as the payment provider
- Complete Stripe account and product setup
- Begin phased implementation as outlined above

---

**This plan can be revisited and expanded as needed.**

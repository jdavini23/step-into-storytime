# Migration Plan: Stripe to RevenueCat

## Overview
This document outlines the steps to migrate from direct Stripe integration to RevenueCat for subscription management in the Step Into Storytime application.

## Prerequisites
- [ ] RevenueCat account (https://app.revenuecat.com/signup)
- [ ] Stripe account (existing)
- [ ] Node.js 16+ installed
- [ ] Access to production database for migration

## Phase 1: Setup & Configuration

### 1.1 Project Setup in RevenueCat
- [ ] Create new project in RevenueCat dashboard
- [ ] Configure store connections (App Store, Google Play)
- [ ] Set up Stripe as payment processor
- [ ] Generate API keys for development and production

### 1.2 Install Dependencies
```bash
npm install react-native-purchases @react-native-async-storage/async-storage
```

### 1.3 Environment Configuration
Add to `.env.local`:
```env
NEXT_PUBLIC_REVENUECAT_API_KEY=your_public_api_key
REVENUECAT_SECRET_KEY=your_secret_key
```

## Phase 2: Core Implementation

### 2.1 RevenueCat Service
Create `lib/services/revenuecat.ts`:
```typescript
import { Purchases, LOG_LEVEL, PurchasesOfferings } from 'react-native-purchases';

export const initializeRevenueCat = async () => {
  if (typeof window !== 'undefined') {
    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      await Purchases.configure({
        apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!,
        appUserID: null // Let RevenueCat generate an anonymous ID
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize RevenueCat', error);
      return false;
    }
  }
  return false;
};

export const getOfferings = async () => {
  try {
    return await Purchases.getOfferings();
  } catch (error) {
    console.error('Error fetching offerings', error);
    throw error;
  }
};

export const purchaseSubscription = async (packageToPurchase: any) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Error purchasing package', error);
    }
    return { 
      success: false, 
      error,
      userCancelled: error.userCancelled || false 
    };
  }
};
```

### 2.2 Update Subscription Context
Update or create `contexts/SubscriptionContext.tsx`.

## Phase 3: UI Updates

### 3.1 Update Subscription Page
Modify `app/subscription/page.tsx` to use RevenueCat offerings.

### 3.2 Update Subscription Components
Update components in `components/subscription/` to work with RevenueCat.

## Phase 4: Backend Changes

### 4.1 Update Webhooks
Create `app/api/revenuecat/webhook/route.ts`.

### 4.2 Migrate Existing Subscribers
Create migration script in `scripts/migrate-subscriptions.ts`.

## Phase 5: Testing

### 5.1 Test Cases
- [ ] New subscription flow
- [ ] Subscription upgrades/downgrades
- [ ] Subscription cancellation
- [ ] Restore purchases
- [ ] Receipt validation

## Phase 6: Deployment

### 6.1 Staging Deployment
- [ ] Deploy to staging environment
- [ ] Test all subscription scenarios
- [ ] Verify webhook delivery

### 6.2 Production Deployment
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Be prepared to rollback if needed

## Rollback Plan
1. Revert code changes
2. Point back to Stripe webhooks
3. Restore any database backups if needed

## Monitoring & Maintenance
- Set up error tracking
- Monitor subscription metrics in RevenueCat dashboard
- Set up alerts for failed transactions

## Timeline
- Week 1: Setup & Development
- Week 2: Testing & Bug Fixes
- Week 3: Staging Deployment
- Week 4: Production Rollout

## Resources
- [RevenueCat Documentation](https://www.revenuecat.com/docs/)
- [React Native Purchases SDK](https://github.com/RevenueCat/react-native-purchases)
- [Stripe to RevenueCat Migration Guide](https://www.revenuecat.com/docs/migrating-existing-subscriptions)

/*
RevenueCatContext.tsx
Revised to fix TypeScript lint errors by removing references to non-existent PurchasesPackage and using RevenueCatPackage for subscription package types.
*/

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { CustomerInfo, Offerings, Package as RevenueCatPackage } from '@revenuecat/purchases-js';

import {
  initializeRevenueCat,
  getOfferings as fetchOfferings,
  purchasePackage as makePurchase,
  restorePurchases as restoreUserPurchases,
  getCustomerInfo as fetchCustomerInfo,
  checkSubscriptionStatus
} from '@/lib/services/revenuecat';

export type RevenueCatContextType = {
  isReady: boolean;
  isLoading: boolean;
  error: Error | null;
  offerings: Offerings | null;
  customerInfo: CustomerInfo | null;
  currentPackage: RevenueCatPackage | null;
  subscriptionStatus: any;
  purchasePackage: (pkg: RevenueCatPackage) => Promise<boolean>;
  restorePurchases: () => Promise<CustomerInfo | null>;
  refreshData: () => Promise<void>;
  isSubscribed: boolean;
  isTrial: boolean;
  willRenew: boolean;
  expirationDate: Date | null;
};

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClientComponentClient();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  // Derive subscription status from customer info
  const subscriptionStatus = useMemo(() => {
    return checkSubscriptionStatus(customerInfo);
  }, [customerInfo]);

  // Derive current active package by checking premium entitlement
  const currentPackage = useMemo(() => {
    if (!offerings?.current || !customerInfo) return null;
    for (const off of Object.values(offerings.all)) {
      for (const pkg of off.availablePackages) {
        if (pkg.identifier === customerInfo.entitlements.active.premium?.productIdentifier) {
          return pkg;
        }
      }
    }
    return null;
  }, [offerings, customerInfo]);

  // Initialize RevenueCat on mount and on auth changes
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        if (!userId) {
          setCustomerInfo(null);
          setOfferings(null);
          return;
        }
        await initializeRevenueCat(userId);
        const custInfo = await fetchCustomerInfo();
        if (custInfo) {
          setCustomerInfo(custInfo);
        }
        const offData = await fetchOfferings();
        setOfferings(offData);
      } catch (err) {
        console.error('Error initializing RevenueCat:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize RevenueCat'));
      } finally {
        setIsLoading(false);
        setIsReady(true);
      }
    };
    
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCustomerInfo(null);
        setOfferings(null);
      } else if (event === 'SIGNED_IN' && session?.user?.id) {
        await initializeRevenueCat(session.user.id);
        const custInfo = await fetchCustomerInfo();
        if (custInfo) {
          setCustomerInfo(custInfo);
        }
        const offData = await fetchOfferings();
        setOfferings(offData);
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Handle purchase of a subscription package
  const handlePurchase = useCallback(async (pkg: RevenueCatPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await makePurchase(pkg);
      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err : new Error('Purchase failed'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle restore purchases
  const handleRestorePurchases = useCallback(async (): Promise<CustomerInfo | null> => {
    try {
      setIsLoading(true);
      const custInfo = await restoreUserPurchases();
      if (custInfo) setCustomerInfo(custInfo);
      return custInfo;
    } catch (err) {
      console.error('Restore purchases error:', err);
      setError(err instanceof Error ? err : new Error('Failed to restore purchases'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh subscription data
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [newCustomerInfo, newOfferings] = await Promise.all([
        fetchCustomerInfo(),
        fetchOfferings()
      ]);
      setCustomerInfo(newCustomerInfo);
      setOfferings(newOfferings);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    isReady,
    isLoading,
    error,
    offerings,
    customerInfo,
    currentPackage,
    subscriptionStatus,
    purchasePackage: handlePurchase,
    restorePurchases: handleRestorePurchases,
    refreshData,
    isSubscribed: subscriptionStatus.isActive,
    isTrial: subscriptionStatus.isTrialPeriod || false,
    willRenew: subscriptionStatus.willRenew,
    expirationDate: subscriptionStatus.expirationDate || null,
  }), [
    isReady,
    isLoading,
    error,
    offerings,
    customerInfo,
    currentPackage,
    subscriptionStatus,
    handlePurchase,
    handleRestorePurchases,
    refreshData,
  ]);

  return (
    <RevenueCatContext.Provider value={contextValue}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = (): RevenueCatContextType => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};
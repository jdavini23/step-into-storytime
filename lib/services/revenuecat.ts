import { Purchases, LogLevel } from '@revenuecat/purchases-js';
import type { CustomerInfo, Offerings, Package as RevenueCatPackage } from '@revenuecat/purchases-js';

// Singleton instance
let purchasesInstance: Purchases | null = null;

/**
 * Initialize the RevenueCat client
 */
export const initializeRevenueCat = async (appUserId?: string | null): Promise<Purchases | null> => {
  if (typeof window === 'undefined') return null;
  
  try {
    if (!process.env.NEXT_PUBLIC_REVENUECAT_API_KEY) {
      throw new Error('RevenueCat API key is not configured');
    }

    // Configure the SDK
    purchasesInstance = new Purchases({
      apiKey: process.env.NEXT_PUBLIC_REVENUECAT_API_KEY,
      appUserID: appUserId || undefined,
      observerMode: false,
    });

    // Set log level based on environment
    if (process.env.NODE_ENV === 'development') {
      Purchases.setLogLevel(LogLevel.Debug);
    }

    return purchasesInstance;
  } catch (error) {
    console.error('Failed to initialize RevenueCat', error);
    return null;
  }
};

/**
 * Get the current instance of the Purchases client
 */
export const getPurchasesInstance = (): Purchases | null => {
  return purchasesInstance;
};

/**
 * Get available offerings from RevenueCat
 */
export const getOfferings = async (): Promise<Offerings | null> => {
  if (!purchasesInstance) {
    console.warn('RevenueCat not initialized');
    return null;
  }

  try {
    const offerings = await purchasesInstance.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Error fetching offerings', error);
    return null;
  }
};

/**
 * Purchase a package
 */
export const purchasePackage = async (pkg: RevenueCatPackage): Promise<{ success: boolean; customerInfo?: CustomerInfo }> => {
  if (!purchasesInstance) {
    return { 
      success: false 
    };
  }

  try {
    const { customerInfo } = await purchasesInstance.purchasePackage(pkg);
    return { 
      success: true, 
      customerInfo 
    };
  } catch (error) {
    console.error('Error making purchase', error);
    return { success: false };
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (!purchasesInstance) {
    console.warn('RevenueCat not initialized');
    return null;
  }

  try {
    const customerInfo = await (purchasesInstance as any).restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases', error);
    return null;
  }
};

/**
 * Get current customer info
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  if (!purchasesInstance) {
    console.warn('RevenueCat not initialized');
    return null;
  }

  try {
    const customerInfo = await purchasesInstance.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info', error);
    return null;
  }
};

/**
 * Check subscription status
 */
export const checkSubscriptionStatus = (customerInfo: CustomerInfo | null): { 
  isActive: boolean;
  isExpired: boolean;
  willRenew: boolean;
  expirationDate?: Date | null;
  productIdentifier?: string;
  isTrialPeriod?: boolean;
} => {
  if (!customerInfo) {
    return {
      isActive: false,
      isExpired: true,
      willRenew: false,
    };
  }

  const isActive = customerInfo.entitlements.active['premium']?.isActive === true;
  const entitlement = customerInfo.entitlements.active['premium'];
  
  return {
    isActive,
    isExpired: !isActive,
    willRenew: entitlement?.willRenew ?? false,
    expirationDate: entitlement?.expirationDate ? new Date(entitlement.expirationDate) : null,
    productIdentifier: entitlement?.productIdentifier,
    isTrialPeriod: (entitlement as any)?.isTrialPeriod === true,
  };
};

/**
 * Identify user with a custom ID
 */
export const identifyUser = async (userId: string): Promise<CustomerInfo | null> => {
  if (!purchasesInstance) {
    console.warn('RevenueCat not initialized');
    return null;
  }

  try {
    // Log in with the user ID
    const { customerInfo } = await (purchasesInstance as any).identify(userId);
    return customerInfo;
  } catch (error) {
    console.error('Error identifying user', error);
    return null;
  }
};

/**
 * Reset the RevenueCat user (on logout)
 */
export const resetUser = async (): Promise<void> => {
  if (!purchasesInstance) {
    console.warn('RevenueCat not initialized');
    return;
  }

  try {
    await (purchasesInstance as any).reset();
  } catch (error) {
    console.error('Error resetting RevenueCat user', error);
  }
};

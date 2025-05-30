'use client';

import { useEffect, useState } from 'react';
import { useRevenueCat } from '@/contexts/RevenueCatContext';
import type { Package } from '@revenuecat/purchases-js';
import { PackageType } from '@revenuecat/purchases-js';
import { Metadata } from 'next'; // Keep if you need metadata, adjust as necessary

// If you still need metadata for the page, ensure it's correctly defined for client components
// For client components, you might set title dynamically using useEffect or a library like react-helmet
// export const metadata: Metadata = {
//   title: 'Subscription Plans',
//   description: 'Choose a subscription plan that works for you.',
// };

export default function SubscriptionPage() {
  const {
    isReady,
    offerings,
    customerInfo,
    isSubscribed,
    loading,
    error,
    purchasePackage,
    restorePurchases,
    currentPackage: activeRcPackage, // Renamed to avoid conflict if any
  } = useRevenueCat();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // You can set document title here if needed for client components
    document.title = 'Subscription Plans - Step Into Storytime';
  }, []);

  const handleSubscribe = async (pkgToPurchase: Package) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedPackage(pkgToPurchase);
    try {
      const purchaseMade = await purchasePackage(pkgToPurchase);
      if (purchaseMade) {
        // Optionally, show a success message or redirect
        console.log('Purchase successful!');
      } else {
        // Handle cases where purchase was not made (e.g., user cancelled)
        console.log('Purchase not completed or was cancelled.');
      }
    } catch (e) {
      console.error('Subscription purchase error:', e);
      // Show error to user
    }
    setIsProcessing(false);
    setSelectedPackage(null);
  };

  const handleRestore = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await restorePurchases();
      // Optionally, show a success message
    } catch (e) {
      console.error('Restore purchases error:', e);
      // Show error to user
    }
    setIsProcessing(false);
  };

  if (!isReady || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
        <p className="mt-4 text-lg">Loading plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Could not load subscription plans. Please try again later.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">({error.message})</p>
      </div>
    );
  }

  if (!offerings?.current) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">No Plans Available</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          There are currently no subscription plans available. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Select a subscription that best fits your storytelling needs
        </p>
      </div>

      {isSubscribed && activeRcPackage && (
        <div className="mb-8 p-6 bg-green-100 dark:bg-green-700 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-100 rounded-lg text-center">
          <h2 className="text-2xl font-semibold">You are currently subscribed!</h2>
          <p className="text-lg mt-2">
            Your plan: {activeRcPackage.product.title} ({activeRcPackage.product.priceString})
          </p>
          {/* Add more details like expiry if needed from customerInfo */}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {offerings.current.availablePackages.map((pkg: Package) => (
          <div
            key={pkg.identifier}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-between border-2 ${selectedPackage?.identifier === pkg.identifier ? 'border-blue-500 dark:border-blue-400' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{pkg.storeProduct.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 h-20 overflow-y-auto">{pkg.storeProduct.description || 'Unlock a world of stories!'}</p>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{pkg.storeProduct.priceString}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {pkg.packageType === PackageType.Monthly ? 'Per month' : pkg.packageType === PackageType.Annual ? 'Per year' : ''}
              </p>
              {/* You might want to list features here if available from RevenueCat or define them statically */}
              {/* <ul className="mb-6 space-y-2 text-gray-600 dark:text-gray-300">
                <li>✓ Feature one</li>
                <li>✓ Feature two</li>
              </ul> */}
            </div>
            <button
              onClick={() => handleSubscribe(pkg)}
              disabled={isProcessing || (isSubscribed && activeRcPackage?.storeProduct.identifier === pkg.storeProduct.identifier)}
              className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors duration-150 
                ${(isSubscribed && activeRcPackage?.storeProduct.identifier === pkg.storeProduct.identifier) 
                  ? 'bg-green-500 cursor-default' 
                  : isProcessing && selectedPackage?.identifier === pkg.identifier 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'}`}
            >
              {isSubscribed && activeRcPackage?.storeProduct.identifier === pkg.storeProduct.identifier 
                ? 'Current Plan' 
                : isProcessing && selectedPackage?.identifier === pkg.identifier 
                  ? 'Processing...' 
                  : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      {!isSubscribed && (
         <div className="text-center mt-12">
          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className={`py-2 px-6 rounded-md font-semibold transition-colors duration-150 
              ${isProcessing 
                ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'}`}
          >
            {isProcessing ? 'Restoring...' : 'Restore Purchases'}
          </button>
        </div>
      )}
    </div>
  );
}

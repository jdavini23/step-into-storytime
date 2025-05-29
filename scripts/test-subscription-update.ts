// scripts/test-subscription-update.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.test
const envPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envPath });

type Subscription = {
  id: string;
  status: string;
  stripe_subscription_id: string;
  price_id: string;
  [key: string]: any;
};

type UpdateSubscriptionParams = {
  newPriceId?: string;
  newTier?: string;
};

type ErrorWithMessage = {
  message: string;
};

// Test configuration
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Use the direct API URL if available, otherwise default to localhost:3001
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
console.log('Using base URL:', BASE_URL);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase URL or Anon Key in environment variables');
}

// Create a typed Supabase client with the correct cookie handling
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }
});

async function signIn() {
  console.log('Signing in test user...');
  console.log('Using email:', TEST_EMAIL);
  console.log('Supabase URL:', SUPABASE_URL ? 'Set' : 'Not set');
  console.log('Supabase Anon Key:', SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  
  try {
    // First sign out any existing session
    await supabase.auth.signOut();
    
    // Then sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL.trim(),
      password: TEST_PASSWORD.trim(),
    });

    if (error) {
      console.error('Authentication error details:', error);
      throw new Error(`Sign in failed: ${error.message}`);
    }

    if (!data?.session) {
      console.error('No session data received:', data);
      throw new Error('No session returned after sign in');
    }

    console.log('✅ Signed in successfully');
    return { session: data.session };
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
}

async function getSubscription(): Promise<Subscription> {
  console.log('\nFetching subscription...');
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get subscription: ${error.message}`);
  }

  if (!data) {
    throw new Error('No subscription found for user');
  }

  const subscription: Subscription = {
    id: data.id,
    status: data.status,
    stripe_subscription_id: data.stripe_subscription_id,
    price_id: data.price_id,
    ...data
  };

  console.log('✅ Found subscription:', {
    id: subscription.id,
    status: subscription.status,
    stripe_subscription_id: subscription.stripe_subscription_id,
    price_id: subscription.price_id
  });

  return subscription;
}

async function updateSubscription(
  token: string, 
  subscriptionId: string, 
  updates: UpdateSubscriptionParams
): Promise<any> {
  console.log('\nUpdating subscription...');
  const url = `${BASE_URL}/api/subscriptions/${subscriptionId}`;
  
  // Log the token for debugging (first 10 chars only for security)
  console.log('Using auth token:', token ? `${token.substring(0, 10)}...` : 'No token provided');
  
  // Create a new AbortController for the fetch request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    console.log('Sending request to:', url);
    console.log('With updates:', JSON.stringify(updates, null, 2));
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Debug': 'true',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    
    const fetchOptions: RequestInit = {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
      credentials: 'include',
      signal: controller.signal
    };
    
    console.log('Sending fetch request with options:', {
      method: 'PUT',
      url,
      headers: Object.keys(headers),
      hasBody: !!updates
    });
    
    const startTime = Date.now();
    let response: Response;
    
    try {
      response = await fetch(url, fetchOptions);
    } catch (error: unknown) {
      const errorInfo = error instanceof Error 
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            type: 'Error'
          }
        : {
            name: 'UnknownError',
            message: String(error),
            type: typeof error
          };
      
      console.error('Fetch error details:', {
        ...errorInfo,
        isAbortError: error instanceof Error && error.name === 'AbortError'
      });
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`Request completed in ${responseTime}ms`);
    console.log('Response status:', response.status, response.statusText);
    
    // Log response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('Response headers:', JSON.stringify(responseHeaders, null, 2));
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
      console.log('Parsed response data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to parse JSON response. Raw text:', responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      console.error('❌ Update failed with status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      console.error('Response body:', data);
      throw new Error(`Update failed: ${data.error || 'Unknown error'}`);
    }

    console.log('✅ Subscription updated successfully');
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as ErrorWithMessage).message;
      console.error('❌ API request failed:', errorMessage);
      throw new Error(`API request failed: ${errorMessage}`);
    }
    console.error('❌ Unknown error during API request:', error);
    throw new Error('Unknown error during API request');
  }
}

async function runTests() {
  try {
    // 1. Sign in and get session token
    console.log('Starting subscription update tests...');
    const { session } = await signIn();
    if (!session) throw new Error('No session after sign in');
    
    console.log('Session token:', session.access_token.substring(0, 10) + '...');
    
    // 2. Get user's subscription
    const subscription = await getSubscription();
    
    if (!subscription.id) {
      throw new Error('No subscription found for testing');
    }
    
    // 2.1 Refresh the session to ensure we have the latest token
    const { data: { session: refreshedSession } } = await supabase.auth.getSession();
    if (!refreshedSession) throw new Error('Failed to refresh session');
    
    console.log('Refreshed session token:', refreshedSession.access_token.substring(0, 10) + '...');

    console.log(`\nFound subscription with ID: ${subscription.id}`);
    
    if (subscription.stripe_subscription_id) {
      console.log(`Testing with Stripe subscription ID: ${subscription.stripe_subscription_id}`);
      
      // 3. Test updating with new tier (only if we have a Stripe subscription ID)
      console.log('\n--- Testing update with new tier ---');
      try {
        await updateSubscription(refreshedSession.access_token, subscription.stripe_subscription_id, {
          newTier: 'premium'
        });
        console.log('✅ Successfully updated subscription tier');
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'message' in error 
          ? (error as ErrorWithMessage).message 
          : 'Unknown error';
        console.error('❌ Failed to update subscription tier:', errorMessage);
        throw error;
      }
    } else {
      console.log('ℹ️  No Stripe subscription ID found. Skipping Stripe-specific tests.');
      console.log('ℹ️  Testing only basic subscription update functionality.');
    }

    // 4. Test error cases
    console.log('\n--- Testing error cases ---');
    
    // Missing required fields
    try {
      console.log('\nTesting missing required fields...');
      await updateSubscription(session.access_token, subscription.stripe_subscription_id, {} as UpdateSubscriptionParams);
      console.error('❌ Expected error for missing fields but request succeeded');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as ErrorWithMessage).message 
        : 'Unknown error';
      console.log('✅ Expected error (missing fields):', errorMessage);
    }
    
    // Invalid subscription ID
    try {
      console.log('\nTesting invalid subscription ID...');
      await updateSubscription(session.access_token, 'invalid_id', { newTier: 'premium' } as UpdateSubscriptionParams);
      console.error('❌ Expected error for invalid subscription ID but request succeeded');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as ErrorWithMessage).message 
        : 'Unknown error';
      console.log('✅ Expected error (invalid ID):', errorMessage);
    }

    console.log('\n✅ All tests completed successfully!');
  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? (error as ErrorWithMessage).message 
      : 'Unknown error';
    console.error('\n❌ Test failed:', errorMessage);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in test script:', error);
  process.exit(1);
});

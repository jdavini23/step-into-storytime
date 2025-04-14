// Centralized constants for subscription management

export const PLAN_STATUS_LABELS = {
  active: 'Active',
  canceled: 'Canceled',
  trialing: 'Trial',
  past_due: 'Past Due',
  unpaid: 'Unpaid',
  incomplete: 'Incomplete',
  incomplete_expired: 'Expired', // Added to cover all SubscriptionStatus variants
};

export const ERROR_MESSAGES = {
  fetchFailed: 'Failed to load subscription. Please try again.',
  switchFailed: 'Unable to switch plans. Please retry.',
  cancelFailed: 'Could not cancel subscription. Please try again.',
};

export const ACTION_LABELS = {
  upgrade: 'Upgrade',
  downgrade: 'Downgrade',
  cancel: 'Cancel Subscription',
  retry: 'Retry',
};

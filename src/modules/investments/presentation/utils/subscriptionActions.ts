import type { SubscriptionRequestStatus } from '../../domain/valueObjects/investments/subscriptionRequestStatus';

export type SubscriptionAction = 'approve' | 'reject' | 'complete' | 'cancel';

export const canShowSubscriptionAction = (
  status: SubscriptionRequestStatus | undefined,
  action: SubscriptionAction,
): boolean => {
  if (status === 'pending_subscription_department_manager') return action === 'approve' || action === 'reject';
  if (status === 'pending_general_manager') return action === 'complete' || action === 'cancel';
  return false;
};
import { useCallback, useEffect, useState } from 'react';
import { useBlocker } from 'react-router-dom';

export function useUnsavedChanges(isDirty: boolean) {
  const blocker = useBlocker(isDirty);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const showConfirm = isDirty && (blocker.state === 'blocked' || pendingAction !== null);

  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [blocker, pendingAction]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setPendingAction(null);
  }, [blocker]);

  const attemptNavigation = useCallback(
    (onProceed: () => void) => {
      if (isDirty) {
        setPendingAction(() => onProceed);
      } else {
        onProceed();
      }
    },
    [isDirty],
  );

  return { showConfirm, confirmNavigation, cancelNavigation, attemptNavigation };
}

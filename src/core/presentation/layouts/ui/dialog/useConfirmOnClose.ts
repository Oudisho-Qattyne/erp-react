import { useEffect } from 'react';
import { useDialogClose } from './Dialog';

export function useConfirmOnClose(shouldConfirm: () => boolean) {
  const { setCloseGuard } = useDialogClose();

  useEffect(() => {
    setCloseGuard(shouldConfirm);
    return () => setCloseGuard(null);
  }, [setCloseGuard, shouldConfirm]);
}

import type { ComponentType } from "react";

/**
 * Contract every picker dialog fulfills (PlotPickerDialog, DossierPickerDialog,
 * FacilityPickerDialog, InvestorPickerDialog, ...).
 * TablePickerInput only needs these three props to drive any picker component.
 */
export interface PickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: any[]) => void;
}

export type PickerComponent = ComponentType<PickerDialogProps>;

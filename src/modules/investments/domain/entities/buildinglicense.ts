import type { PlotStatus } from "../valueObjects/plots/plotStatus"
import type { LicensingStatus } from "./licensingStatus"

export interface BuildingLicense {
    id: number;
    facility_id: number;
    building_license_number: string;
    building_license_date: string;
    licensed_area: number;
    current_plot_status: PlotStatus;
    licensing_status_id: number;
    licensing_status?: LicensingStatus;
    date_of_displaying_license_info: string,
    administrative_license_decision_number: string,
    administrative_license_decision_date: string,
    by_duration_license_id: number,
    by_industry_license_id: number,
    temp_administrative_license_expiration_date: string
    created_at: string;
    updated_at: string;
}

// export interface IndustrialLicense {
//     industry_category: string;
//     industry_type: string;
//     industrial_decision_number: string;
//     decisionDate: string;
//     decisionType: string;
//     issuingAuthority: string;
// }

export interface Facility {
    id: number;
    name: string;
    address: string;
    city: string;
    phone1: string;
    phone2?: string;
    email?: string;
    capitalSYP?: number;
    capitalUSD?: number;
    machineryValueSYP?: number;
    machineryValueUSD?: number;
    employeeCount?: number;
    dailyProductionCapacity?: number;
    monthlyProductionCapacity?: number;
    annualProductionCapacity?: number;
    powerCapacity?: string;
    waterConsumption?: number | string;
    // industrialLicenses: IndustrialLicense[];
}
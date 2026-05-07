/* tslint:disable */
/* eslint-disable */
export const EmployeeStatus = {
    Active: 'active',
    Archived: 'archived'
} as const;
export type EmployeeStatus = typeof EmployeeStatus[keyof typeof EmployeeStatus];

export function EmployeeStatusFromJSON(json: any): EmployeeStatus {
    return EmployeeStatusFromJSONTyped(json, false);
}

export function EmployeeStatusFromJSONTyped(json: any, ignoreDiscriminator: boolean): EmployeeStatus {
    return json as EmployeeStatus;
}

export function EmployeeStatusToJSON(value?: EmployeeStatus | null): any {
    return value as any;
}

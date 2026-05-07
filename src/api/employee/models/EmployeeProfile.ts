/* tslint:disable */
/* eslint-disable */
import { exists } from '../runtime';
import type { EmployeeStatus } from './EmployeeStatus';
import {
    EmployeeStatusFromJSON,
    EmployeeStatusToJSON,
} from './EmployeeStatus';

export interface EmployeeProfile {
    readonly id?: number;
    firstName: string;
    lastName: string;
    birthDate: Date;
    email?: string;
    phone?: string;
    position: string;
    department?: string;
    specialization: string;
    qualification: string;
    employmentStartDate: Date;
    certificates: Array<string>;
    note?: string;
    status?: EmployeeStatus;
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
    readonly archivedAt?: Date;
}

export function instanceOfEmployeeProfile(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "firstName" in value;
    isInstance = isInstance && "lastName" in value;
    isInstance = isInstance && "birthDate" in value;
    isInstance = isInstance && "position" in value;
    isInstance = isInstance && "specialization" in value;
    isInstance = isInstance && "qualification" in value;
    isInstance = isInstance && "employmentStartDate" in value;
    isInstance = isInstance && "certificates" in value;

    return isInstance;
}

export function EmployeeProfileFromJSON(json: any): EmployeeProfile {
    return EmployeeProfileFromJSONTyped(json, false);
}

export function EmployeeProfileFromJSONTyped(json: any, ignoreDiscriminator: boolean): EmployeeProfile {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'id': !exists(json, 'id') ? undefined : json['id'],
        'firstName': json['firstName'],
        'lastName': json['lastName'],
        'birthDate': (new Date(json['birthDate'])),
        'email': !exists(json, 'email') ? undefined : json['email'],
        'phone': !exists(json, 'phone') ? undefined : json['phone'],
        'position': json['position'],
        'department': !exists(json, 'department') ? undefined : json['department'],
        'specialization': json['specialization'],
        'qualification': json['qualification'],
        'employmentStartDate': (new Date(json['employmentStartDate'])),
        'certificates': json['certificates'],
        'note': !exists(json, 'note') ? undefined : json['note'],
        'status': !exists(json, 'status') ? undefined : EmployeeStatusFromJSON(json['status']),
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'updatedAt': !exists(json, 'updatedAt') ? undefined : (new Date(json['updatedAt'])),
        'archivedAt': !exists(json, 'archivedAt') ? undefined : (new Date(json['archivedAt'])),
    };
}

export function EmployeeProfileToJSON(value?: EmployeeProfile | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'firstName': value.firstName,
        'lastName': value.lastName,
        'birthDate': (value.birthDate.toISOString().substr(0,10)),
        'email': value.email,
        'phone': value.phone,
        'position': value.position,
        'department': value.department,
        'specialization': value.specialization,
        'qualification': value.qualification,
        'employmentStartDate': (value.employmentStartDate.toISOString().substr(0,10)),
        'certificates': value.certificates,
        'note': value.note,
        'status': EmployeeStatusToJSON(value.status),
    };
}

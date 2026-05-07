/* tslint:disable */
/* eslint-disable */
import * as runtime from '../runtime';
import type {
  EmployeeProfile,
  EmployeeStatus,
} from '../models';
import {
    EmployeeProfileFromJSON,
    EmployeeProfileToJSON,
} from '../models';

export interface ArchiveEmployeeProfileRequest {
    employeeId: number;
}

export interface CreateEmployeeProfileRequest {
    employeeProfile: EmployeeProfile;
}

export interface GetEmployeeProfileRequest {
    employeeId: number;
}

export interface ListEmployeeProfilesRequest {
    department?: string;
    specialization?: string;
    status?: EmployeeStatus;
}

export interface UpdateEmployeeProfileRequest {
    employeeId: number;
    employeeProfile: EmployeeProfile;
}

export interface EmployeeProfilesApiInterface {
    archiveEmployeeProfileRaw(requestParameters: ArchiveEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>>;
    archiveEmployeeProfile(requestParameters: ArchiveEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void>;
    createEmployeeProfileRaw(requestParameters: CreateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EmployeeProfile>>;
    createEmployeeProfile(requestParameters: CreateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EmployeeProfile>;
    getEmployeeProfileRaw(requestParameters: GetEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EmployeeProfile>>;
    getEmployeeProfile(requestParameters: GetEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EmployeeProfile>;
    listEmployeeProfilesRaw(requestParameters: ListEmployeeProfilesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<EmployeeProfile>>>;
    listEmployeeProfiles(requestParameters: ListEmployeeProfilesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<EmployeeProfile>>;
    updateEmployeeProfileRaw(requestParameters: UpdateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EmployeeProfile>>;
    updateEmployeeProfile(requestParameters: UpdateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EmployeeProfile>;
}

export class EmployeeProfilesApi extends runtime.BaseAPI implements EmployeeProfilesApiInterface {

    async archiveEmployeeProfileRaw(requestParameters: ArchiveEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.employeeId === null || requestParameters.employeeId === undefined) {
            throw new runtime.RequiredError('employeeId','Required parameter requestParameters.employeeId was null or undefined when calling archiveEmployeeProfile.');
        }

        const queryParameters: any = {};
        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/employees/{employeeId}`.replace(`{${"employeeId"}}`, encodeURIComponent(String(requestParameters.employeeId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    async archiveEmployeeProfile(requestParameters: ArchiveEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.archiveEmployeeProfileRaw(requestParameters, initOverrides);
    }

    async createEmployeeProfileRaw(requestParameters: CreateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EmployeeProfile>> {
        if (requestParameters.employeeProfile === null || requestParameters.employeeProfile === undefined) {
            throw new runtime.RequiredError('employeeProfile','Required parameter requestParameters.employeeProfile was null or undefined when calling createEmployeeProfile.');
        }

        const queryParameters: any = {};
        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/employees`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: EmployeeProfileToJSON(requestParameters.employeeProfile),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => EmployeeProfileFromJSON(jsonValue));
    }

    async createEmployeeProfile(requestParameters: CreateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EmployeeProfile> {
        const response = await this.createEmployeeProfileRaw(requestParameters, initOverrides);
        return await response.value();
    }

    async getEmployeeProfileRaw(requestParameters: GetEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EmployeeProfile>> {
        if (requestParameters.employeeId === null || requestParameters.employeeId === undefined) {
            throw new runtime.RequiredError('employeeId','Required parameter requestParameters.employeeId was null or undefined when calling getEmployeeProfile.');
        }

        const queryParameters: any = {};
        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/employees/{employeeId}`.replace(`{${"employeeId"}}`, encodeURIComponent(String(requestParameters.employeeId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => EmployeeProfileFromJSON(jsonValue));
    }

    async getEmployeeProfile(requestParameters: GetEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EmployeeProfile> {
        const response = await this.getEmployeeProfileRaw(requestParameters, initOverrides);
        return await response.value();
    }

    async listEmployeeProfilesRaw(requestParameters: ListEmployeeProfilesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<EmployeeProfile>>> {
        const queryParameters: any = {};

        if (requestParameters.department !== undefined) {
            queryParameters['department'] = requestParameters.department;
        }

        if (requestParameters.specialization !== undefined) {
            queryParameters['specialization'] = requestParameters.specialization;
        }

        if (requestParameters.status !== undefined) {
            queryParameters['status'] = requestParameters.status;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/employees`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(EmployeeProfileFromJSON));
    }

    async listEmployeeProfiles(requestParameters: ListEmployeeProfilesRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<EmployeeProfile>> {
        const response = await this.listEmployeeProfilesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    async updateEmployeeProfileRaw(requestParameters: UpdateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EmployeeProfile>> {
        if (requestParameters.employeeId === null || requestParameters.employeeId === undefined) {
            throw new runtime.RequiredError('employeeId','Required parameter requestParameters.employeeId was null or undefined when calling updateEmployeeProfile.');
        }

        if (requestParameters.employeeProfile === null || requestParameters.employeeProfile === undefined) {
            throw new runtime.RequiredError('employeeProfile','Required parameter requestParameters.employeeProfile was null or undefined when calling updateEmployeeProfile.');
        }

        const queryParameters: any = {};
        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/employees/{employeeId}`.replace(`{${"employeeId"}}`, encodeURIComponent(String(requestParameters.employeeId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: EmployeeProfileToJSON(requestParameters.employeeProfile),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => EmployeeProfileFromJSON(jsonValue));
    }

    async updateEmployeeProfile(requestParameters: UpdateEmployeeProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EmployeeProfile> {
        const response = await this.updateEmployeeProfileRaw(requestParameters, initOverrides);
        return await response.value();
    }
}

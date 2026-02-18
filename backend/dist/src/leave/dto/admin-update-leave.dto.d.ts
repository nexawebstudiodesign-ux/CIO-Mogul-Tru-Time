export declare class AdminUpdateLeaveDto {
    leaveType?: 'CASUAL' | 'SICK' | 'PAID';
    fromDate?: string;
    toDate?: string;
    reason?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export declare class AdminCreateLeaveDto {
    userId: string;
    leaveType: 'CASUAL' | 'SICK' | 'PAID';
    fromDate: string;
    toDate: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

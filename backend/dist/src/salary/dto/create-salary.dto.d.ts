export declare class CreateMonthlySalaryDto {
    userId: string;
    month: string;
    workingDays?: number;
    baseSalary?: number;
    hra?: number;
    transportAllowance?: number;
    otherAllowance?: number;
    performanceBonus?: number;
    pfDeduction?: number;
    taxDeduction?: number;
    otherDeduction?: number;
}

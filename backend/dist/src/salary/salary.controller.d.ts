import { SalaryService } from './salary.service';
import { CreateMonthlySalaryDto } from './dto/create-salary.dto';
import { UpdateMonthlySalaryDto } from './dto/update-salary.dto';
export declare class SalaryController {
    private readonly salaryService;
    constructor(salaryService: SalaryService);
    create(createSalaryDto: CreateMonthlySalaryDto): Promise<{
        id: any;
        userId: any;
        month: any;
        workingDays: any;
        baseSalary: any;
        hra: any;
        transportAllowance: any;
        otherAllowance: any;
        performanceBonus: any;
        pfDeduction: any;
        taxDeduction: any;
        otherDeduction: any;
        createdAt: any;
    }>;
    findAll(month?: string, userId?: string): Promise<{
        id: any;
        userId: any;
        month: any;
        workingDays: any;
        baseSalary: any;
        hra: any;
        transportAllowance: any;
        otherAllowance: any;
        performanceBonus: any;
        pfDeduction: any;
        taxDeduction: any;
        otherDeduction: any;
        createdAt: any;
    }[]>;
    findOne(id: string): Promise<{
        id: any;
        userId: any;
        month: any;
        workingDays: any;
        baseSalary: any;
        hra: any;
        transportAllowance: any;
        otherAllowance: any;
        performanceBonus: any;
        pfDeduction: any;
        taxDeduction: any;
        otherDeduction: any;
        createdAt: any;
    }>;
    update(id: string, updateSalaryDto: UpdateMonthlySalaryDto): Promise<{
        id: any;
        userId: any;
        month: any;
        workingDays: any;
        baseSalary: any;
        hra: any;
        transportAllowance: any;
        otherAllowance: any;
        performanceBonus: any;
        pfDeduction: any;
        taxDeduction: any;
        otherDeduction: any;
        createdAt: any;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

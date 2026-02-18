import { SupabaseService } from '../supabase/supabase.service';
import { CreateMonthlySalaryDto } from './dto/create-salary.dto';
import { UpdateMonthlySalaryDto } from './dto/update-salary.dto';
export declare class SalaryService {
    private supabase;
    constructor(supabase: SupabaseService);
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
    private mapToDto;
}

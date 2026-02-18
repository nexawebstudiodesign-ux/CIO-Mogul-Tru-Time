"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryController = void 0;
const common_1 = require("@nestjs/common");
const salary_service_1 = require("./salary.service");
const create_salary_dto_1 = require("./dto/create-salary.dto");
const update_salary_dto_1 = require("./dto/update-salary.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/roles.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_enum_1 = require("../common/roles.enum");
let SalaryController = class SalaryController {
    constructor(salaryService) {
        this.salaryService = salaryService;
    }
    create(createSalaryDto) {
        return this.salaryService.create(createSalaryDto);
    }
    findAll(month, userId) {
        return this.salaryService.findAll(month, userId);
    }
    findOne(id) {
        return this.salaryService.findOne(id);
    }
    update(id, updateSalaryDto) {
        return this.salaryService.update(id, updateSalaryDto);
    }
    remove(id) {
        return this.salaryService.remove(id);
    }
};
exports.SalaryController = SalaryController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_salary_dto_1.CreateMonthlySalaryDto]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_salary_dto_1.UpdateMonthlySalaryDto]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalaryController.prototype, "remove", null);
exports.SalaryController = SalaryController = __decorate([
    (0, common_1.Controller)('salary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [salary_service_1.SalaryService])
], SalaryController);
//# sourceMappingURL=salary.controller.js.map
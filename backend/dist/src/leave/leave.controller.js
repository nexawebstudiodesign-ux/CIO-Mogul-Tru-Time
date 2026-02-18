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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const apply_leave_dto_1 = require("./dto/apply-leave.dto");
const update_leave_status_dto_1 = require("./dto/update-leave-status.dto");
const admin_create_leave_dto_1 = require("./dto/admin-create-leave.dto");
const admin_update_leave_dto_1 = require("./dto/admin-update-leave.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/roles.guard");
const roles_decorator_1 = require("../common/roles.decorator");
const roles_enum_1 = require("../common/roles.enum");
let LeaveController = class LeaveController {
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    apply(req, dto) {
        return this.leaveService.applyLeave(req.user?.id ?? '', dto);
    }
    listMine(req) {
        return this.leaveService.listMyLeaves(req.user?.id ?? '');
    }
    cancelLeave(req, id) {
        return this.leaveService.cancelLeave(req.user?.id ?? '', id);
    }
    listAll(status) {
        return this.leaveService.listAllLeaves(status);
    }
    adminCreate(dto) {
        return this.leaveService.adminCreateLeave(dto);
    }
    adminUpdate(id, dto) {
        return this.leaveService.adminUpdateLeave(id, dto);
    }
    adminDelete(id) {
        return this.leaveService.adminDeleteLeave(id);
    }
    updateStatus(id, dto) {
        return this.leaveService.updateStatus(id, dto);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.USER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, apply_leave_dto_1.ApplyLeaveDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.USER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "listMine", null);
__decorate([
    (0, common_1.Delete)('cancel/:id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.USER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "cancelLeave", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "listAll", null);
__decorate([
    (0, common_1.Post)('admin'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_create_leave_dto_1.AdminCreateLeaveDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "adminCreate", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_update_leave_dto_1.AdminUpdateLeaveDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "adminUpdate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "adminDelete", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(roles_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_status_dto_1.UpdateLeaveStatusDto]),
    __metadata("design:returntype", void 0)
], LeaveController.prototype, "updateStatus", null);
exports.LeaveController = LeaveController = __decorate([
    (0, common_1.Controller)('leave'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map
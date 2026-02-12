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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCreateLeaveDto = void 0;
const class_validator_1 = require("class-validator");
class AdminCreateLeaveDto {
    userId;
    leaveType;
    fromDate;
    toDate;
    reason;
    status;
}
exports.AdminCreateLeaveDto = AdminCreateLeaveDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdminCreateLeaveDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['CASUAL', 'SICK', 'PAID']),
    __metadata("design:type", String)
], AdminCreateLeaveDto.prototype, "leaveType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminCreateLeaveDto.prototype, "fromDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdminCreateLeaveDto.prototype, "toDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AdminCreateLeaveDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['PENDING', 'APPROVED', 'REJECTED']),
    __metadata("design:type", String)
], AdminCreateLeaveDto.prototype, "status", void 0);
//# sourceMappingURL=admin-create-leave.dto.js.map
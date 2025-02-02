"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTailorResponse = toTailorResponse;
function toTailorResponse(tailor) {
    return {
        id: tailor.id, // Assuming 'id' exists in the 'Tailor' object
        firstname: tailor.firstname,
        lastname: tailor.lastname || null, // Use null for optional fields if no value is provided
        email: tailor.email,
        phoneNumber: tailor.phoneNumber,
        provinceId: tailor.provinceId,
        regencyId: tailor.regencyId,
        districtId: tailor.districtId,
        villageId: tailor.villageId,
        addressDetail: tailor.addressDetail,
        workEstimation: tailor.workEstimation,
        priceRange: tailor.priceRange,
        specialization: tailor.specialization, // Assumes specialization is an array in 'Tailor'
        businessDescription: tailor.businessDescription,
        profilePicture: tailor.profilePicture || null,
        certificate: tailor.certificate,
        createdAt: tailor.createdAt,
        token: tailor.token || null // Handle optional token field
    };
}

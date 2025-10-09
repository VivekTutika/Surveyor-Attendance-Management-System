"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadAttendancePhoto = void 0;
const cloudinary_1 = require("cloudinary");
const index_1 = __importDefault(require("./index"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: index_1.default.cloudinary.cloudName,
    api_key: index_1.default.cloudinary.apiKey,
    api_secret: index_1.default.cloudinary.apiSecret,
});
// Upload function for attendance photos
const uploadAttendancePhoto = async (fileBuffer, userId, type) => {
    try {
        const result = await new Promise((resolve, reject) => {
            cloudinary_1.v2.uploader.upload_stream({
                folder: `sams/${type}`,
                public_id: `${userId}_${type}_${Date.now()}`,
                resource_type: 'image',
                format: 'jpg',
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto:good' }
                ],
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            }).end(fileBuffer);
        });
        return result.secure_url;
    }
    catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};
exports.uploadAttendancePhoto = uploadAttendancePhoto;
// Delete function for removing images
const deleteImage = async (publicId) => {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};
exports.deleteImage = deleteImage;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map
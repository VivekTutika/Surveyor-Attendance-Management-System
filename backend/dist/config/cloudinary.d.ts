import { v2 as cloudinary } from 'cloudinary';
export declare const uploadAttendancePhoto: (fileBuffer: Buffer, userId: string, type: "attendance" | "bike-meter") => Promise<string>;
export declare const deleteImage: (publicId: string) => Promise<void>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map
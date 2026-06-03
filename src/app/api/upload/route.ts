// ─────────────────────────────────────────────────────────────
// src/app/api/upload/route.ts
// Cloudinary Upload API
// ─────────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/utils";
import type { UploadResponse } from "@/types";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Constants
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_SIZE_BYTES = parseInt(
  process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE ?? "5242880",
  10
);

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER ?? "om-alnour";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return apiError("غير مصرح", 401);
  }

  try {
    const cfg = cloudinary.config();

    console.log("Cloudinary Config:", {
      cloud_name: cfg.cloud_name,
      hasApiKey: !!cfg.api_key,
      hasSecret: !!cfg.api_secret,
    });

    if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
      return apiError("Cloudinary غير مهيأ", 503);
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("لم يتم اختيار ملف", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return apiError(
        "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WEBP أو GIF",
        415
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
  return apiError(
    "حجم الصورة كبير جداً. الحد الأقصى المسموح هو 2 ميجابايت",
    413
  );
}

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          resource_type: "image",
          overwrite: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    const data: UploadResponse = {
      url: result.secure_url,
      filename: result.public_id,
    };

    return apiSuccess(data, 201);
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    return apiError(
      "حدث خطأ أثناء رفع الصورة",
      500
    );
  }
}
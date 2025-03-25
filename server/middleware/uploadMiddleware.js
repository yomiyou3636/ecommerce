import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter,
});

const compressImage = async (filePath) => {
  try {
    const parsedPath = path.parse(filePath);
    const compressedPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}-compressed${parsedPath.ext}`
    );

    console.log(`Compressing image from: ${filePath}`);
    console.log(`Temporary compressed file path: ${compressedPath}`);

    await sharp(filePath)
      .resize(800, 800, { fit: "inside" })
      .jpeg({ quality: 80 })
      .toFile(compressedPath);

    fs.renameSync(compressedPath, filePath);
    console.log(`Compression successful, original file replaced.`);
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};

export { upload, compressImage };

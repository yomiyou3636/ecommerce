import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the uploads directory (adjust the relative path as needed)
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure the uploads directory exists; if not, create it.
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
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

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Create the Multer upload instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter,
});

// Function to compress the image using Sharp
const compressImage = async (filePath) => {
  try {
    // Parse the file path to get directory, filename, and extension
    const parsedPath = path.parse(filePath);
    // Create a temporary file path (appending '-compressed' before the extension)
    const compressedPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}-compressed${parsedPath.ext}`
    );

    console.log(`Compressing image from: ${filePath}`);
    console.log(`Temporary compressed file path: ${compressedPath}`);

    // Use sharp to resize and compress the image, and write to the temporary path
    await sharp(filePath)
      .resize(800, 800, { fit: "inside" })
      .jpeg({ quality: 80 })
      .toFile(compressedPath);

    // Replace the original file with the compressed file
    fs.renameSync(compressedPath, filePath);
    console.log(`Compression successful, original file replaced.`);
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};

export { upload, compressImage };

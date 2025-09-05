import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/profile_pictures/"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const mail = req.body.email;
    const username = mail.split("@")[0];
    const usernameMail = username || "guest";

    const customName = "user-" + usernameMail + Date.now() + ext;

    cb(null, customName);

    req.savedFileName = customName;
  },
});

export const upload = multer({ storage });

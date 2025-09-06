import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

//----------------------------Profile-----------------------------

const registerProfileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/profile_pictures/"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const mail = req.body.email;
    const username = mail.split("@")[0];
    const usernameMail = username || "guest";

    const customName = "user-" + usernameMail + "-" + Date.now() + ext;

    cb(null, customName);

    req.savedFileName = customName;
  },
});

const updateProfileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/profile_pictures/"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const mail = req.user.email;
    const username = mail.split("@")[0];
    const usernameMail = username || "guest";

    const customName = "user-" + usernameMail + "-" + Date.now() + ext;

    cb(null, customName);

    req.savedFileName = customName;
  },
});

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/posts/"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const userId = req.user.id;

    const customName = "user-" + userId + "-" + Date.now() + ext;

    console.log(customName);

    cb(null, customName);
  },
});

//----------------------------Exports-----------------------------

export const registerUploadProfile = multer({
  storage: registerProfileStorage,
});

export const updateUploadProfile = multer({ storage: updateProfileStorage });

export const uploadPost = multer({ storage: postStorage });

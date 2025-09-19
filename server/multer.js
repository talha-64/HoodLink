import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

//----------------------------Profile (Register)-----------------------------
const registerProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    try {
      const ext = file.originalname.split(".").pop();
      const mail = req.body.email;
      const username = mail?.split("@")[0] || "guest";

      const customName = `user-${username}-${Date.now()}.${ext}`;
      req.savedFileName = customName;

      console.log("CloudinaryStorage params:", {
        fileOriginalName: file.originalname,
        customName,
        folder: "profile_pictures",
      });

      return {
        folder: "profile_pictures",
        public_id: customName.replace(/\.[^/.]+$/, ""),
        resource_type: "image",
      };
    } catch (err) {
      console.error("Error in CloudinaryStorage params:", err);
      throw err;
    }
  },
});

//----------------------------Profile (Update)-----------------------------
const updateProfileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop();
    const mail = req.user?.email;
    const username = mail?.split("@")[0] || "guest";

    const customName = `user-${username}-${Date.now()}.${ext}`;
    req.savedFileName = customName;

    return {
      folder: "profile_pictures",
      public_id: customName.replace(/\.[^/.]+$/, ""),
      resource_type: "image",
    };
  },
});

//----------------------------Posts-----------------------------
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop();
    const userId = req.user?.id || "guest";

    const customName = `user-${userId}-${Date.now()}.${ext}`;

    return {
      folder: "posts",
      public_id: customName.replace(/\.[^/.]+$/, ""),
      resource_type: "image",
    };
  },
});

//----------------------------Exports-----------------------------
export const registerUploadProfile = multer({
  storage: registerProfileStorage,
});
export const updateUploadProfile = multer({ storage: updateProfileStorage });
export const uploadPost = multer({ storage: postStorage });

// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";

// export const __filename = fileURLToPath(import.meta.url);
// export const __dirname = path.dirname(__filename);

// //----------------------------Profile-----------------------------

// const registerProfileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads/profile_pictures/"));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);

//     const mail = req.body.email;
//     const username = mail.split("@")[0];
//     const usernameMail = username || "guest";

//     const customName = "user-" + usernameMail + "-" + Date.now() + ext;

//     cb(null, customName);

//     req.savedFileName = customName;
//   },
// });

// const updateProfileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads/profile_pictures/"));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);

//     const mail = req.user.email;
//     const username = mail.split("@")[0];
//     const usernameMail = username || "guest";

//     const customName = "user-" + usernameMail + "-" + Date.now() + ext;

//     cb(null, customName);

//     req.savedFileName = customName;
//   },
// });

// const postStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads/posts/"));
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);

//     const userId = req.user.id;

//     const customName = "user-" + userId + "-" + Date.now() + ext;

//     cb(null, customName);
//   },
// });

// //----------------------------Exports-----------------------------

// export const registerUploadProfile = multer({
//   storage: registerProfileStorage,
// });

// export const updateUploadProfile = multer({ storage: updateProfileStorage });

// export const uploadPost = multer({ storage: postStorage });

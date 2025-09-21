# HoodLink - A Local Community Collaboration App  

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)    
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)    
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)    
[![Express.js](https://img.shields.io/badge/Express.js-backend-black?logo=express)](https://expressjs.com/)    
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)  

---

## 🎥 Demo Video  
📌 Watch the demo here

[![Alt Text](https://github.com/user-attachments/assets/18ef0c42-b8f6-4c73-8264-71d7ddda1cc4)](https://github.com/user-attachments/assets/7468c5be-1403-477a-bfa3-47fe197bca7f)

---

## 📖 About the Project  

**HoodLink** is a full-stack community collaboration app where neighbors can:  
- Create posts and interact through comments
- Share events  
- Chat with each other  
- Connect within their neighborhood  

It is built with **React (Frontend)**, **Express.js + PostgreSQL (Backend)**, and **Cloudinary** for media storage.  

---

## 🚀 Features  

- 🔑 **Authentication** (Register, Login, JWT-based secure access)  
- 👤 **User Profiles** (Update info, change password, delete account, upload and update profile photos via Cloudinary)  
- 🏘 **Neighborhoods** (View available neighborhoods)  
- 📝 **Posts** (Create, update, search, filter, delete posts with images)  
- 💬 **Comments** (Add, update, delete comments on posts)  
- 📅 **Events** (Create, update, search, filter, delete events in neighborhood)  
- 💌 **Chat** (Send messages, list conversations)  

---

## 📂 Project Structure  

```bash
hoodlink/
│
├── client/                     # Frontend (React + Vite + Tailwind)
│   ├── public/                 # Static assets
│   ├── src/                    # Source files
│   │   ├── assets/             # Images, logos, icons
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React Context API
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Application pages
│   │   ├── App.jsx             # Root component
│   │   └── main.jsx            # Entry point
│   ├── .env                    # Environment variables (VITE_API_URL)
│   └── package.json            # Frontend dependencies
│
├── server/                     # Backend (Node.js + Express + PostgreSQL)
│   ├── controllers/            # Business logic
│   ├── middlewares/            # Authentication, Multer, error handling
│   ├── routes/                 # Express routes
│   ├── index.js    # Entry point
│   ├── .env                    # Environment variables
│   └── package.json            # Backend dependencies
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔧 Tech Stack  

- **Frontend:** React.js, Axios, TailwindCSS, Shadcn UI
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL  
- **Authentication:** JWT  
- **Media Storage:** Cloudinary  

---

## 📡 API Endpoints  

### 👤 Users (`/api/users`)  
- `POST /register` → Register a new user (with profile avatar)  
- `POST /login` → Login user  
- `GET /profile` → Get user profile (JWT required)  
- `PUT /profile` → Update profile info  
- `PUT /profilePhoto` → Update profile photo (Cloudinary)  
- `PUT /password` → Change password  
- `GET /neighbors` → View neighbors in same neighborhood  
- `DELETE /user` → Delete user account  

---

### 🏘 Neighborhood (`/api/neighborhood`)  
- `GET /getAllNeighborhoods` → Fetch all neighborhoods  

---

### 📝 Posts (`/api/post`)  
- `POST /` → Create a new post (with up to 3 images)  
- `GET /allPosts` → Get all neighborhood posts  
- `GET /myPosts` → Get user’s own posts  
- `GET /search` → Search posts in neighborhood  
- `GET /searchMyPosts` → Search user’s own posts 
- `PUT /:postId` → Update a post (with images)  
- `DELETE /:postId` → Delete a post

---

### 💬 Comments (`/api/post/comments`)  
- `POST /:postId/comments` → Add comment to a post  
- `GET /:postId/comments` → Get comments for a post  
- `PUT /comments/:id` → Update comment  
- `DELETE /comments/:id` → Delete comment  

---

### 📅 Events (`/api/events`)  
- `POST /` → Create new event  
- `GET /allEvents` → Get all neighborhood events  
- `GET /myAllEvents` → Get user’s own events  
- `GET /search` → Search events in neighborhood  
- `GET /searchMyEvents` → Search user’s own events    
- `PUT /:eventId` → Update event  
- `DELETE /:eventId` → Delete event   

---

### 💌 Chat (`/api/chat`)  
- `POST /send` → Send a new message  
- `GET /conversations` → List user’s conversations  
- `GET /:conversationId/messages` → Get messages of a conversation    

---

## ⚙️ Getting Started  

### 1️⃣ Clone the repository  
```bash
git clone https://github.com/talha-64/HoodLink
cd hoodlink
```

### 2️⃣ Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3️⃣ Environment Variables
Create .env files for server and client.

#### Server (server/.env)
```bash
DB_USER = xxxxxxx
DB_PASS = xxxxxxx
DB_HOST = xxxxxxx
DB_PORT = xxxxxxx
DB_NAME = xxxxxxx
PORT = xxxxxxx
JWT_SECRET = xxxxxxx
ACCESS_TOKEN_TTL= xxxxxxx
CLOUDINARY_CLOUD_NAME = xxxxxxx
CLOUDINARY_API_KEY = xxxxxxx
CLOUDINARY_API_SECRET = xxxxxxx
```

#### Client (client/.env)
```bash
VITE_API_URL= xxxxxxx
```

### 4️⃣ Run the project
```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

## 📜 License  

This project is licensed under the [MIT License](LICENSE).  

---

## 📬 Contact  

👤 **Muhammad Talha**  

- LinkedIn: [muhammad-talha-m](https://www.linkedin.com/in/muhammad-talha-m/)  
- Email: muhammadtalha0569@gmail.com


### AI-Assisted Complaint Management System - Backend

This is the backend for the **AI-Assisted Complaint Management System**,
built with **Node.js, Express.js, TypeScript, and MongoDB**.
 It provides a robust API for managing complaints, user authentication, and AI-based chatbot assistance.

## 📌 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/complaint-management-backend.git
cd complaint-management-backend
```
### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Create a `.env` File
Create a `.env` file in the root directory and add the following:

```env
PORT=3000
MONGO_URI=mongodb+srv://your-db-url
JWT_SECRET=your_jwt_secret
```

### 4️⃣ Start the Server
```sh
npm run dev
```
The backend will start on **`http://localhost:3000`**.

---

## 📌 API Endpoints

### 🔹 Authentication
| Method | Endpoint           | Description               | Access |
|--------|-------------------|--------------------------|--------|
| POST   | `/api/auth/register` | Register a new user      | Public |
| POST   | `/api/auth/login`    | Login & get JWT token    | Public |
| POST   | `/api/auth/logout`   | Logout user              | User   |

### 🔹 User Management
| Method | Endpoint              | Description              | Access |
|--------|----------------------|--------------------------|--------|
| GET    | `/api/users`         | Get all users            | Admin  |
| GET    | `/api/users/current-user`     | Get a single user        | Admin or User |
| DELETE | `/api/users/delete-user`     | Delete a user            | Admin  or User |
| DELETE | `/api/users/delete-user`     | Uodate a user            |  User |

### 🔹 Complaint Management
| Method | Endpoint                 | Description                        | Access  |
|--------|-------------------------|------------------------------------|---------|
| POST   | `/api/complaints`        | Submit a new complaint            | User    |
| GET    | `/api/complaints`        | Get all complaints                | Admin   |
| GET    | `/api/complaints/:id`    | Get a specific complaint          | Admin   |
| PUT    | `/api/complaints/:id`    | Update complaint status           | Handler |
| DELETE | `/api/complaints/:id`    | Delete complaint                  | Admin   |

---

## 📌 Role-Based Access Control (RBAC)

This project includes **middleware** to enforce role-based access.

### Roles & Permissions
| Role              | Permissions                                 |
|------------------|------------------------------------------|
| **Admin**        | Manage users, view analytics, delete complaints |
| **User**         | Submit & track complaints              |
| **Complaint Handler** | Resolve complaints                  |

### Middleware for Role Protection
```ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

// Authenticate user
export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access denied" });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Role authorization
export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
```

### Protecting Routes
```ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/admin-dashboard", authenticateUser, authorizeRoles(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

export default router;
```

---

## 📌 Folder Structure
```
📦 complaint-management-backend
 ┣ 📂 src
 ┃ ┣ 📂 controllers
 ┃ ┃ ┣ 📜 authController.ts
 ┃ ┃ ┣ 📜 userController.ts
 ┃ ┃ ┣ 📜 complaintController.ts
 ┃ ┣ 📂 middleware
 ┃ ┃ ┣ 📜 authMiddleware.ts
 ┃ ┣ 📂 models
 ┃ ┃ ┣ 📜 User.ts
 ┃ ┃ ┣ 📜 Complaint.ts
 ┃ ┣ 📂 routes
 ┃ ┃ ┣ 📜 authRoutes.ts
 ┃ ┃ ┣ 📜 userRoutes.ts
 ┃ ┃ ┣ 📜 complaintRoutes.ts
 ┃ ┣ 📜 server.ts
 ┣ 📜 package.json
 ┣ 📜 tsconfig.json
 ┣ 📜 .env
 ┣ 📜 README.md
```

---

## 📌 Deployment

### 1️⃣ Deploy on Render/
- Update **CORS** settings to allow frontend requests.
- Set up **MongoDB Atlas** for cloud database.
- Use `pm2` for process management.




---

## 📌 Future Improvements
- 🔹 AI-based complaint resolution
- 🔹 Real-time notifications with WebSockets
- 🔹 Admin dashboard for reports & analytics

---

## 💡 Contributing
1. Fork the repo
2. Create a new branch: `git checkout -b feature-branch`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature-branch`
5. Submit a pull request 🎉

---


🚀 **Enjoy building your AI-Assisted Complaint Management System!** 🚀


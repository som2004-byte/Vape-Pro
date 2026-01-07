# VapeSmart - E-Commerce Platform

A modern, full-stack e-commerce application for vaping products, featuring a 3D immersive user interface, real-time order tracking, and a comprehensive admin dashboard.

## 🚀 Live Demo
[Insert Live Link Here]

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React.js](https://reactjs.org/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **3D Graphics**: [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **State Management**: React Hooks (Context API / Local Storage)
- **Routing**: React Router DOM

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt.js
- **Email Service**: Nodemailer

## ✨ Key Features

- **Immersive 3D UI**: Interactive product showcases using Three.js logic.
- **Secure Authentication**: User and Admin login with JWT-based session management.
- **Shopping Cart**: Fully functional cart with local persistence and backend synchronization.
- **Order Management**: 
  - Real-time order placement.
  - Admin dashboard for status updates (Processing -> Shipped -> Delivered).
  - Live status notifications for users (Polling & Toasts).
- **Admin Dashboard**:
  - Secure admin login.
  - Product management (CRUD).
  - Order visualization and status control.
- **Responsive Design**: Mobile-first architecture using Tailwind CSS.

## 📂 Project Structure

```
Vape-Pro/
├── Frontend/           # React Client Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── utils/      # Helper functions & API Config
│   │   └── App.jsx     # Main Application Entry
├── Backend/            # Node.js Express Server
│   ├── models/         # Mongoose Database Schemas
│   ├── routes/         # REST API Routes
│   └── index.js        # Server Entry Point
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Vape-Pro.git
   cd Vape-Pro
   ```

2. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd Backend
   npm install
   # Create a .env file with your credentials
   npm run dev
   ```

## 🔒 Environment Variables

Create a `.env` file in the `Backend` directory:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
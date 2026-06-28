# 🏦 BankFlow 

BankFlow is a premium, modern digital banking web application built with the MERN stack. It features a stunning glassmorphic user interface with native light/dark mode toggling, real-time interactive dashboards, multi-credential authorization, and automated transaction fraud detection.

---

## ✨ Features

### 🔐 Advanced Security & Multi-Credential Auth
- **Flexible Login**: Sign in using your **Email**, **Phone Number**, **Aadhaar Card**, or **PAN Card** identifier.
- **Verification Engine**: Native OTP verification (sent via email) secures high-level operations like withdrawals and fund transfers.
- **Registration Safeguards**: Full validation for Aadhaar (12-digit numeric) and PAN (10-character alphanumeric Indian IT Department standards) details.

### 🎨 Premium UI/UX Design
- **Class-Based Dark Mode**: A responsive dark mode configuration designed dynamically inside Tailwind CSS and Redux state.
- **Aesthetic Backdrop Illustrations**: Stunning money-flow visual graphics embedded directly into the login and signup panels.
- **Adaptive Components**: Fully customized inputs, custom badges, glassmorphic cards, and loaders.

### 📈 Inner Banking Services
- **Personalized Dashboard**: High-level details cards displaying real-time balance metrics, recent transactions, and custom quick action toggles.
- **Deposit & Withdraw**: Smooth interfaces to top up balance or initiate withdrawals (OTP protected).
- **Secure Fund Transfers**: Send funds directly to other registered users by typing their account number, verified instantly prior to authorization.
- **Interactive History**: View complete transactions ledger, apply filters (type, status, date), and page through records.

### 🛡️ Admin & Fraud Detection Panel
- **User Directory**: List all banking accounts, monitor verification status, and check active balances.
- **Admin Suspension**: Instantly suspend or unsuspend any user account to freeze transactions.
- **Automated Fraud Rules**: Embedded engine flag potential malicious transactions (high value or excessive rates) and displays warnings on the dashboard.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Redux Toolkit, Lucide Icons, React Hot Toast
- **Backend**: Node.js, Express, MongoDB Atlas (Mongoose ODM), JWT, nodemailer

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB community server)
- SMTP Gmail account (for OTP email dispatch)

### 1. Repository Setup
Clone the repository:
```bash
git clone https://github.com/ashishyadav9696/Bankflow.git
cd Bankflow
```

### 2. Backend Configuration
Navigate to the `server/` directory and configure the environment variables:
```bash
cd server
npm install
```
Create a `.env` file inside `server/` with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
Start the backend server in development mode:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the `client/` directory and initialize the client package:
```bash
cd ../client
npm install
```
Start the Vite development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 👨‍💻 Author
- **Ashish Yadav** - [GitHub Profile](https://github.com/ashishyadav9696)

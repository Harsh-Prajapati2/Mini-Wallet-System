# Mini Wallet System

A full-stack web application designed to simulate core digital wallet functionalities. Users can register, manage their funds (credit/debit), and view detailed transaction histories with filtering and visualization.

## Features

- **User Authentication**: Secure registration and login using JWT.
- **Wallet Dashboard**:
  - View real-time balance.
  - Add money (Credit) and deduct money (Debit).
  - Transaction history with sorting and filtering (by type and date).
- **Expense Analysis**:
  - Monthly summary view.
  - Daily spending charts for specific months.
- **Responsive UI**: Clean and modern interface built with React.

## Tech Stack

- **Frontend**: React.js (Vite), CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running (or a MongoDB Atlas URI)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET_KEY=your_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

- **Users**: Stores user details (Name, Email, Password, Aadhar, Mobile).
- **Wallets**: Stores current balance and links to User.
- **Transactions**: Stores individual transaction records (Amount, Type, Date, Description, Balance Snapshot).
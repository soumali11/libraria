# Libraria

Libraria is a full stack library book issue and return management system designed to make borrowing, returning, tracking, and managing books simple and interactive.

## Task

Library Book Issue & Return Management System

The system supports QR based book scanning, book availability management, issue and return records, borrowed book tracking, and an Admin Dashboard for monitoring library activity.

## Features

### Book Management

- View all available books
- Search books by title, author, or category
- View book availability
- Add new books
- Edit existing books
- Delete books
- Manage total and available copies
- Generate QR codes for books
- Download book QR codes as PNG images

### QR Code Scanning

- Scan book QR codes using the device camera
- Scan QR codes from gallery images
- Automatically identify books using their Book ID
- Display book details after scanning
- Issue books directly through the QR workflow
- Return books through the QR workflow

### Issue and Return Management

- Issue available books to registered users
- Prevent issuing books when no copies are available
- Automatically update available copies
- Return borrowed books
- Automatically restore available copies after return
- Maintain issue and return transaction records

### My Library

- View currently borrowed books
- View borrowed book details
- Select individual books
- Return borrowed books
- Interactive 3D personal library experience

### Admin Dashboard

The Admin Dashboard provides:

- Total Books
- Total Copies
- Available Copies
- Currently Issued Books
- Total Transactions
- Issued and returned transaction tracking
- Transaction search
- Status filtering
- Date filtering
- Dashboard refresh
- Downloadable CSV transaction reports

### Interactive Interface

- Responsive library interface
- Dark and light theme support
- Interactive 3D library environment
- Interactive 3D book collection
- Animated book selection
- Hover interactions
- Cinematic lighting and particle effects

## Technology Stack

### Frontend

- React
- Vite
- React Router
- React Three Fiber
- Three.js
- React Three Drei
- html5-qrcode
- qrcode.react

### Backend

- Node.js
- Express.js
- MongoDB

## Project Structure

```text
Libraria/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── 3d/
│   │   ├── App.jsx
│   │   ├── ImmersiveLibraryScene.jsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
│
└── README.md
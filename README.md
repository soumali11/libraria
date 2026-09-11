# 📚 Libraria — Smart Library Management System

Libraria is a modern full-stack library management platform designed to make book discovery, issuing, returning, tracking, and administration faster and more interactive.

The system combines a responsive React interface, QR-based book management, role-based access control, MongoDB persistence, automated loan tracking, an administrator dashboard, and an AI-powered library assistant called **Lira**.

---

## ✨ Live Application

🌐 Live Demo: https://libraria-dusky.vercel.app

🔗 Backend API: https://libraria-backend-zums.onrender.com

---

## 🎯 Project Overview

Traditional library systems often rely on manual searching, paper-based records, and separate processes for book availability and borrowing.

Libraria brings these operations into one digital platform.

Users can:

- Browse available books
- Search and filter the catalogue
- Explore books by category
- Scan QR codes to issue and return books
- Track currently borrowed books
- View loan due dates
- Monitor overdue books
- View personal borrowing history
- Interact with an AI library assistant

Librarians can additionally:

- Add new books
- Edit book information
- Delete books
- Track all issued books
- Monitor availability
- View transactions
- Filter transactions
- Generate CSV reports
- Monitor overdue loans
- Manage the complete library catalogue

---

# 🚀 Key Features

## 📖 Digital Book Catalogue

Libraria provides a searchable digital catalogue containing:

- Book ID
- Title
- Author
- Category
- Total copies
- Available copies
- Book cover
- QR code

The catalogue dynamically reflects book availability.

---

## 🔍 Smart Book Search

Users can quickly search the catalogue by:

- Book title
- Author
- Book ID
- Category

The interface provides responsive filtering so users can find books without navigating through large lists.

---

## 📱 QR-Based Book Issue & Return

Each book can be associated with a QR code.

Users can:

1. Open the QR scanner
2. Scan a book's QR code
3. Identify the corresponding book
4. Issue or return the book
5. Automatically update availability

QR codes can also be generated for newly added books.

---

## 📷 QR Gallery Scanning

Libraria supports both:

- Camera-based QR scanning
- QR image/gallery scanning

This makes the system usable even when a physical camera scan is not convenient.

---

# 👥 Role-Based Access Control

Libraria supports two types of users.

## 🎓 Student

Students can:

- Browse books
- Search the catalogue
- Issue available books
- Return borrowed books
- View their library
- Track due dates
- View their transaction history
- Use Lira AI

Students cannot:

- Add books
- Edit books
- Delete books
- Access librarian-only catalogue management

---

## 🧑‍💼 Librarian

Librarians have full catalogue and administrative access.

They can:

- Add books
- Edit books
- Delete books
- Generate QR codes
- Monitor all transactions
- Track issued books
- Track returned books
- View overdue loans
- Filter transactions
- Download reports
- Monitor library statistics

---

# 🛡️ Borrowing Protection

Libraria prevents a student from issuing the same book while they already have an active issue for that book.

The backend validates active transactions before allowing another issue.

This prevents duplicate active borrowing records even if the frontend is bypassed.

---

# ⏳ Loan Tracking

Every issued book receives a loan period.

Libraria automatically tracks:

- Issue date
- Due date
- Current loan status
- Days overdue
- Due-soon books
- Returned status

The dashboard provides a dedicated loan health section for monitoring active loans.

---

# 📊 Librarian Dashboard

The administrator dashboard provides a centralized view of library activity.

### Library Statistics

- Total Books
- Total Copies
- Available Copies
- Currently Issued
- Total Transactions
- Overdue Books

### Transaction Management

Librarians can:

- Search transactions
- Filter by status
- Filter by date
- Track issued books
- Track returned books
- View borrower information
- Download transaction reports

---

# 📑 Downloadable Reports

Libraria supports CSV report generation.

Reports can contain:

- Transaction ID
- Book ID
- Book title
- Student name
- Student ID
- Transaction status
- Issue date
- Return date
- Due date
- Days overdue

This allows librarians to maintain offline records and perform further analysis.

---

# 🤖 Lira — AI Library Assistant

Libraria includes **Lira**, an AI-powered library assistant.

Lira can help users:

- Recommend books
- Find books by topic
- Explain what books are available
- Answer catalogue-related questions
- Help users understand their library activity

Example prompts:

> What books are available right now?

> Recommend a book for someone interested in psychology.

> Which books are related to finance?

> What books can I read about habits?

Lira uses the Libraria catalogue as context so that its responses are connected to the actual library collection.

---

# 🎨 Immersive User Interface

Libraria is designed to feel more like a modern digital library than a traditional CRUD application.

The interface includes:

- Glassmorphism UI
- Responsive layouts
- Animated interactions
- 3D book cards
- Interactive category sections
- Dynamic book covers
- 3D library elements
- Gradient lighting
- Ambient backgrounds
- Interactive buttons
- Hover effects
- Responsive navigation
- Dark immersive visual design

The goal is to combine functionality with a distinctive user experience.

---

# 🧱 Technology Stack

## Frontend

- React
- Vite
- React Router
- React Three Fiber
- Drei
- CSS
- QR scanning libraries

## Backend

- Node.js
- Express.js
- MongoDB Driver
- CORS
- dotenv
- REST API

## Database

- MongoDB Atlas

## AI

- Google Gemini API
- Lira AI Assistant

## Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Libraria UI     │
                    │   React + Vite       │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend    │
                    │      Node.js         │
                    └───────┬───────┬──────┘
                            │       │
                  ┌─────────┘       └──────────┐
                  ▼                            ▼
        ┌──────────────────┐        ┌──────────────────┐
        │   MongoDB Atlas  │        │   Google Gemini  │
        │   Books + Loans  │        │       Lira       │
        │   Transactions   │        │   AI Assistant   │
        └──────────────────┘        └──────────────────┘
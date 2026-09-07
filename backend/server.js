const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
const client = new MongoClient(process.env.MONGO_URI);

let db;
let booksCollection;
let transactionsCollection;

// ===============================
// CONNECT TO MONGODB
// ===============================

async function connectDB() {
    try {
        await client.connect();

        db = client.db("library_management");

        booksCollection = db.collection("books");
        transactionsCollection = db.collection("transactions");

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Library Management System API is running!"
    });
});

// ===============================
// GET ALL BOOKS
// ===============================

app.get("/api/books", async (req, res) => {
    try {
        const books = await booksCollection
            .find()
            .toArray();

        res.json(books);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch books"
        });
    }
});

// ===============================
// ADD A NEW BOOK
// ===============================

app.post("/api/books", async (req, res) => {
    try {
        const {
            title,
            author,
            bookId,
            category,
            totalCopies
        } = req.body;

        // Check required fields
        if (
            !title ||
            !author ||
            !bookId ||
            !category ||
            !totalCopies
        ) {
            return res.status(400).json({
                message: "All book fields are required"
            });
        }

        // Convert copies to number
        const copies = Number(totalCopies);

        if (copies <= 0) {
            return res.status(400).json({
                message: "Total copies must be greater than 0"
            });
        }

        // Check duplicate Book ID
        const existingBook = await booksCollection.findOne({
            bookId: bookId
        });

        if (existingBook) {
            return res.status(409).json({
                message: "Book ID already exists"
            });
        }

        // Create new book
        const newBook = {
            title: title,
            author: author,
            bookId: bookId,
            category: category,
            totalCopies: copies,
            availableCopies: copies,
            issuedCopies: 0,
            status: "Available",
            createdAt: new Date()
        };

        // Insert into MongoDB
        const result = await booksCollection.insertOne(newBook);

        res.status(201).json({
            message: "Book added successfully",
            book: {
                _id: result.insertedId,
                ...newBook
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add book"
        });
    }
});

// ===============================
// GET ONE BOOK BY BOOK ID
// ===============================

app.get("/api/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await booksCollection.findOne({
            bookId: bookId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(book);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to find book"
        });
    }
});

// ===============================
// UPDATE A BOOK
// ===============================

app.put("/api/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        const {
            title,
            author,
            category,
            totalCopies
        } = req.body;

        // Check whether book exists
        const existingBook = await booksCollection.findOne({
            bookId: bookId
        });

        if (!existingBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Check required fields
        if (
            !title ||
            !author ||
            !category ||
            totalCopies === undefined
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const newTotalCopies = Number(totalCopies);

        if (newTotalCopies <= 0) {
            return res.status(400).json({
                message: "Total copies must be greater than 0"
            });
        }

        // Total copies cannot be less than already issued copies
        if (
            newTotalCopies <
            existingBook.issuedCopies
        ) {
            return res.status(400).json({
                message:
                    "Total copies cannot be less than issued copies"
            });
        }

        // Calculate available copies
        const newAvailableCopies =
            newTotalCopies -
            existingBook.issuedCopies;

        // Update book
        await booksCollection.updateOne(
            {
                bookId: bookId
            },
            {
                $set: {
                    title: title,
                    author: author,
                    category: category,
                    totalCopies: newTotalCopies,
                    availableCopies: newAvailableCopies,
                    status:
                        newAvailableCopies > 0
                            ? "Available"
                            : "Unavailable",
                    updatedAt: new Date()
                }
            }
        );

        // Get updated book
        const updatedBook =
            await booksCollection.findOne({
                bookId: bookId
            });

        res.json({
            message: "Book updated successfully",
            book: updatedBook
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update book"
        });
    }
});
// ===============================
// ISSUE A BOOK
// ===============================

app.post("/api/books/:bookId/issue", async (req, res) => {
    try {
        const { bookId } = req.params;

        const {
            studentId,
            studentName
        } = req.body;

        // Check required student information
        if (!studentId || !studentName) {
            return res.status(400).json({
                message: "Student ID and student name are required"
            });
        }

        // Find the book
        const book = await booksCollection.findOne({
            bookId: bookId
        });

        // Check whether book exists
        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Check whether a copy is available
        if (book.availableCopies <= 0) {
            return res.status(400).json({
                message: "Book is not available"
            });
        }

        // Update book copies
        await booksCollection.updateOne(
            {
                bookId: bookId
            },
            {
                $inc: {
                    availableCopies: -1,
                    issuedCopies: 1
                },
                $set: {
                    status: "Available"
                }
            }
        );

        // Create transaction
        const transaction = {
            bookId: bookId,
            title: book.title,
            studentId: studentId,
            studentName: studentName,
            issueDate: new Date(),
            returnDate: null,
            status: "Issued"
        };

        // Save transaction
        const result = await transactionsCollection.insertOne(transaction);

        res.status(201).json({
            message: "Book issued successfully",
            transaction: {
                _id: result.insertedId,
                ...transaction
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to issue book"
        });
    }
});
// ===============================
// DELETE A BOOK
// ===============================

app.delete("/api/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        // Check whether book exists
        const existingBook = await booksCollection.findOne({
            bookId: bookId
        });

        if (!existingBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Don't delete a book that is currently issued
        if (existingBook.issuedCopies > 0) {
            return res.status(400).json({
                message:
                    "Cannot delete a book that is currently issued"
            });
        }

        await booksCollection.deleteOne({
            bookId: bookId
        });

        res.json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete book"
        });
    }
});
// ===============================
// RETURN A BOOK
// ===============================

app.post("/api/books/:bookId/return", async (req, res) => {
    try {
        const { bookId } = req.params;

        const { studentId } = req.body;

        // Check required student information
        if (!studentId) {
            return res.status(400).json({
                message: "Student ID is required"
            });
        }

        // Find the book
        const book = await booksCollection.findOne({
            bookId: bookId
        });

        // Check whether book exists
        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Find the active transaction
        const transaction = await transactionsCollection.findOne({
            bookId: bookId,
            studentId: studentId,
            status: "Issued"
        });

        // Check whether this student actually has the book
        if (!transaction) {
            return res.status(404).json({
                message: "No active issue found for this student"
            });
        }

        // Update book copies
        await booksCollection.updateOne(
            {
                bookId: bookId
            },
            {
                $inc: {
                    availableCopies: 1,
                    issuedCopies: -1
                },
                $set: {
                    status: "Available",
                    updatedAt: new Date()
                }
            }
        );

        // Update transaction
        await transactionsCollection.updateOne(
            {
                _id: transaction._id
            },
            {
                $set: {
                    returnDate: new Date(),
                    status: "Returned"
                }
            }
        );

        // Get updated book
        const updatedBook = await booksCollection.findOne({
            bookId: bookId
        });

        // Get updated transaction
        const updatedTransaction =
            await transactionsCollection.findOne({
                _id: transaction._id
            });

        res.json({
            message: "Book returned successfully",
            book: updatedBook,
            transaction: updatedTransaction
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to return book"
        });
    }
});
// ===============================
// GET ALL TRANSACTIONS
// ===============================

app.get("/api/transactions", async (req, res) => {
    try {
        const transactions = await transactionsCollection
            .find()
            .toArray();

        res.json(transactions);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch transactions"
        });
    }
});
// ===============================
// START SERVER
// ===============================

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    });
}

startServer();
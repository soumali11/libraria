const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

let db;
let booksCollection;
let transactionsCollection;

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

app.get("/", (req, res) => {
    res.json({
        message: "Library Management System API is running!"
    });
});

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

app.post("/api/books", async (req, res) => {
    try {
        const {
            title,
            author,
            bookId,
            category,
            totalCopies
        } = req.body;

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

        const copies = Number(totalCopies);

        if (copies <= 0) {
            return res.status(400).json({
                message: "Total copies must be greater than 0"
            });
        }

        const existingBook = await booksCollection.findOne({
            bookId: bookId
        });

        if (existingBook) {
            return res.status(409).json({
                message: "Book ID already exists"
            });
        }

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

app.put("/api/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        const {
            title,
            author,
            category,
            totalCopies
        } = req.body;

        const existingBook = await booksCollection.findOne({
            bookId: bookId
        });

        if (!existingBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

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

        if (
            newTotalCopies <
            existingBook.issuedCopies
        ) {
            return res.status(400).json({
                message:
                    "Total copies cannot be less than issued copies"
            });
        }

        const newAvailableCopies =
            newTotalCopies -
            existingBook.issuedCopies;

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

app.post("/api/books/:bookId/issue", async (req, res) => {
    try {
        const { bookId } = req.params;

        const {
            studentId,
            studentName
        } = req.body;

        if (!studentId || !studentName) {
            return res.status(400).json({
                message: "Student ID and student name are required"
            });
        }

        const book = await booksCollection.findOne({
            bookId: bookId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const existingIssue =
            await transactionsCollection.findOne({
                bookId: bookId,
                studentId: studentId,
                status: "Issued"
            });

        if (existingIssue) {
            return res.status(409).json({
                message:
                    "This student already has this book issued. Return it before issuing it again."
            });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({
                message: "Book is not available"
            });
        }

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

        const transaction = {
            bookId: bookId,
            title: book.title,
            studentId: studentId,
            studentName: studentName,
            issueDate: new Date(),
            returnDate: null,
            status: "Issued"
        };

        const result =
            await transactionsCollection.insertOne(
                transaction
            );

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

app.delete("/api/books/:bookId", async (req, res) => {
    try {
        const { bookId } = req.params;

        const existingBook = await booksCollection.findOne({
            bookId: bookId
        });

        if (!existingBook) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

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

app.post("/api/books/:bookId/return", async (req, res) => {
    try {
        const { bookId } = req.params;

        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({
                message: "Student ID is required"
            });
        }

        const book = await booksCollection.findOne({
            bookId: bookId
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        const transaction =
            await transactionsCollection.findOne({
                bookId: bookId,
                studentId: studentId,
                status: "Issued"
            });

        if (!transaction) {
            return res.status(404).json({
                message:
                    "No active issue found for this student"
            });
        }

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

        const updatedBook =
            await booksCollection.findOne({
                bookId: bookId
            });

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

app.get("/api/transactions", async (req, res) => {
    try {
        const transactions =
            await transactionsCollection
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

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    });
}

startServer();
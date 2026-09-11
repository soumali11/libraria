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

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function decorateTransaction(transaction) {
    if (!transaction) return transaction;
    const issueDate = transaction.issueDate ? new Date(transaction.issueDate) : null;
    const dueDate = transaction.dueDate
        ? new Date(transaction.dueDate)
        : issueDate
            ? addDays(issueDate, 14)
            : null;
    const referenceDate = transaction.status === "Returned" && transaction.returnDate
        ? new Date(transaction.returnDate)
        : new Date();
    const daysOverdue = dueDate
        ? Math.max(
            0,
            Math.floor(
                (
                    new Date(
                        referenceDate.getFullYear(),
                        referenceDate.getMonth(),
                        referenceDate.getDate()
                    ) -
                    new Date(
                        dueDate.getFullYear(),
                        dueDate.getMonth(),
                        dueDate.getDate()
                    )
                ) / 86400000
            )
        )
        : 0;

    return {
        ...transaction,
        dueDate,
        daysOverdue
    };
}

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
                    status: book.availableCopies - 1 > 0
                        ? "Available"
                        : "Unavailable"
                }
            }
        );

        const issueDate = new Date();
        const transaction = {
            bookId: bookId,
            title: book.title,
            studentId: studentId,
            studentName: studentName,
            issueDate: issueDate,
            dueDate: addDays(issueDate, 14),
            returnDate: null,
            status: "Issued"
        };

        const result =
            await transactionsCollection.insertOne(
                transaction
            );

        res.status(201).json({
            message: "Book issued successfully",
            transaction: decorateTransaction({
                _id: result.insertedId,
                ...transaction
            })
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
            transaction: decorateTransaction(updatedTransaction)
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
                .sort({ issueDate: -1 })
                .toArray();

        res.json(transactions.map(decorateTransaction));

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch transactions"
        });
    }
});

app.post("/api/ai/chat", async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(503).json({
                message: "GEMINI_API_KEY is not configured"
            });
        }

        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const books = await booksCollection
            .find({}, {
                projection: {
                    _id: 0,
                    bookId: 1,
                    title: 1,
                    author: 1,
                    category: 1,
                    totalCopies: 1,
                    availableCopies: 1,
                    issuedCopies: 1,
                    status: 1
                }
            })
            .toArray();

        const catalog = books.map((book) => ({
            id: book.bookId,
            title: book.title,
            author: book.author,
            category: book.category,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            status: book.status
        }));

        const historyText = Array.isArray(history)
            ? history
                .slice(-8)
                .map((item) => `${item.role === "user" ? "User" : "Lira"}: ${item.text}`)
                .join("\n")
            : "";

        const systemPrompt = `You are Lira, the intelligent AI librarian inside Libraria.
Only make factual claims about this library's catalogue from the supplied catalogue data.
You can recommend books, compare titles, explain availability, suggest books by category, and help users understand how the library works.
If a requested book is not in the catalogue, say that clearly and suggest the closest available options from the catalogue.
Keep responses concise, friendly, and useful. Never invent books, authors, quantities, or availability.
Library catalogue:
${JSON.stringify(catalog, null, 2)}

Conversation history:
${historyText}`;

        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: message.trim() }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.45,
                        maxOutputTokens: 500
                    }
                })
            }
        );

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("Gemini API error:", data);
            return res.status(502).json({
                message: "Gemini could not process the request"
            });
        }

        const reply = data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text || "")
            .join("")
            .trim();

        if (!reply) {
            return res.status(502).json({
                message: "Gemini returned an empty response"
            });
        }

        res.json({ reply });
    } catch (error) {
        console.error("AI assistant error:", error);
        res.status(500).json({
            message: "AI assistant is temporarily unavailable"
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

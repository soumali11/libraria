import { Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import LibraryScene from "./3d/LibraryScene";
import ImmersiveLibraryScene from "./ImmersiveLibraryScene";
import alchemistCover from "./assets/alchemist.jpg";
import atomicHabitsCover from "./assets/atomic-habits.jpg";
import silentPatientCover from "./assets/silent-patient.jpg";
import psychologyMoneyCover from "./assets/psychology-of-money.jpg";
import "./immersive-library.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const bookImages = {
  B001: alchemistCover,
  B002: atomicHabitsCover,
  B003: silentPatientCover,
  B004: psychologyMoneyCover,
};

function getImage(book) {
  return bookImages[book.bookId] || null;
}

function normalizeCategory(category = "") {
  return category.toLowerCase().replace(/[-_\s]/g, "");
}

function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("librariaUser")) || null
  );

  function logout() {
    localStorage.removeItem("librariaUser");
    setUser(null);
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        📚 Libraria
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/books">Books</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/library">My Library</Link>
        <Link to="/scan">Scan QR</Link>
        <Link to="/manage">Manage Books</Link>

        {user && (
          <Link to="/dashboard">Dashboard</Link>
        )}
      </div>

      <div className="nav-actions">
        <button
          className="theme-btn"
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {user ? (
          <button className="login-btn" onClick={logout}>
            Logout
          </button>
        ) : (
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

function Home({ theme, setTheme }) {
  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />

      <section className="hero">
        <LibraryScene />

        <div className="hero-content">
          <p className="hero-small">WELCOME TO</p>

          <h1>
            Your Digital
            <br />
            <span>Library</span>
          </h1>

          <p>
            Discover, explore and manage your books
            <br />
            in one beautiful place.
          </p>

          <div className="hero-buttons">
            <Link to="/books" className="primary-btn">
              Explore Books →
            </Link>

            <Link to="/categories" className="secondary-btn">
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <h2>Everything You Need</h2>

        <p>
          Search books, borrow your favourites and keep track
          of everything in your personal library.
        </p>
      </section>
    </>
  );
}

function BookCard({ book, user, onIssue, onDelete }) {
  const image = getImage(book);

  return (
    <div className="book-card">
      <div className="book-image">
        {image ? (
          <img src={image} alt={book.title} />
        ) : (
          <div className="book-placeholder">📖</div>
        )}
      </div>

      <div className="book-info">
        <span className="book-category">
          {book.category}
        </span>

        <h3>{book.title}</h3>

        <p>by {book.author}</p>

        <div className="book-details">
          <span>Total: {book.totalCopies}</span>

          <span>
            Available: {book.availableCopies}
          </span>
        </div>

        {onIssue && (
          <button
            className="issue-btn"
            disabled={!user || book.availableCopies <= 0}
            onClick={() => onIssue(book)}
          >
            {!user
              ? "Sign In to Issue"
              : book.availableCopies <= 0
              ? "Unavailable"
              : "Issue Book"}
          </button>
        )}

        {onDelete && (
          <button
            className="delete-btn"
            onClick={() => onDelete(book.bookId)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function Books({ theme, setTheme }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");

  const user =
    JSON.parse(localStorage.getItem("librariaUser")) || null;

  async function loadBooks() {
    try {
      const response = await fetch(`${API}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  async function issueBook(book) {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/books/${book.bookId}/issue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: user.studentId,
            studentName: user.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Book issued successfully! 📚");

      loadBooks();
    } catch (error) {
      alert("Unable to issue book.");
    }
  }

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />

      <main className="content">
        <div className="page-heading">
          <div>
            <p className="section-label">COLLECTION</p>

            <h1>Explore Books</h1>

            <p>Find your next favourite book.</p>
          </div>

          <input
            className="search-box"
            placeholder="🔍 Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="books-grid">
          {filteredBooks.length === 0 ? (
            <div className="empty-box">
              No books found.
            </div>
          ) : (
            filteredBooks.map((book) => (
              <BookCard
                key={book.bookId}
                book={book}
                user={user}
                onIssue={issueBook}
              />
            ))
          )}
        </div>
      </main>
    </>
  );
}

function Categories({ theme, setTheme }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch(`${API}/books`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error(error));
  }, []);

  const categoryMap = {};

  books.forEach((book) => {
    const key = normalizeCategory(book.category);

    if (!categoryMap[key]) {
      categoryMap[key] = {
        name: book.category,
        count: 0,
      };
    }

    categoryMap[key].count++;
  });

  const categories = Object.values(categoryMap);

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />

      <main className="content">
        <div className="page-heading">
          <div>
            <p className="section-label">DISCOVER</p>

            <h1>Categories</h1>

            <p>Explore books by category.</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="empty-box">
            No categories available.
          </div>
        ) : (
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/categories/${encodeURIComponent(
                  category.name
                )}`}
                className="category-card"
              >
                <div className="category-icon">📚</div>

                <h2>{category.name}</h2>

                <p>
                  {category.count}{" "}
                  {category.count === 1
                    ? "book"
                    : "books"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function CategoryBooks({ theme, setTheme }) {
  const { category } = useParams();

  const [books, setBooks] = useState([]);

  const user =
    JSON.parse(localStorage.getItem("librariaUser")) || null;

  useEffect(() => {
    fetch(`${API}/books`)
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error(error));
  }, []);

  async function issueBook(book) {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/books/${book.bookId}/issue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: user.studentId,
            studentName: user.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Book issued successfully! 📚");

      const updated = await fetch(`${API}/books`);

      setBooks(await updated.json());
    } catch (error) {
      alert("Unable to issue book.");
    }
  }

  const decodedCategory =
    decodeURIComponent(category || "");

  const filteredBooks = books.filter(
    (book) =>
      normalizeCategory(book.category) ===
      normalizeCategory(decodedCategory)
  );

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />

      <main className="content">
        <div className="page-heading">
          <div>
            <p className="section-label">CATEGORY</p>

            <h1>{decodedCategory}</h1>

            <p>Books in this category.</p>
          </div>
        </div>

        <div className="books-grid">
          {filteredBooks.length === 0 ? (
            <div className="empty-box">
              No books in this category.
            </div>
          ) : (
            filteredBooks.map((book) => (
              <BookCard
                key={book.bookId}
                book={book}
                user={user}
                onIssue={issueBook}
              />
            ))
          )}
        </div>
      </main>
    </>
  );
}

function MyLibrary({ theme, setTheme }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("librariaUser")) || null;

  async function loadTransactions() {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/transactions`);
      const data = await response.json();

      const activeTransactions = data.filter(
        (transaction) =>
          transaction.studentId === user.studentId &&
          transaction.status === "Issued"
      );

      const booksResponse = await fetch(`${API}/books`);
      const books = await booksResponse.json();

      const enrichedTransactions = activeTransactions.map((transaction) => {
        const book = books.find((item) => item.bookId === transaction.bookId);

        return {
          ...transaction,
          title: book?.title || transaction.title || "Unknown Book",
          author: book?.author || transaction.author || "Unknown Author",
          category: book?.category || transaction.category || "Library",
        };
      });

      setTransactions(enrichedTransactions);

      setSelectedBook((currentSelected) => {
        if (!currentSelected) return null;

        return enrichedTransactions.find(
          (item) =>
            item._id === currentSelected._id ||
            item.bookId === currentSelected.bookId
        ) || null;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  async function returnBook(transaction) {
    try {
      const response = await fetch(
        `${API}/books/${transaction.bookId}/return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: user.studentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to return book.");
        return;
      }

      alert("Book returned successfully! 🔄");
      setSelectedBook(null);
      loadTransactions();
    } catch (error) {
      console.error(error);
      alert("Unable to return book.");
    }
  }

  if (!user) {
    return (
      <>
        <Navbar theme={theme} setTheme={setTheme} />
        <main className="content">
          <div className="empty-box">
            <h2>You're not signed in</h2>
            <p>Sign in to see the books you have borrowed.</p>
            <Link to="/login" className="primary-btn">Sign In</Link>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar theme={theme} setTheme={setTheme} />
        <main className="immersive-library-page">
          <div className="immersive-library-loading">
            <div className="library-loader"></div>
            <p>Entering your library...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />
      <main className="immersive-library-page">
        <ImmersiveLibraryScene
          books={transactions}
          selectedBook={selectedBook?.bookId || null}
          onSelect={(bookId) => {
            const selected = transactions.find((item) => item.bookId === bookId);
            setSelectedBook(selected || null);
          }}
        />

        <div className="immersive-library-overlay">
          <div className="immersive-library-heading">
            <p className="hero-small">YOUR COLLECTION</p>
            <h1>
              My
              <br />
              <span>Library</span>
            </h1>
            <p>
              A personal space for the books
              <br />
              currently in your collection.
            </p>
          </div>

          <div className="immersive-library-list">
            <div className="immersive-library-list-header">
              <span>CURRENTLY BORROWED</span>
              <strong>{transactions.length}</strong>
            </div>

            {transactions.length === 0 ? (
              <div className="immersive-empty-library">
                <span>✦</span>
                <p>Your shelf is waiting.</p>
                <Link to="/books" className="secondary-btn">Explore Books →</Link>
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <button
                  className={`immersive-book-item ${
                    selectedBook?.bookId === transaction.bookId ? "selected" : ""
                  }`}
                  key={transaction._id || transaction.bookId}
                  onClick={() => setSelectedBook(transaction)}
                >
                  <span className="immersive-book-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="immersive-book-details">
                    <strong>{transaction.title}</strong>
                    <small>{transaction.author}</small>
                  </span>
                  <span className="immersive-book-arrow">↗</span>
                </button>
              ))
            )}
          </div>

          {selectedBook && (
            <div className="immersive-return-card">
              <div className="immersive-return-card-top">
                <span>{selectedBook.bookId}</span>
                <span>{selectedBook.category}</span>
              </div>
              <h2>{selectedBook.title}</h2>
              <p>{selectedBook.author}</p>
              <div className="immersive-return-meta">
                <div>
                  <span>ISSUED TO</span>
                  <strong>{user.studentId}</strong>
                </div>
                <div>
                  <span>STATUS</span>
                  <strong>Currently Issued</strong>
                </div>
              </div>
              <button className="return-btn" onClick={() => returnBook(selectedBook)}>
                Return Book
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function login(e) {
    e.preventDefault();

    if (role === "librarian") {
      if (!username.trim() || !password.trim()) {
        alert("Please enter librarian username and password.");
        return;
      }

      if (
        username.trim() !== "librarian" ||
        password !== "libraria123"
      ) {
        alert("Invalid librarian credentials.");
        return;
      }

      const user = {
        name: "Librarian",
        studentId: "LIB001",
        role: "librarian",
      };

      localStorage.setItem(
        "librariaUser",
        JSON.stringify(user)
      );

      alert("Welcome, Librarian! 📚");
      navigate("/dashboard");
      return;
    }

    if (!name.trim() || !studentId.trim()) {
      alert("Please enter your name and student ID.");
      return;
    }

    const user = {
      name: name.trim(),
      studentId: studentId.trim(),
      role: "student",
    };

    localStorage.setItem(
      "librariaUser",
      JSON.stringify(user)
    );

    alert(`Welcome to Libraria, ${user.name}! 📚`);
    navigate("/library");
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-icon">📚</div>

        <h1>Welcome Back</h1>

        <p>
          Sign in to access Libraria.
        </p>

        <form onSubmit={login}>
          <label>Login As</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
          </select>

          {role === "student" ? (
            <>
              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>Student ID</label>

              <input
                type="text"
                placeholder="Enter your student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </>
          ) : (
            <>
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter librarian username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter librarian password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          <button
            type="submit"
            className="primary-btn"
          >
            Sign In →
          </button>
        </form>

        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const scanHandledRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [error, setError] = useState("");

  async function startScanner() {
    if (scannerRef.current) return;

    setError("");
    scanHandledRef.current = false;

    try {
      const qrScanner = new Html5Qrcode("qr-reader");
      scannerRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          if (scanHandledRef.current) return;

          scanHandledRef.current = true;
          const result = decodedText.trim();
          const activeScanner = scannerRef.current;

          scannerRef.current = null;
          setScanning(false);

          if (activeScanner) {
            try {
              await activeScanner.stop();
            } catch (error) {
              console.error(error);
            }
          }

          onScan(result);
        },
        () => {}
      );

      setScanning(true);
    } catch (error) {
      console.error(error);
      scannerRef.current = null;
      setScanning(false);
      setError("Unable to access the camera. Please allow camera access or use the gallery option.");
    }
  }

  async function stopScanner() {
    scanHandledRef.current = true;
    const activeScanner = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);

    if (activeScanner) {
      try {
        await activeScanner.stop();
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function scanFromGallery(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setGalleryLoading(true);
    scanHandledRef.current = true;

    try {
      const activeScanner = scannerRef.current;
      scannerRef.current = null;
      setScanning(false);

      if (activeScanner) {
        try {
          await activeScanner.stop();
        } catch (error) {
          console.error(error);
        }
      }

      const fileScanner = new Html5Qrcode("qr-reader");
      const decodedText = await fileScanner.scanFile(file, true);

      try {
        await fileScanner.clear();
      } catch (error) {
        console.error(error);
      }

      onScan(decodedText.trim());
    } catch (error) {
      console.error(error);
      setError("No QR code could be detected in this image. Please select a clear QR code image.");
    } finally {
      setGalleryLoading(false);
      event.target.value = "";
    }
  }

  useEffect(() => {
    return () => {
      const activeScanner = scannerRef.current;
      scannerRef.current = null;
      if (activeScanner) activeScanner.stop().catch(() => {});
    };
  }, []);

  const readerVisible = scanning || galleryLoading;

  return (
    <div className="qr-scanner-box">
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "260px",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          overflow: "hidden",
          background: "var(--card)",
        }}
      >
        <div
          id="qr-reader"
          style={{
            display: readerVisible ? "block" : "none",
            width: "100%",
            minHeight: "260px",
            border: "none",
            borderRadius: "0",
            background: "var(--card)",
          }}
        ></div>

        {!readerVisible && (
          <div
            style={{
              minHeight: "260px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "30px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(139, 92, 246, 0.12)",
                border: "1px solid rgba(139, 92, 246, 0.28)",
                fontSize: "30px",
                marginBottom: "16px",
              }}
            >
              📷
            </div>
            <strong
              style={{
                fontSize: "20px",
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              Camera Ready
            </strong>
            <span
              style={{
                color: "var(--muted)",
                fontSize: "14px",
                lineHeight: "1.6",
                maxWidth: "360px",
              }}
            >
              Click Start Camera to activate the QR scanner.
            </span>
          </div>
        )}

        {galleryLoading && (
          <div
            style={{
              position: "absolute",
              inset: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(10, 10, 16, 0.72)",
              color: "var(--text)",
              fontSize: "16px",
              fontWeight: "600",
              pointerEvents: "none",
            }}
          >
            🔍 Reading QR code...
          </div>
        )}
      </div>

      <div className="qr-scanner-actions">
        {!scanning ? (
          <button className="primary-btn" onClick={startScanner} disabled={galleryLoading}>
            📷 Start Camera
          </button>
        ) : (
          <button className="secondary-btn" onClick={stopScanner}>
            Stop Camera
          </button>
        )}

        <label className="gallery-qr-btn">
          {galleryLoading ? "🔍 Reading QR..." : "🖼️ Scan from Gallery"}
          <input type="file" accept="image/*" onChange={scanFromGallery} disabled={galleryLoading} hidden />
        </label>
      </div>

      {error && <p className="qr-error">{error}</p>}
    </div>
  );
}
function ScanQR({ theme, setTheme }) {
  const [mode, setMode] = useState("issue");
  const [book, setBook] = useState(null);
  const [manualBookId, setManualBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const user =
    JSON.parse(localStorage.getItem("librariaUser")) || null;

  async function findBook(bookId) {
    if (!bookId) {
      setMessage("No Book ID was found in the QR code.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/books/${encodeURIComponent(bookId)}`
      );

      const data = await response.json();

      if (!response.ok) {
        setBook(null);
        setMessage(
          data.message || "Book not found."
        );
        return;
      }

      setBook(data);
    } catch (error) {
      setBook(null);
      setMessage(
        "Unable to connect to the library server."
      );
    } finally {
      setLoading(false);
    }
  }

  async function issueScannedBook() {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    if (!book) {
      alert("Please scan a book first.");
      return;
    }

    if (book.availableCopies <= 0) {
      alert("This book is currently unavailable.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/books/${book.bookId}/issue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: user.studentId,
            studentName: user.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Book issued successfully! 📚");

      setBook(null);
      setManualBookId("");
    } catch (error) {
      alert("Unable to issue book.");
    } finally {
      setLoading(false);
    }
  }

  async function returnScannedBook() {
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    if (!book) {
      alert("Please scan a book first.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/books/${book.bookId}/return`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: user.studentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Book returned successfully! 🔄");

      setBook(null);
      setManualBookId("");
    } catch (error) {
      alert("Unable to return book.");
    } finally {
      setLoading(false);
    }
  }

  function handleScan(decodedText) {
    findBook(decodedText);
  }

  function handleManualSearch(e) {
    e.preventDefault();

    findBook(manualBookId.trim());
  }

  function changeMode(newMode) {
    setMode(newMode);
    setBook(null);
    setMessage("");
    setManualBookId("");
  }

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />

      <main className="content scan-page">
        <div className="page-heading">
          <div>
            <p className="section-label">
              LIBRARY SYSTEM
            </p>

            <h1>Scan Book QR</h1>

            <p>
              Scan a book QR code to issue or return a book.
            </p>
          </div>
        </div>

        <div className="scan-layout">
          <div className="scan-panel">
            <div className="scan-tabs">
              <button
                className={
                  mode === "issue"
                    ? "scan-tab active"
                    : "scan-tab"
                }
                onClick={() => changeMode("issue")}
              >
                📕 Issue Book
              </button>

              <button
                className={
                  mode === "return"
                    ? "scan-tab active"
                    : "scan-tab"
                }
                onClick={() => changeMode("return")}
              >
                🔄 Return Book
              </button>
            </div>

            <QRScanner onScan={handleScan} />

            <div className="manual-scan">
              <p>Or enter Book ID manually</p>

              <form onSubmit={handleManualSearch}>
                <input
                  type="text"
                  placeholder="Example: B001"
                  value={manualBookId}
                  onChange={(e) =>
                    setManualBookId(e.target.value)
                  }
                />

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Find Book
                </button>
              </form>
            </div>
          </div>

          <div className="scan-result">
            {!book ? (
              <div className="scan-empty">
                <div className="scan-empty-icon">
                  📷
                </div>

                <h2>Scan a Book</h2>

                <p>
                  Point your camera at a QR code containing
                  the Book ID.
                </p>

                {loading && (
                  <p className="scan-status">
                    Finding book...
                  </p>
                )}

                {message && (
                  <p className="qr-error">
                    {message}
                  </p>
                )}
              </div>
            ) : (
              <div className="scanned-book">
                <span className="book-category">
                  {book.category}
                </span>

                <h2>{book.title}</h2>

                <p className="scanned-author">
                  by {book.author}
                </p>

                <div className="scanned-book-details">
                  <div>
                    <span>Book ID</span>
                    <strong>{book.bookId}</strong>
                  </div>

                  <div>
                    <span>Total Copies</span>
                    <strong>{book.totalCopies}</strong>
                  </div>

                  <div>
                    <span>Available</span>
                    <strong>{book.availableCopies}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {book.availableCopies > 0
                        ? "Available"
                        : "Unavailable"}
                    </strong>
                  </div>
                </div>

                {!user ? (
                  <div className="scan-login-message">
                    <p>
                      Please sign in before issuing or
                      returning a book.
                    </p>

                    <Link
                      to="/login"
                      className="primary-btn"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : mode === "issue" ? (
                  <button
                    className="primary-btn scan-action-btn"
                    disabled={
                      loading ||
                      book.availableCopies <= 0
                    }
                    onClick={issueScannedBook}
                  >
                    {book.availableCopies <= 0
                      ? "Book Unavailable"
                      : "📕 Issue This Book"}
                  </button>
                ) : (
                  <button
                    className="return-btn scan-action-btn"
                    disabled={loading}
                    onClick={returnScannedBook}
                  >
                    🔄 Return This Book
                  </button>
                )}

                <button
                  className="secondary-btn scan-again-btn"
                  onClick={() => {
                    setBook(null);
                    setMessage("");
                    setManualBookId("");
                  }}
                >
                  Scan Another Book
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function ManageBooks({ theme, setTheme }) {
  const [books, setBooks] = useState([]);
  const [editingBookId, setEditingBookId] =
    useState(null);
  const [selectedQRBook, setSelectedQRBook] =
    useState(null);
  const [downloadingQR, setDownloadingQR] =
    useState(false);

  const [form, setForm] = useState({
    bookId: "",
    title: "",
    author: "",
    category: "",
    totalCopies: "",
  });

  async function loadBooks() {
    try {
      const response = await fetch(`${API}/books`);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function startEdit(book) {
    setEditingBookId(book.bookId);

    setForm({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      category: book.category,
      totalCopies: book.totalCopies,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingBookId(null);

    setForm({
      bookId: "",
      title: "",
      author: "",
      category: "",
      totalCopies: "",
    });
  }

  async function addBook(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          totalCopies: Number(form.totalCopies),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Book added successfully! 📚");

      setForm({
        bookId: "",
        title: "",
        author: "",
        category: "",
        totalCopies: "",
      });

      loadBooks();
    } catch (error) {
      alert("Unable to add book.");
    }
  }

  async function updateBook(e) {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API}/books/${editingBookId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            author: form.author,
            category: form.category,
            totalCopies: Number(form.totalCopies),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Book updated successfully! ✏️");

      cancelEdit();
      loadBooks();
    } catch (error) {
      alert("Unable to update book.");
    }
  }

  async function deleteBook(bookId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API}/books/${bookId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Book deleted successfully.");

      if (editingBookId === bookId) {
        cancelEdit();
      }

      if (
        selectedQRBook &&
        selectedQRBook.bookId === bookId
      ) {
        setSelectedQRBook(null);
      }

      loadBooks();
    } catch (error) {
      alert("Unable to delete book.");
    }
  }

  function openQR(book) {
    setSelectedQRBook(book);
  }

  function closeQR() {
    setSelectedQRBook(null);
  }

  async function downloadQR() {
    if (!selectedQRBook || downloadingQR) return;

    const svg = document.getElementById("book-qr-code");

    if (!svg) return;

    setDownloadingQR(true);

    try {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);

      const svgBlob = new Blob(
        [source],
        {
          type: "image/svg+xml;charset=utf-8",
        }
      );

      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 1000;

        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size, size);

        context.drawImage(
          image,
          0,
          0,
          size,
          size
        );

        URL.revokeObjectURL(svgUrl);

        canvas.toBlob((blob) => {
          if (!blob) {
            setDownloadingQR(false);
            alert("Unable to create QR image.");
            return;
          }

          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");

          link.href = pngUrl;
          link.download = `${selectedQRBook.bookId}-QR.png`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(pngUrl);

          setDownloadingQR(false);

          alert(
            `${selectedQRBook.bookId}-QR.png has been downloaded.`
          );
        }, "image/png");
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        setDownloadingQR(false);
        alert("Unable to generate QR image.");
      };

      image.src = svgUrl;
    } catch (error) {
      console.error(error);
      setDownloadingQR(false);
      alert("Unable to download QR code.");
    }
  }

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
      />

      <main className="content">
        <div className="page-heading">
          <div>
            <p className="section-label">
              ADMIN
            </p>

            <h1>Manage Books</h1>

            <p>
              Add, edit, remove or generate QR codes
              for books.
            </p>
          </div>
        </div>

        <div className="manage-layout">
          <form
            className="manage-form"
            onSubmit={
              editingBookId
                ? updateBook
                : addBook
            }
          >
            <h2>
              {editingBookId
                ? "Edit Book"
                : "Add New Book"}
            </h2>

            <input
              name="bookId"
              placeholder="Book ID"
              value={form.bookId}
              onChange={handleChange}
              disabled={!!editingBookId}
              required
            />

            <input
              name="title"
              placeholder="Book title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <input
              name="author"
              placeholder="Author"
              value={form.author}
              onChange={handleChange}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
            />

            <input
              name="totalCopies"
              type="number"
              min="1"
              placeholder="Total copies"
              value={form.totalCopies}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="primary-btn"
            >
              {editingBookId
                ? "Save Changes"
                : "+ Add Book"}
            </button>

            {editingBookId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </form>

          <div className="manage-books">
            <h2>Current Books</h2>

            {books.length === 0 ? (
              <div className="empty-box">
                <p>No books available.</p>
              </div>
            ) : (
              books.map((book) => (
                <div
                  className="manage-book-row"
                  key={book.bookId}
                >
                  <div>
                    <strong>
                      {book.title}
                    </strong>

                    <p>
                      {book.bookId} ·{" "}
                      {book.author}
                    </p>

                    <p>
                      {book.category} · Total:{" "}
                      {book.totalCopies} ·
                      Available:{" "}
                      {book.availableCopies}
                    </p>
                  </div>

                  <div className="manage-book-actions">
                    <button
                      className="qr-btn"
                      onClick={() =>
                        openQR(book)
                      }
                    >
                      QR Code
                    </button>

                    <button
                      className="edit-btn"
                      onClick={() =>
                        startEdit(book)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteBook(book.bookId)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {selectedQRBook && (
        <div
          className="qr-modal-overlay"
          onClick={closeQR}
        >
          <div
            className="qr-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="qr-modal-close"
              onClick={closeQR}
            >
              ×
            </button>

            <p className="section-label">
              BOOK QR CODE
            </p>

            <h2>
              {selectedQRBook.title}
            </h2>

            <p className="qr-book-author">
              {selectedQRBook.author}
            </p>

            <div className="qr-code-wrapper">
              <QRCodeSVG
                id="book-qr-code"
                value={selectedQRBook.bookId}
                size={240}
                level="H"
                marginSize={4}
              />
            </div>

            <div className="qr-book-id">
              <span>Book ID</span>

              <strong>
                {selectedQRBook.bookId}
              </strong>
            </div>

            <p className="qr-instruction">
              This QR code contains only the Book ID.
              Scan it from the Scan QR page to issue
              or return this book.
            </p>

            <div className="qr-modal-actions">
              <button
                className="primary-btn"
                onClick={downloadQR}
                disabled={downloadingQR}
              >
                {downloadingQR
                  ? "Preparing QR..."
                  : "Download QR"}
              </button>

              <button
                className="secondary-btn"
                onClick={closeQR}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Dashboard({ theme, setTheme }) {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("librariaUser"));

  async function loadDashboard() {
    setLoading(true);

    try {
      const [booksResponse, transactionsResponse] =
        await Promise.all([
          fetch(`${API}/books`),
          fetch(`${API}/transactions`),
        ]);

      const booksData = await booksResponse.json();
      const transactionsData =
        await transactionsResponse.json();

      setBooks(booksData);

      if (user?.role === "librarian") {
        setTransactions(transactionsData);
      } else {
        const myTransactions = transactionsData.filter(
          (transaction) =>
            transaction.studentId === user?.studentId
        );

        setTransactions(myTransactions);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, []);

  if (!user) {
    return (
      <>
        <Navbar
          theme={theme}
          setTheme={setTheme}
        />

        <main className="content">
          <div className="empty-box">
            <div className="scan-empty-icon">
              🔐
            </div>

            <h2>Please Sign In</h2>

            <p>
              Sign in as a student or librarian to access the dashboard.
            </p>

            <Link
              to="/login"
              className="primary-btn"
            >
              Sign In
            </Link>
          </div>
        </main>
      </>
    );
  }

  const totalBooks = books.length;

  const totalCopies = books.reduce(
    (sum, book) =>
      sum + Number(book.totalCopies || 0),
    0
  );

  const availableCopies = books.reduce(
    (sum, book) =>
      sum + Number(book.availableCopies || 0),
    0
  );

  const issuedCopies =
    totalCopies - availableCopies;

  const totalTransactions =
    transactions.length;

  const currentlyIssued = transactions.filter(
    (transaction) => transaction.status === "Issued"
  ).length;

  const filteredTransactions =
    transactions.filter((transaction) => {
      const searchText =
        `${transaction.studentName || ""} ${
          transaction.studentId || ""
        } ${transaction.title || ""} ${
          transaction.bookId || ""
        }`.toLowerCase();

      const matchesSearch =
        searchText.includes(
          search.toLowerCase()
        );

      const matchesStatus =
        statusFilter === "All" ||
        transaction.status === statusFilter;

      const transactionDate =
        transaction.issueDate
          ? new Date(transaction.issueDate)
          : null;

      let matchesFromDate = true;
      let matchesToDate = true;

      if (fromDate && transactionDate) {
        const start = new Date(
          `${fromDate}T00:00:00`
        );

        matchesFromDate =
          transactionDate >= start;
      }

      if (toDate && transactionDate) {
        const end = new Date(
          `${toDate}T23:59:59`
        );

        matchesToDate =
          transactionDate <= end;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function downloadReport() {
    if (filteredTransactions.length === 0) {
      alert(
        "There are no transactions to download."
      );
      return;
    }

    const headers = [
      "Transaction ID",
      "Book ID",
      "Book Title",
      "Student ID",
      "Student Name",
      "Issue Date",
      "Return Date",
      "Status",
    ];

    const rows = filteredTransactions.map(
      (transaction) => [
        transaction._id || "",
        transaction.bookId || "",
        transaction.title || "",
        transaction.studentId || "",
        transaction.studentName || "",
        transaction.issueDate
          ? new Date(
              transaction.issueDate
            ).toLocaleString("en-IN")
          : "",
        transaction.returnDate
          ? new Date(
              transaction.returnDate
            ).toLocaleString("en-IN")
          : "",
        transaction.status || "",
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value).replace(
              /"/g,
              '""'
            );

            return `"${text}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    link.download =
      `libraria-transaction-report-${date}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  }

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
      />

      <main className="content dashboard-page">
        <div className="page-heading dashboard-heading">
          <div>
            <p className="section-label">
              {user?.role === "librarian"
                ? "LIBRARIAN CONTROL CENTER"
                : "PERSONAL DASHBOARD"}
            </p>

            <h1>
              {user?.role === "librarian"
                ? "Library Dashboard"
                : "My Dashboard"}
            </h1>

            <p>
              {user?.role === "librarian"
                ? "Monitor books, availability and all library transactions."
                : "View your books, borrowing history and personal transactions."}
            </p>

            {user?.role !== "librarian" && (
              <p>
                Logged in as: {user?.name} ({user?.studentId})
              </p>
            )}
          </div>

          <button
            className="secondary-btn dashboard-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              📚
            </div>

            <div>
              <span>Total Books</span>
              <strong>{totalBooks}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              📦
            </div>

            <div>
              <span>Total Copies</span>
              <strong>{totalCopies}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              ✅
            </div>

            <div>
              <span>Available Copies</span>
              <strong>{availableCopies}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              📕
            </div>

            <div>
              <span>
                {user?.role === "librarian"
                  ? "Currently Issued"
                  : "My Books Issued"}
              </span>
              <strong>
                {user?.role === "librarian"
                  ? issuedCopies
                  : currentlyIssued}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🔄
            </div>

            <div>
              <span>
                {user?.role === "librarian"
                  ? "Total Transactions"
                  : "My Transactions"}
              </span>
              <strong>{totalTransactions}</strong>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <p className="section-label">
                {user?.role === "librarian"
                  ? "TRANSACTION MANAGEMENT"
                  : "YOUR TRANSACTIONS"}
              </p>

              <h2>
                {user?.role === "librarian"
                  ? "Issued Book Tracking"
                  : "My Book Tracking"}
              </h2>
            </div>

            <button
              className="primary-btn report-btn"
              onClick={downloadReport}
            >
              📥 Download CSV Report
            </button>
          </div>

          <div className="dashboard-filters">
            <input
              type="text"
              placeholder={
                user?.role === "librarian"
                  ? "🔍 Search student, book or ID..."
                  : "🔍 Search your books or IDs..."
              }
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">
                All Status
              </option>

              <option value="Issued">
                Issued
              </option>

              <option value="Returned">
                Returned
              </option>
            </select>

            <div className="date-filter">
              <label>From</label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(e.target.value)
                }
              />
            </div>

            <div className="date-filter">
              <label>To</label>

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(e.target.value)
                }
              />
            </div>

            <button
              className="secondary-btn clear-filter-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>

          <div className="dashboard-results">
            Showing{" "}
            <strong>
              {filteredTransactions.length}
            </strong>{" "}
            of{" "}
            <strong>
              {totalTransactions}
            </strong>{" "}
            transactions
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="empty-box dashboard-empty">
              <div className="scan-empty-icon">
                📋
              </div>

              <h2>No transactions found</h2>

              <p>
                {user?.role === "librarian"
                  ? "Try changing your search or filters."
                  : "You do not have any transactions matching these filters."}
              </p>
            </div>
          ) : (
            <div className="transaction-table-wrapper">
              <table className="transaction-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Book ID</th>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map(
                    (transaction) => (
                      <tr key={transaction._id}>
                        <td>
                          <strong>
                            {transaction.title ||
                              "Unknown Book"}
                          </strong>
                        </td>

                        <td>
                          <span className="table-id">
                            {transaction.bookId}
                          </span>
                        </td>

                        <td>
                          {transaction.studentName ||
                            "Unknown"}
                        </td>

                        <td>
                          {transaction.studentId ||
                            "—"}
                        </td>

                        <td>
                          {formatDate(
                            transaction.issueDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            transaction.returnDate
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              transaction.status ===
                              "Issued"
                                ? "status-badge issued"
                                : "status-badge returned"
                            }
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem("librariaTheme") ||
      "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "librariaTheme",
      theme
    );
  }, [theme]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      <Route
        path="/books"
        element={
          <Books
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      <Route
        path="/categories"
        element={
          <Categories
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      <Route
        path="/categories/:category"
        element={
          <CategoryBooks
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      <Route
        path="/library"
        element={
          <MyLibrary
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      <Route
        path="/scan"
        element={
          <ScanQR
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/manage"
        element={
          <ManageBooks
            theme={theme}
            setTheme={setTheme}
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <Dashboard
            theme={theme}
            setTheme={setTheme}
          />
        }
      />
    </Routes>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import alchemist from "../assets/alchemist.jpg";
import atomicHabits from "../assets/atomic-habits.jpg";
import hero from "../assets/hero.png";

function Navbar() {
  return (
    <nav
      style={{
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 6%",
        borderBottom: "1px solid #292a32",
        background: "#101116",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        to="/"
        style={{
          color: "white",
          textDecoration: "none",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        ✦ LIBRARIA
      </Link>

      <div
        style={{
          display: "flex",
          gap: "32px",
          alignItems: "center",
        }}
      >
        <Link to="/" style={navStyle}>
          HOME
        </Link>

        <Link to="/books" style={navStyle}>
          BOOKS
        </Link>

        <Link to="/categories" style={navStyle}>
          CATEGORIES
        </Link>

        <Link to="/library" style={navStyle}>
          MY LIBRARY
        </Link>

        <Link
          to="/login"
          style={{
            color: "white",
            textDecoration: "none",
            border: "1px solid #555",
            padding: "10px 20px",
            borderRadius: "25px",
            fontSize: "13px",
          }}
        >
          SIGN IN
        </Link>
      </div>
    </nav>
  );
}

const navStyle = {
  color: "#aaa",
  textDecoration: "none",
  fontSize: "13px",
};

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    fetch("http://localhost:5000/api/books")
      .then((response) => response.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const getBookImage = (bookId) => {
    if (bookId === "B001") return alchemist;
    if (bookId === "B002") return atomicHabits;
    return hero;
  };

  const issueBook = async (book) => {
    if (book.availableCopies <= 0) {
      alert("This book is currently unavailable.");
      return;
    }

    const studentId = prompt("Enter your Student ID:");

    if (!studentId) {
      return;
    }

    const studentName = prompt("Enter your Name:");

    if (!studentName) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/books/${book.bookId}/issue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            studentName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to issue book.");
        return;
      }

      alert("Book issued successfully! 📚");

      loadBooks();
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#101116",
        color: "white",
      }}
    >
      <Navbar />

      <main
        style={{
          padding: "70px 7%",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "55px",
          }}
        >
          <p
            style={{
              color: "#9b91ff",
              letterSpacing: "3px",
              fontSize: "13px",
            }}
          >
            LIBRARIA COLLECTION
          </p>

          <h1
            style={{
              fontSize: "56px",
              margin: "10px 0",
            }}
          >
            Explore Books
          </h1>

          <p
            style={{
              color: "#aaa",
              fontSize: "17px",
            }}
          >
            Discover your next favourite book.
          </p>
        </div>

        {loading && (
          <h2 style={{ textAlign: "center" }}>
            Loading books...
          </h2>
        )}

        {!loading && books.length === 0 && (
          <h2 style={{ textAlign: "center" }}>
            No books available.
          </h2>
        )}

        {!loading && books.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "30px",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            {books.map((book) => (
              <div
                key={book._id}
                style={{
                  background: "#191a20",
                  border: "1px solid #30313a",
                  borderRadius: "18px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={getBookImage(book.bookId)}
                  alt={book.title}
                  style={{
                    width: "100%",
                    height: "330px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <div style={{ padding: "22px" }}>
                  <p
                    style={{
                      color: "#9b91ff",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    {book.category}
                  </p>

                  <h2 style={{ margin: "0 0 8px" }}>
                    {book.title}
                  </h2>

                  <p style={{ color: "#aaa" }}>
                    by {book.author}
                  </p>

                  <p
                    style={{
                      marginTop: "18px",
                      color:
                        book.availableCopies > 0
                          ? "#7ee787"
                          : "#ff6b6b",
                    }}
                  >
                    {book.availableCopies > 0
                      ? `${book.availableCopies} copies available`
                      : "Currently unavailable"}
                  </p>

                  <button
                    onClick={() => issueBook(book)}
                    disabled={book.availableCopies <= 0}
                    style={{
                      width: "100%",
                      marginTop: "15px",
                      padding: "13px",
                      borderRadius: "25px",
                      border: "none",
                      background:
                        book.availableCopies > 0
                          ? "white"
                          : "#444",
                      color:
                        book.availableCopies > 0
                          ? "black"
                          : "#aaa",
                      cursor:
                        book.availableCopies > 0
                          ? "pointer"
                          : "not-allowed",
                      fontWeight: "600",
                    }}
                  >
                    {book.availableCopies > 0
                      ? "Issue Book"
                      : "Unavailable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Books;
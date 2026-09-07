import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import alchemist from "../assets/alchemist.jpg";
import atomicHabits from "../assets/atomic-habits.jpg";
import hero from "../assets/hero.png";

function CategoryPage({ category }) {

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("http://localhost:5000/api/books")
      .then((response) => response.json())
      .then((data) => {

        const filteredBooks = data.filter(
          (book) =>
            book.category.toLowerCase() ===
            category.toLowerCase()
        );

        setBooks(filteredBooks);
        setLoading(false);

      })
      .catch((error) => {

        console.error(error);
        setLoading(false);

      });

  }, [category]);

  const getBookImage = (bookId) => {

    if (bookId === "B001") {
      return alchemist;
    }

    if (bookId === "B002") {
      return atomicHabits;
    }

    return hero;
  };

  return (
    <div
      className="category-page"
      style={{
        minHeight: "100vh",
        background: "#101116",
        color: "white",
      }}
    >

      <Navbar />

      <main style={{ padding: "70px 7%" }}>

        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
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
              fontSize: "52px",
              margin: "10px 0",
            }}
          >
            {category}
          </h1>

          <p style={{ color: "#aaa" }}>
            Explore books in the {category} category.
          </p>

        </div>

        {loading && (
          <h2 style={{ textAlign: "center" }}>
            Loading books...
          </h2>
        )}

        {!loading && books.length === 0 && (
          <div style={{ textAlign: "center" }}>

            <h2>
              No books in this category yet.
            </h2>

            <Link
              to="/books"
              style={{
                color: "#9b91ff",
                textDecoration: "none",
              }}
            >
              ← View All Books
            </Link>

          </div>
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
                className="book-card"
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
                    }}
                  >
                    {book.category}
                  </p>

                  <h2>{book.title}</h2>

                  <p style={{ color: "#aaa" }}>
                    by {book.author}
                  </p>

                  <p
                    style={{
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

                  <Link
                    to="/books"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "15px",
                      padding: "13px",
                      borderRadius: "25px",
                      background: "white",
                      color: "black",
                      textDecoration: "none",
                      fontWeight: "600",
                    }}
                  >
                    View / Issue Book
                  </Link>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default CategoryPage;
import { Link } from "react-router-dom";
import LibraryScene from "../3d/LibraryScene";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="home-page">

      {/* NAVBAR */}
      <Navbar />

      {/* 3D HERO SECTION */}
      <section
        className="hero-3d"
        style={{
          position: "relative",
          minHeight: "calc(100vh - 70px)",
          overflow: "hidden",
        }}
      >

        {/* 3D BACKGROUND */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <LibraryScene />
        </div>

        {/* DARK OVERLAY */}
        <div
          className="hero-overlay"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
          }}
        ></div>

        {/* HERO CONTENT */}
        <div
          className="hero-content"
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "650px",
            padding: "100px 7%",
          }}
        >

          <div className="hero-label">
            ✦ THE DIGITAL LIBRARY
          </div>

          <h1
            style={{
              lineHeight: "1.05",
              margin: "25px 0",
            }}
          >
            Discover.
            <br />
            <span>Explore.</span>
            <br />
            Read.
          </h1>

          <p
            style={{
              maxWidth: "550px",
              lineHeight: "1.7",
            }}
          >
            Enter a new kind of library experience.
            Discover books, explore new worlds and
            manage your reading journey.
          </p>

          {/* BUTTONS */}
          <div
            className="hero-actions"
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "30px",
              flexWrap: "wrap",
            }}
          >

            <Link
              to="/books"
              className="hero-primary"
            >
              Explore Books
              <span>→</span>
            </Link>

            <Link
              to="/categories"
              className="hero-secondary"
            >
              Browse Categories
            </Link>

          </div>

        </div>

        {/* BOTTOM NAVIGATION */}
        <div
          className="hero-bottom"
          style={{
            position: "absolute",
            bottom: "30px",
            left: "7%",
            right: "7%",
            zIndex: 10,
          }}
        >

          <div>
            <strong>01</strong>
            <span>DISCOVER</span>
          </div>

          <div>
            <strong>02</strong>
            <span>EXPLORE</span>
          </div>

          <div>
            <strong>03</strong>
            <span>READ</span>
          </div>

        </div>

      </section>

      {/* INTRODUCTION SECTION */}
      <section
        className="intro-section"
        style={{
          padding: "100px 7%",
          textAlign: "center",
        }}
      >

        <div className="intro-small">
          YOUR LIBRARY. REIMAGINED.
        </div>

        <h2>
          More than a collection
          <br />
          of books.
        </h2>

        <p
          style={{
            maxWidth: "650px",
            margin: "25px auto",
            lineHeight: "1.8",
          }}
        >
          Libraria brings your entire library into one
          beautiful digital experience. Search, discover,
          borrow and keep track of the books that matter
          to you.
        </p>

      </section>

    </div>
  );
}

export default Home;
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("libraria-theme");

    if (savedTheme === "light") {
      setDarkMode(false);
      document.body.classList.add("light-theme");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;

    setDarkMode(newMode);

    if (newMode) {
      document.body.classList.remove("light-theme");
      localStorage.setItem("libraria-theme", "dark");
    } else {
      document.body.classList.add("light-theme");
      localStorage.setItem("libraria-theme", "light");
    }
  };

  return (
    <nav className="navbar">

      <Link to="/" className="navbar-logo">
        ✦ LIBRARIA
      </Link>

      <div className="navbar-links">

        <Link to="/">HOME</Link>

        <Link to="/books">BOOKS</Link>

        <Link to="/categories">CATEGORIES</Link>

        <Link to="/library">MY LIBRARY</Link>

        <Link to="/login" className="signin-button">
          SIGN IN
        </Link>

        <button
          className="theme-button"
          onClick={toggleTheme}
          title="Toggle light/dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

      </div>

    </nav>
  );
}

export default Navbar;
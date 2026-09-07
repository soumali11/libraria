import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const categories = [
  {
    name: "Fiction",
    path: "/categories/fiction",
    icon: "📖",
    description: "Stories, novels and imagination.",
  },
  {
    name: "Science",
    path: "/categories/science",
    icon: "🔬",
    description: "Explore the world of science.",
  },
  {
    name: "Technology",
    path: "/categories/technology",
    icon: "💻",
    description: "Computers, programming and innovation.",
  },
  {
    name: "History",
    path: "/categories/history",
    icon: "🏛️",
    description: "Discover the stories of the past.",
  },
  {
    name: "Biography",
    path: "/categories/biography",
    icon: "👤",
    description: "Real lives and inspiring journeys.",
  },
  {
    name: "Self Help",
    path: "/categories/self-help",
    icon: "🌱",
    description: "Books for growth and motivation.",
  },
];

function Categories() {
  return (
    <div className="categories-page" style={pageStyle}>

      <Navbar />

      <main style={{ padding: "70px 7%" }}>

        <div style={headerStyle}>
          <p style={labelStyle}>
            EXPLORE BY GENRE
          </p>

          <h1 style={titleStyle}>
            Categories
          </h1>

          <p style={{ color: "#aaa" }}>
            Find books that match your interests.
          </p>
        </div>

        <div style={gridStyle}>

          {categories.map((category) => (

            <Link
              key={category.name}
              to={category.path}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <div className="category-card" style={cardStyle}>

                <div style={{ fontSize: "32px" }}>
                  {category.icon}
                </div>

                <h2>{category.name}</h2>

                <p style={{ color: "#aaa", lineHeight: "1.6" }}>
                  {category.description}
                </p>

                <span
                  style={{
                    color: "#9b91ff",
                    fontSize: "14px",
                  }}
                >
                  View Books →
                </span>

              </div>

            </Link>

          ))}

        </div>

      </main>

    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#101116",
  color: "white",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "55px",
};

const labelStyle = {
  color: "#9b91ff",
  letterSpacing: "3px",
  fontSize: "13px",
};

const titleStyle = {
  fontSize: "56px",
  margin: "10px 0",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "25px",
  maxWidth: "1000px",
  margin: "0 auto",
};

const cardStyle = {
  background: "#191a20",
  border: "1px solid #30313a",
  borderRadius: "18px",
  padding: "35px 25px",
  textAlign: "center",
  minHeight: "190px",
};

export default Categories;
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("general");
  const [search, setSearch] = useState("");

  const API_KEY = "d0a340b809b77c76ca20ea2e5474569f";

  const moodMap = {
    happy: "entertainment",
    sad: "health",
    angry: "general",
    focus: "technology",
  };

  useEffect(() => {
    setLoading(true);

    fetch(
      `https://gnews.io/api/v4/search?q=${search || category}&country=in&apikey=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      });
  }, [category, search]);

  const handleMood = (mood) => {
    setCategory(moodMap[mood]);
    setActiveMood(mood);
    setSearch("");
  };

  return (
    <div className="container">
      <h1>🧠 Mood News App</h1>

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search news..."
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Mood Buttons */}
      <div className="moods">
        <button
          className={activeMood === "happy" ? "active" : ""}
          onClick={() => handleMood("happy")}
        >
          😊 Happy
        </button>
        <button
          className={activeMood === "sad" ? "active" : ""}
          onClick={() => handleMood("sad")}
        >
          😢 Sad
        </button>
        <button
          className={activeMood === "angry" ? "active" : ""}
          onClick={() => handleMood("angry")}
        >
          😠 Angry
        </button>
        <button
          className={activeMood === "focus" ? "active" : ""}
          onClick={() => handleMood("focus")}
        >
          🧠 Focus
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="loading">Loading... ⏳</p>}

      {/* News */}
      <div className="grid">
        {!loading && articles.length === 0 ? (
          <p>No news found 😢</p>
        ) : (
          articles.map((item, index) => (
            <div className="card" key={index}>
              <img
                src={
                  item.image ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
              />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.url} target="_blank">
                Read More →
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
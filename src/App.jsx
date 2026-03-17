import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");

  
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const API_KEY = "d0a340b809b77c76ca20ea2e5474569f"; 

  const moodMap = {
    happy: "entertainment",
    sad: "health",
    angry: "general",
    focus: "technology",
  };

  // ✅ PWA install listener
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // ✅ Fetch news (SAFE VERSION)
  useEffect(() => {
    setLoading(true);

    fetch(
      `https://gnews.io/api/v4/search?q=${
        search || category
      }&country=in&apikey=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) {
          setArticles(data.articles);
        } else {
          console.log("API issue:", data);
          setArticles([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("Fetch error:", err);
        setArticles([]);
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

      {/* 🔥 Install Button */}
      {deferredPrompt && (
        <button
          onClick={() => deferredPrompt.prompt()}
          style={{
            padding: "10px 15px",
            background: "#38bdf8",
            border: "none",
            borderRadius: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          📲 Install App
        </button>
      )}

      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search news..."
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 😊 Mood Buttons */}
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

      {/* ⏳ Loading */}
      {loading && <p className="loading">Loading... ⏳</p>}

      {/* 📰 News */}
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
                alt="news"
              />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.url} target="_blank" rel="noreferrer">
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
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");

  // 📲 Install button
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Mood mapping (used as keywords)
  const moodMap = {
    happy: "space",
    sad: "mars",
    angry: "rocket",
    focus: "nasa",
  };

  // ✅ PWA install listener
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  // ✅ Fetch news (WORKS EVERYWHERE)
  useEffect(() => {
    setLoading(true);

    fetch("https://api.spaceflightnewsapi.net/v3/articles")
      .then((res) => res.json())
      .then((data) => {
        let filtered = data;

        // 🔍 Filter by mood/search
        if (search) {
          filtered = data.filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
          );
        } else {
          const keyword = moodMap[activeMood];
          filtered = data.filter((item) =>
            item.title.toLowerCase().includes(keyword)
          );
        }

        const formatted = filtered.slice(0, 10).map((item) => ({
          title: item.title,
          description: item.summary,
          image: item.imageUrl,
          url: item.url,
        }));

        setArticles(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setArticles([]);
        setLoading(false);
      });
  }, [activeMood, search]);

  const handleMood = (mood) => {
    setActiveMood(mood);
    setSearch("");
  };

  return (
    <div className="container">
      <h1>🧠 Mood News App</h1>

      {/* 📲 Install Button */}
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
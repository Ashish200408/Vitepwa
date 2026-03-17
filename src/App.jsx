import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const API_KEY = "gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5";

  const moodMap = {
    happy: "positive",
    sad: "world",
    angry: "politics",
    focus: "technology",
  };

  // 📲 Capture install event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // 📰 Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);

      try {
        const query = search || moodMap[activeMood] || "news";

        const res = await fetch(
          `https://api.currentsapi.services/v1/search?keywords=${query}&apiKey=${API_KEY}`
        );

        const data = await res.json();

        if (!data.news) {
          setArticles([]);
        } else {
          const formatted = data.news.slice(0, 10).map((item) => ({
            title: item.title,
            description: item.description,
            image: item.image,
            url: item.url,
          }));

          setArticles(formatted);
        }
      } catch (error) {
        console.log("ERROR:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeMood, search]);

  const handleMood = (mood) => {
    setActiveMood(mood);
    setSearch("");
  };

  // 📲 Install handler
  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("Install not ready. Try refresh or incognito.");
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="container">
      <h1>🧠 Mood News App</h1>

      {/* Install Button */}
      <button className="install-btn" onClick={handleInstall}>
        📲 Install App
      </button>

      {/* Search */}
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
          happy
        </button>

        <button
          className={activeMood === "sad" ? "active" : ""}
          onClick={() => handleMood("sad")}
        >
          sad
        </button>

        <button
          className={activeMood === "angry" ? "active" : ""}
          onClick={() => handleMood("angry")}
        >
          angry
        </button>

        <button
          className={activeMood === "focus" ? "active" : ""}
          onClick={() => handleMood("focus")}
        >
          focus
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="loading">Loading...</p>}

      {/* News */}
      <div className="grid">
        {!loading && articles.length === 0 ? (
          <p>No news found</p>
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
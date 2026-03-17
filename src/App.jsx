import { useEffect, useState } from "react";
import "./App.css";
import PWABadge from "./PWABadge";

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

  // ✅ Install event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ✅ Fetch news + fallback
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);

      try {
        const query = search || moodMap[activeMood] || "news";
        const apiUrl = `https://api.currentsapi.services/v1/search?keywords=${query}&apiKey=${API_KEY}`;
        
        console.log("📰 Fetching news for:", query);
        console.log("🔗 API URL:", apiUrl);

        const res = await fetch(apiUrl);
        const data = await res.json();

        console.log("📊 API Response:", data);

        if (data.news && data.news.length > 0) {
          const formatted = data.news.slice(0, 10).map((item) => ({
            title: item.title,
            description: item.description,
            image: item.image,
            url: item.url,
          }));

          console.log("✅ Articles loaded:", formatted.length);
          setArticles(formatted);
        } else {
          console.warn("⚠️ No news found in response");
          // 🔥 fallback (never empty UI)
          setArticles([
            {
              title: "No live news available",
              description: "Showing fallback content - " + (data.error || "No data received"),
              image: "",
              url: "#",
            },
          ]);
        }
      } catch (error) {
        console.error("❌ API ERROR:", error.message);

        // 🔥 fallback
        setArticles([
          {
            title: "Error loading news",
            description: error.message || "Check API key or internet connection",
            image: "",
            url: "#",
          },
        ]);
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

  // ✅ Install handler
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <>
      <PWABadge />
      <div className="container">
        <h1>🧠 Mood News App</h1>

      {/* ✅ Show only when available */}
      {deferredPrompt && (
        <button className="install-btn" onClick={handleInstall}>
          📲 Install App
        </button>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search news..."
        className="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Mood */}
      <div className="moods">
        {["happy", "sad", "angry", "focus"].map((mood) => (
          <button
            key={mood}
            className={activeMood === mood ? "active" : ""}
            onClick={() => handleMood(mood)}
          >
            {mood}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* News */}
      <div className="grid">
        {articles.map((item, index) => (
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
        ))}
      </div>
    </div>
    </>
  );
}

export default App;
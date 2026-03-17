import { useEffect, useState } from "react";
import "./App.css";
import PWABadge from "./PWABadge";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [error, setError] = useState(null);

  // API Key for CurrentsAPI only
  const CURRENTS_API_KEY = "gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5";

  // Mood-to-keywords mapping
  const moodMap = {
    happy: "success achievement inspiration",
    sad: "health wellness support",
    angry: "justice reform politics",
    focus: "technology science innovation",
  };

  // Mood descriptions
  const moodDescriptions = {
    happy: "😊 Inspirational & Success News",
    sad: "💚 Wellness & Support News",
    angry: "⚖️ Justice & Reform News",
    focus: "🔬 Technology & Science News"
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

  // ✅ Fetch news from CurrentsAPI only
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setArticles([]);

      try {
        const query = search || moodMap[activeMood];
        const moodLabel = moodDescriptions[activeMood];

        console.log(`🔄 Fetching news for: ${moodLabel}`);
        console.log(`🔍 Keywords: ${query}`);

        // Fetch from CurrentsAPI
        const currentsUrl = `https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(query)}&apiKey=${CURRENTS_API_KEY}`;

        const res = await fetch(currentsUrl);

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();

        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          const formatted = data.news
            .filter(item => item.title && item.description)
            .slice(0, 10)
            .map((item) => ({
              title: item.title,
              description: item.description || "Read full article for more details",
              image: item.image || "https://via.placeholder.com/400x300?text=No+Image",
              url: item.url || "#",
            }));

          if (formatted.length > 0) {
            console.log(`✅ Loaded ${formatted.length} articles from CurrentsAPI`);
            setArticles(formatted);
          } else {
            setError("No articles found with valid content");
          }
        } else {
          setError("No news available for this search");
        }
      } catch (err) {
        console.error("❌ Error fetching news:", err.message);
        setError(`Error: ${err.message}. Please check your API key or internet connection.`);
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

        {/* Install Button */}
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

        {/* Mood Buttons */}
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

        {/* Loading State */}
        {loading && <p className="loading">Loading news...</p>}

        {/* Error State */}
        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            <p style={{ fontSize: "0.9rem", marginTop: "5px" }}>
              Make sure your API key is valid and you have internet connection.
            </p>
          </div>
        )}

        {/* News Grid */}
        {!loading && articles.length > 0 && (
          <div className="grid">
            {articles.map((item, index) => (
              <div className="card" key={index}>
                <img src={item.image} alt="news" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  Read More →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && articles.length === 0 && !error && (
          <div className="no-results">
            <p>No articles found. Try a different mood or search term.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

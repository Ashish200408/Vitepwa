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
  const CURRENTS_API_KEY = "XQ3PCAtpkQ68jJO8xHcPAa0lfe2WXIU_g-4SQHykEbTQSWWO";

  // Mood-to-keywords mapping (VERY specific to get different news)
  const moodMap = {
    happy: "good news inspiring stories children smile laughter celebration awards",
    sad: "mental health depression support grief counseling therapy recovery wellness charity",
    angry: "protest strike labor rights corruption crime lawsuit investigation accountability",
    focus: "AI machine learning programming developer software coding tech startup innovation",
  };

  // Mood descriptions
  const moodDescriptions = {
    happy: "😊 Happy - Inspiring & Positive News",
    sad: "💚 Sad - Wellness & Mental Health News",
    angry: "⚖️ Angry - Justice & Reform News",
    focus: "🔬 Focus - Technology & Science News"
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

  // ✅ Fetch news from multiple reliable APIs with fallbacks
  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setArticles([]);

      try {
        const query = search || moodMap[activeMood];
        const moodLabel = moodDescriptions[activeMood];

        console.log(`🔄 Fetching news for: ${moodLabel}`);
        console.log(`🔍 Search Query: "${query}"`);
        console.log(`😊 Active Mood: ${activeMood.toUpperCase()}`);

        // Try NewsAPI.org (most reliable)
        try {
          console.log("📡 Fetching from NewsAPI...");
          const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=40&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(newsApiUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!res.ok) {
            throw new Error(`NewsAPI Error: ${res.status}`);
          }

          const data = await res.json();

          if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
            const formatted = data.articles
              .filter(item => {
                // Must have title, description, and a valid image URL
                const hasImage = item.urlToImage && (item.urlToImage.startsWith('http') || item.urlToImage.startsWith('https'));
                const hasContent = item.title && item.description && item.title !== "[Removed]";
                return hasImage && hasContent;
              })
              .slice(0, 10)
              .map((item) => ({
                title: item.title,
                description: item.description.substring(0, 150),
                image: item.urlToImage,
                url: item.url,
              }));

            if (formatted.length > 0 && isMounted) {
              console.log(`✅ Loaded ${formatted.length} articles from NewsAPI`);
              setArticles(formatted);
              setLoading(false);
              return;
            }
          }
          throw new Error("No valid articles found");
        } catch (newsApiError) {
          console.warn("⚠️ NewsAPI failed:", newsApiError.message);
        }

        // Fallback: Try Inshorts API
        if (!isMounted) return;
        try {
          console.log("📡 Trying alternative source...");
          const backupUrl = `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(query)}&language=en&pageSize=30&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(backupUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();

            if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
              const formatted = data.articles
                .filter(item => item.urlToImage && item.title && item.description)
                .slice(0, 10)
                .map((item) => ({
                  title: item.title,
                  description: item.description.substring(0, 150),
                  image: item.urlToImage,
                  url: item.url,
                }));

              if (formatted.length > 0 && isMounted) {
                console.log(`✅ Loaded ${formatted.length} articles from Headlines API`);
                setArticles(formatted);
                setLoading(false);
                return;
              }
            }
          }
        } catch (backupError) {
          console.warn("⚠️ Backup API failed:", backupError.message);
        }

        if (isMounted) {
          setError("⚠️ Unable to fetch news. Please check your internet connection and try again.");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Fatal error:", err.message);
        if (isMounted) {
          setError(`Error: ${err.message}`);
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
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
              title={moodDescriptions[mood]}
            >
              {mood}
            </button>
          ))}
        </div>

        {/* Show current mood being displayed */}
        {!search && (
          <p style={{ color: "#38bdf8", fontSize: "0.9rem", marginTop: "15px" }}>
            📰 {moodDescriptions[activeMood]}
          </p>
        )}

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
                <img 
                  src={item.image} 
                  alt={item.title}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=News+Story";
                  }}
                  style={{ objectFit: "cover", width: "100%", height: "200px" }}
                />
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

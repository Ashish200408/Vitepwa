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

  // ✅ Fetch news from multiple reliable APIs with fallbacks
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

        // Try NewsAPI.org (most reliable)
        try {
          console.log("📡 Fetching from NewsAPI...");
          const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=30&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

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

            if (formatted.length > 0) {
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

        // Fallback: Try Inshorts API (works well for general news)
        try {
          console.log("📡 Trying Inshorts API...");
          const insortsUrl = `https://inshortsapi.vercel.app/news?category=${query}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(insortsUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();

            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
              const formatted = data.data
                .filter(item => item.title && item.content && item.imageUrl)
                .slice(0, 10)
                .map((item) => ({
                  title: item.title,
                  description: item.content,
                  image: item.imageUrl,
                  url: item.readMoreUrl || "#",
                }));

              if (formatted.length > 0) {
                console.log(`✅ Loaded ${formatted.length} articles from Inshorts`);
                setArticles(formatted);
                setLoading(false);
                return;
              }
            }
          }
        } catch (inshortsError) {
          console.warn("⚠️ Inshorts failed:", inshortsError.message);
        }

        // Third fallback: Generic news with CORS proxy
        try {
          console.log("📡 Trying alternative news source...");
          const altUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://feeds.bloomberg.com/markets/news.rss`)}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(altUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (res.ok) {
            const xmlText = await res.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const items = xmlDoc.querySelectorAll("item");

            if (items.length > 0) {
              const formatted = Array.from(items)
                .slice(0, 10)
                .map((item) => ({
                  title: item.querySelector("title")?.textContent || "News",
                  description: item.querySelector("description")?.textContent?.substring(0, 200) || "Read more...",
                  image: "https://via.placeholder.com/400x300?text=News",
                  url: item.querySelector("link")?.textContent || "#",
                }));

              if (formatted.length > 0) {
                console.log(`✅ Loaded ${formatted.length} articles from RSS feed`);
                setArticles(formatted);
                setLoading(false);
                return;
              }
            }
          }
        } catch (rssError) {
          console.warn("⚠️ RSS feed failed:", rssError.message);
        }

        setError("⚠️ Unable to fetch news. Please check your internet connection and try again.");
      } catch (err) {
        console.error("❌ Fatal error:", err.message);
        setError(`Error: ${err.message}`);
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

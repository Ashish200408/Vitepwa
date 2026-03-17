import { useEffect, useState, useCallback } from "react";
import "./App.css";
import PWABadge from "./PWABadge";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [error, setError] = useState(null);

  // Different API keys for different moods - using free tier APIs
  const APIs = {
    happy: {
      name: "GNews API",
      url: (query) => `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=15&apikey=f923b91f7d0b35b1bb2d4f07d1e3c5a7`
    },
    sad: {
      name: "NewsData.io",
      url: (query) => `https://newsdata.io/api/1/news?q=${encodeURIComponent(query)}&language=en&apikey=pub_47b2c4cf89db3d7821d5af84b33942d1b3c3e`
    },
    angry: {
      name: "NewsAPI",
      url: (query) => `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`
    },
    focus: {
      name: "NewsAPI (Top Headlines)",
      url: (query) => `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(query)}&language=en&pageSize=20&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`
    }
  };

  // Mood-to-keywords mapping (very distinct)
  const moodMap = {
    happy: "happy inspiring celebration award achievement",
    sad: "mental health depression wellness therapy support",
    angry: "protest strike labor rights corruption",
    focus: "artificial intelligence programming coding developer",
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

  // Parse different API responses based on source
  const parseApiResponse = useCallback((data, apiName) => {
    let articles = [];

    if (apiName === "GNews API" && data.articles) {
      articles = data.articles.map(item => ({
        title: item.title,
        description: item.description || "Read full article",
        image: item.image || "https://via.placeholder.com/400x300?text=News",
        url: item.url,
      }));
    } else if (apiName === "NewsData.io" && data.results) {
      articles = data.results.map(item => ({
        title: item.title,
        description: item.description || "Read full article",
        image: item.image_url || "https://via.placeholder.com/400x300?text=News",
        url: item.link,
      }));
    } else if ((apiName === "NewsAPI" || apiName === "NewsAPI (Top Headlines)") && data.articles) {
      articles = data.articles.map(item => ({
        title: item.title,
        description: item.description || "Read full article",
        image: item.urlToImage || "https://via.placeholder.com/400x300?text=News",
        url: item.url,
      }));
    }

    return articles;
  }, []);

  // ✅ Fetch news based on mood using different APIs
  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setArticles([]);

      try {
        const query = search || moodMap[activeMood];
        const moodLabel = moodDescriptions[activeMood];
        const apiConfig = APIs[activeMood];

        console.log(`🔄 Fetching ${moodLabel}`);
        console.log(`📡 Using API: ${apiConfig.name}`);
        console.log(`🔍 Query: "${query}"`);

        const apiUrl = apiConfig.url(query);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();

        if (isMounted) {
          const parsed = parseApiResponse(data, apiConfig.name);
          
          // Filter for valid articles with images
          const validArticles = parsed
            .filter(item => {
              const hasValidImage = item.image && 
                                    item.image.startsWith('http') && 
                                    !item.image.includes('placeholder');
              const hasContent = item.title && item.description;
              return hasValidImage && hasContent;
            })
            .slice(0, 10)
            .map(item => ({
              ...item,
              description: item.description.substring(0, 150)
            }));

          if (validArticles.length > 0) {
            console.log(`✅ Loaded ${validArticles.length} articles from ${apiConfig.name}`);
            setArticles(validArticles);
          } else {
            console.warn("⚠️ No valid articles found, trying with placeholder images...");
            const allArticles = parsed
              .filter(item => item.title && item.description)
              .slice(0, 10)
              .map(item => ({
                ...item,
                description: item.description.substring(0, 150),
                image: item.image || "https://images.unsplash.com/photo-1495505442757-a1efb6729352?w=400&h=300&fit=crop"
              }));
            
            if (allArticles.length > 0) {
              setArticles(allArticles);
            } else {
              setError("No articles found. Please try another mood.");
            }
          }
        }
      } catch (err) {
        console.error("❌ Error fetching news:", err.message);
        if (isMounted) {
          setError(`Unable to fetch news: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [activeMood, search, parseApiResponse]);

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
              <div className="card" key={`${activeMood}-${index}`}>
                <div className="card-image-wrapper">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.parentElement) {
                        const placeholder = e.target.parentElement.querySelector('.placeholder-image');
                        if (placeholder) {
                          placeholder.style.display = "flex";
                        }
                      }
                    }}
                    loading="lazy"
                  />
                  <div className="placeholder-image">
                    📰
                  </div>
                </div>
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

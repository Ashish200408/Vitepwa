import { useEffect, useState } from "react";
import "./App.css";
import PWABadge from "./PWABadge";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Using NewsAPI (free tier at newsapi.org)
  const NEWS_API_KEY = "4fe5fbe73bc84bf2b6a3f96b3a9879e5";
  const CURRENTS_API_KEY = "gl7JoUc199uxMVp8rIZcZ8rxD3tjrBGAiL_NUyUJ_isIUBr5";

  // Sample news data as fallback
  const FALLBACK_NEWS = [
    {
      title: "Global Tech Innovation Reaches New Heights",
      description: "Latest developments in artificial intelligence and machine learning are transforming industries worldwide.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Renewable Energy Adoption Accelerates",
      description: "Countries worldwide are increasing their investment in sustainable energy solutions.",
      image: "https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Space Exploration Milestones Achieved",
      description: "Recent discoveries and achievements in space research continue to inspire exploration.",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Health Industry Embraces Digital Transformation",
      description: "Telemedicine and digital health platforms are revolutionizing patient care.",
      image: "https://images.unsplash.com/photo-1576091160550-112173e7f869?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "E-Commerce Growth Continues Globally",
      description: "Online retail platforms report record-breaking sales and user engagement.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Education Technology Revolution",
      description: "EdTech platforms are transforming how people learn and acquire new skills.",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Cybersecurity Threats and Solutions",
      description: "Organizations invest heavily in protecting digital assets from emerging threats.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Entertainment Industry Goes Digital",
      description: "Streaming services continue to dominate the entertainment landscape.",
      image: "https://images.unsplash.com/photo-1533928298208-27ff66555d92?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Transportation Evolution Accelerates",
      description: "Electric and autonomous vehicles are changing how people commute.",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop",
      url: "#"
    },
    {
      title: "Business Innovation and Startups",
      description: "New business models and startup ecosystems are driving economic growth.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      url: "#"
    }
  ];

  const moodMap = {
    happy: "inspirational",
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
        
        console.log("📰 Fetching news for:", query);

        // Try NewsAPI first
        try {
          const newsApiUrl = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`;
          console.log("🔗 Trying NewsAPI...");
          
          const res = await fetch(newsApiUrl);
          const data = await res.json();

          if (data.articles && data.articles.length > 0) {
            const formatted = data.articles.slice(0, 10).map((item) => ({
              title: item.title,
              description: item.description,
              image: item.urlToImage,
              url: item.url,
            }));

            console.log("✅ NewsAPI - Articles loaded:", formatted.length);
            setArticles(formatted);
            setLoading(false);
            return;
          }
        } catch (newsApiError) {
          console.warn("⚠️ NewsAPI failed, trying CurrentsAPI...", newsApiError.message);
        }

        // Try CurrentsAPI as backup
        try {
          const currentsUrl = `https://api.currentsapi.services/v1/search?keywords=${query}&apiKey=${CURRENTS_API_KEY}`;
          console.log("🔗 Trying CurrentsAPI...");
          
          const res = await fetch(currentsUrl);
          const data = await res.json();

          if (data.news && data.news.length > 0) {
            const formatted = data.news.slice(0, 10).map((item) => ({
              title: item.title,
              description: item.description,
              image: item.image,
              url: item.url,
            }));

            console.log("✅ CurrentsAPI - Articles loaded:", formatted.length);
            setArticles(formatted);
            setLoading(false);
            return;
          }
        } catch (currentsError) {
          console.warn("⚠️ CurrentsAPI failed too...", currentsError.message);
        }

        // Use fallback sample news
        console.log("📌 Using fallback sample news...");
        setArticles(FALLBACK_NEWS);

      } catch (error) {
        console.error("❌ Critical error:", error.message);
        setArticles(FALLBACK_NEWS);
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
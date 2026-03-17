import { useEffect, useState } from "react";
import "./App.css";
import PWABadge from "./PWABadge";

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState("happy");
  const [search, setSearch] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Better mood-to-keywords mapping for more relevant news
  const moodMap = {
    happy: "inspirational success motivation achievement",
    sad: "wellness support compassion recovery",
    angry: "justice reform accountability activism",
    focus: "technology science innovation discovery",
  };

  // Mood-specific descriptions
  const moodDescriptions = {
    happy: "😊 Inspirational & Success News",
    sad: "💚 Wellness & Support News",
    angry: "⚖️ Justice & Reform News",
    focus: "🔬 Technology & Science News"
  };

  // Mood-specific sample news data
  const moodNews = {
    happy: [
      {
        title: "People Inspire Through Unexpected Acts of Kindness",
        description: "Communities celebrate the power of compassion in everyday moments.",
        image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Scientists Make Breakthrough in Renewable Energy",
        description: "New clean energy solutions show record efficiency levels.",
        image: "https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Student Wins International Innovation Award",
        description: "Young inventor creates solution to global water scarcity.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Local Business Reaches Million Customer Milestone",
        description: "Success story shows power of determination and quality service.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Space Agency Announces New Exoplanet Discovery",
        description: "Groundbreaking telescope captures images of potentially habitable world.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Athletes Break World Records in Inspiring Performances",
        description: "New standards set in multiple sporting disciplines.",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Musicians Perform for Global Charity Concert",
        description: "Record-breaking fundraiser supports education initiatives worldwide.",
        image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Tech Leaders Pledge Support for Social Programs",
        description: "Major investments announced for community development projects.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Health Breakthrough Offers Hope for Patients",
        description: "New treatment shows promising results in clinical trials.",
        image: "https://images.unsplash.com/photo-1576091160550-112173e7f869?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Young Entrepreneur Launches Sustainable Fashion Line",
        description: "Eco-friendly brand gains momentum with conscious consumers.",
        image: "https://images.unsplash.com/photo-1552082927-30922dc3e897?w=400&h=300&fit=crop",
        url: "#"
      }
    ],
    sad: [
      {
        title: "Global Support Networks Focus on Mental Health Awareness",
        description: "Communities unite to break stigma around wellness discussions.",
        image: "https://images.unsplash.com/photo-1576091160550-112173e7f869?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Healthcare Initiatives Expand Access to Services",
        description: "New programs bring support to underserved populations.",
        image: "https://images.unsplash.com/photo-1579154204601-01d5d0db8d70?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Humanitarian Organizations Launch Relief Efforts",
        description: "Global response to emerging humanitarian challenges.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Crisis Support Lines See Increased Awareness",
        description: "Resources available for those going through difficult times.",
        image: "https://images.unsplash.com/photo-1516534775068-bb57e39c6d6b?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Environmental Conservation Efforts Gain Momentum",
        description: "Community action fights climate change challenges.",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Social Workers Win Recognition for Service",
        description: "Heroes honored for dedicated work in communities.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Refugee Programs Help Families Rebuild Lives",
        description: "Success stories show resilience and hope.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Disaster Relief Organizations Raise Essential Funds",
        description: "Communities come together to support recovery efforts.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Wildlife Protection Groups Fight Extinction Threats",
        description: "Conservation initiatives save endangered species.",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Poverty Reduction Programs Show Success",
        description: "Economic initiatives lift communities out of hardship.",
        image: "https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=300&fit=crop",
        url: "#"
      }
    ],
    angry: [
      {
        title: "Accountability Measures Strengthen Democratic Process",
        description: "New regulations ensure transparency in governance.",
        image: "https://images.unsplash.com/photo-1552644349-9c6b1a8b3f5f?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Labor Rights Protection Advances Globally",
        description: "Workers gain stronger legal protections nationwide.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Anti-Corruption Task Force Delivers Results",
        description: "Major investigations hold officials accountable.",
        image: "https://images.unsplash.com/photo-1552644349-9c6b1a8b3f5f?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Equality Act Passes Major Legislative Vote",
        description: "Historic moment for civil rights advocates.",
        image: "https://images.unsplash.com/photo-1552644349-9c6b1a8b3f5f?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Environmental Activists Win Legal Victory",
        description: "Court ruling protects vital natural resources.",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Criminal Justice Reform Legislation Advances",
        description: "Comprehensive changes address systemic issues.",
        image: "https://images.unsplash.com/photo-1552644349-9c6b1a8b3f5f?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Activist Movement Challenges Injustice",
        description: "Peaceful protests drive policy changes.",
        image: "https://images.unsplash.com/photo-1552644349-9c6b1a8b3f5f?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Healthcare Access Rights Expanded",
        description: "Legal action secures medical care for vulnerable populations.",
        image: "https://images.unsplash.com/photo-1576091160550-112173e7f869?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Consumer Protection Agency Wins Major Case",
        description: "Corporate accountability enforced through legal action.",
        image: "https://images.unsplash.com/photo-1552644349-9c6b1a8b3f5f?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "International Court Addresses War Crimes",
        description: "Justice prevails in pursuit of accountability.",
        image: "https://images.unsplash.com/photo-1552644349-9c6b1a8b3f5f?w=400&h=300&fit=crop",
        url: "#"
      }
    ],
    focus: [
      {
        title: "AI Researchers Achieve Major Breakthrough",
        description: "New artificial intelligence methods accelerate innovation.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Quantum Computing Reaches New Milestone",
        description: "Scientists solve previously impossible computational problems.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Space Mission Discovers Water on Mars",
        description: "NASA findings suggest conditions for life on red planet.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Biotechnology Company Develops Gene Therapy",
        description: "Breakthrough treatment offers hope for genetic diseases.",
        image: "https://images.unsplash.com/photo-1576091160550-112173e7f869?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Renewable Energy Innovation Doubles Efficiency",
        description: "Solar panel technology reaches record output levels.",
        image: "https://images.unsplash.com/photo-1509391366360-2e938aa1ef14?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Tech Company Releases Revolutionary Device",
        description: "New gadget changes how people interact with technology.",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Neuroscience Study Unlocks Brain Mysteries",
        description: "Research provides new insights into consciousness.",
        image: "https://images.unsplash.com/photo-1576091160550-112173e7f869?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Cybersecurity Innovation Prevents Major Attack",
        description: "New defense system blocks unprecedented threats.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Physics Team Confirms Theoretical Prediction",
        description: "Experimental evidence validates decades-old theory.",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
        url: "#"
      },
      {
        title: "Medical Device Wins FDA Approval",
        description: "Innovative technology offers new treatment options.",
        image: "https://images.unsplash.com/photo-1576091160550-112173e7f869?w=400&h=300&fit=crop",
        url: "#"
      }
    ]
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

  // ✅ Real-time fetch news based on mood
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setArticles([]); // Clear old articles immediately for instant feedback

      try {
        const query = search || moodMap[activeMood];
        const moodLabel = moodDescriptions[activeMood];
        
        console.log(`🔄 REAL-TIME FETCH: ${moodLabel}`);
        console.log(`🔍 Query: ${query}`);

        // Try NewsAPI first (most reliable)
        try {
          const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=10&apiKey=4fe5fbe73bc84bf2b6a3f96b3a9879e5`;
          console.log("📡 Fetching from NewsAPI...");
          
          const res = await fetch(newsApiUrl);
          const data = await res.json();

          if (data.articles && data.articles.length > 0) {
            const formatted = data.articles
              .filter(item => item.urlToImage && item.title && item.description)
              .slice(0, 10)
              .map((item) => ({
                title: item.title,
                description: item.description || "Read more for details",
                image: item.urlToImage,
                url: item.url || "#",
              }));

            if (formatted.length > 0) {
              console.log(`✅ SUCCESS! Loaded ${formatted.length} real articles for "${activeMood}"`);
              setArticles(formatted);
              setLoading(false);
              return;
            }
          }
        } catch (newsApiError) {
          console.warn("⚠️ NewsAPI slow/blocked, trying GNews...");
        }

        // Try GNews API as backup
        try {
          const gNewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10`;
          console.log("📡 Trying GNews API...");
          
          const res = await fetch(gNewsUrl);
          const data = await res.json();

          if (data.articles && data.articles.length > 0) {
            const formatted = data.articles
              .filter(item => item.title)
              .slice(0, 10)
              .map((item) => ({
                title: item.title,
                description: item.description || "Click read more for full story",
                image: item.image || "https://images.unsplash.com/photo-1585776245865-c172fedac882?w=400&h=300&fit=crop",
                url: item.url || "#",
              }));

            if (formatted.length > 0) {
              console.log(`✅ Loaded ${formatted.length} articles from GNews for "${activeMood}"`);
              setArticles(formatted);
              setLoading(false);
              return;
            }
          }
        } catch (gNewsError) {
          console.warn("⚠️ GNews failed, using mood-specific sample data...");
        }

        // Fallback: Use mood-specific sample news
        console.log(`📭 Using mood-specific sample data for "${activeMood}"`);
        const defaultNews = moodNews[activeMood] || moodNews.happy;
        setArticles(defaultNews);

      } catch (error) {
        console.error("❌ Error:", error.message);
        // Final fallback
        setArticles(moodNews.happy);
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
        {loading && <p className="loading">Loading news...</p>}

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

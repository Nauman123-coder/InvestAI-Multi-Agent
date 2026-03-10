import { useState, useEffect } from "react";
import { Ticker, Navbar, ApiKeyModal } from "./components/shared.jsx";
import HomePage       from "./pages/HomePage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import MarketsPage    from "./pages/MarketsPage.jsx";
import ChatPage       from "./pages/ChatPage.jsx";
import "./styles/globals.css";

const STORE_KEY = "investiq_groq_key_v5";

export default function App() {
  const [page,      setPage]     = useState("home");
  const [apiKey,    setApiKey]   = useState(() => { try { return localStorage.getItem(STORE_KEY)||""; } catch { return ""; } });
  const [showModal, setModal]    = useState(false);
  const [chatQuery, setQuery]    = useState(null);

  const isChat = page === "chat";

  // Scroll to top on page change (not for chat — it's fixed-height)
  useEffect(() => {
    if (!isChat) window.scrollTo({ top:0, behavior:"smooth" });
  }, [page]);

  const navigate = (p) => {
    if (p === "chat" && !apiKey) { setModal(true); return; }
    setPage(p);
  };

  const saveKey = (k) => {
    setApiKey(k);
    try { localStorage.setItem(STORE_KEY, k); } catch {}
    setModal(false);
    setPage("chat");
  };

  const handleAnalyze = (query) => {
    setQuery(query);
    if (!apiKey) { setModal(true); return; }
    setPage("chat");
  };

  return (
    <>
      {showModal && <ApiKeyModal onSave={saveKey}/>}

      {/* On chat page: fixed full-height shell, no ticker */}
      {isChat ? (
        <div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",background:"var(--bg)",color:"var(--text)"}}>
          <Navbar page={page} setPage={navigate}/>
          {apiKey ? (
            <ChatPage
              key={chatQuery || "chat"}
              apiKey={apiKey}
              initialQuery={chatQuery}
            />
          ) : (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <button className="btn btn-gold" onClick={()=>setModal(true)}>
                Connect Groq API to start →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{background:"var(--bg)",color:"var(--text)",minHeight:"100vh"}}>
          <Ticker/>
          <Navbar page={page} setPage={navigate}/>
          {page === "home"    && <HomePage setPage={navigate} onAnalyze={handleAnalyze}/>}
          {page === "how"     && <HowItWorksPage setPage={navigate}/>}
          {page === "markets" && <MarketsPage onAnalyze={handleAnalyze}/>}
        </div>
      )}
    </>
  );
}
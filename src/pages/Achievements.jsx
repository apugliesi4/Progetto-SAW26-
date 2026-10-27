import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AchievementsPanel from "../components/AchievementsPanel";
import { useAuth } from "../context/AuthContext";
import { subscribeToUnlockedAchievements } from "../lib/achievements";
import Footer from "../components/Footer";

export default function Achievements() {
  const { user } = useAuth();
  const [unlockedAchievements, setUnlockedAchievements] = useState({});

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUnlockedAchievements(user.uid, setUnlockedAchievements);
    return unsubscribe;
  }, [user]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <Link to="/" className="icon-button" title="Torna indietro">
          <ArrowLeft size={20} />
        </Link>
      <h1 style={{ textAlign: "center", width: "100%" }}>I tuoi 🌟<i>impressionanti</i>🌟 traguardi</h1>
    <div style={{ width: 20 }} />
    </header>

      <AchievementsPanel unlocked={unlockedAchievements} />
      <Footer />
    </div>
  );
}
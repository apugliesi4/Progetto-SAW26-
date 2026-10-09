import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AchievementsPanel from "../components/AchievementsPanel";
import { useAuth } from "../context/AuthContext";
import { subscribeToUnlockedAchievements } from "../lib/achievements";
import { Undo2 } from "lucide-react";
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
        <h1>Traguardi</h1>
        <Link className="icon-button" to="/">
          <Undo2 size={20} />
        </Link>
      </header>

      <AchievementsPanel unlocked={unlockedAchievements} />
      <Footer />
    </div>
  );
}
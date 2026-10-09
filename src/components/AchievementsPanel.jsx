import { ACHIEVEMENTS } from "../lib/achievements";
import { Lock } from "lucide-react";

export default function AchievementsPanel({ unlocked }) {
  return (
    <section className="achievements-section">
      <h2>Traguardi</h2>
      <div className="achievements-grid">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = Boolean(unlocked[a.id]);
          return (
            <div
              key={a.id}
              className={`achievement-card ${isUnlocked ? "achievement-unlocked" : "achievement-locked"}`}
            >
              <span className="achievement-icon">{isUnlocked ? "🏆" : <Lock size={20} />}</span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
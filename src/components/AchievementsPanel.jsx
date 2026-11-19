import { Lock } from "lucide-react";
import { ACHIEVEMENTS } from "../lib/achievements";

// Griglia dei traguardi sbloccabili dall'utente
export default function AchievementsPanel({ unlocked = {} }) {
  return (
    <section className="achievements-section">
      <h2>Traguardi</h2>
      <div className="achievements-grid">
        {ACHIEVEMENTS.map((a) => {
          // Verifica se l'ID del traguardo è presente tra quelli sbloccati
          const isUnlocked = Boolean(unlocked[a.id]);

          return (
            <div
              key={a.id}
              className={`achievement-card ${isUnlocked ? "achievement-unlocked" : "achievement-locked"}`}
            >
              <span className="achievement-icon" aria-hidden="true">
                {isUnlocked ? "🏆" : <Lock size={20} />}
              </span>
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
import { ChartLineUpIcon } from "@phosphor-icons/react";

import "@/styles/components/Profile/Stats.css";

export default function Stats() {
  return (
    <section className="stats">
      <div className="stats__card">
        <div className="stats__icon">
          <ChartLineUpIcon size={32} weight="duotone" aria-hidden="true" />
        </div>

        <span className="stats__badge">Coming Soon</span>

        <h2 className="stats__title">Your Stats are on the way</h2>

        <p className="stats__description">
          We’re working on something awesome to help you understand your anime
          journey — from what you watch to how you watch it.
        </p>

        <div className="stats__preview">
          <span>📊</span>
          <span>Charts</span>

          <span>•</span>

          <span>📈</span>
          <span>Watch trends</span>

          <span>•</span>

          <span>🎯</span>
          <span>Personal records</span>
        </div>
      </div>
    </section>
  );
}

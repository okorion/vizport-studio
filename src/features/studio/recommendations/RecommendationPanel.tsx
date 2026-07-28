"use client";

import { Check, Info, Sparkles } from "lucide-react";
import { useStudioStore } from "@/src/features/studio/studio.store";
import { AiRefinePanel } from "@/src/features/studio/recommendations/AiRefinePanel";

export function RecommendationPanel() {
  const {
    profile,
    recommendations,
    selectedRecommendationId,
    selectRecommendation,
  } = useStudioStore();

  return (
    <section className="panel recommendation-panel" aria-labelledby="recommendation-title">
      <div className="panel-heading compact-heading">
        <div>
          <span className="eyebrow">STEP 2</span>
          <h2 id="recommendation-title">추천 그래프</h2>
        </div>
        <span className="profile-count">
          {profile.rowCount.toLocaleString()}행 · {profile.fields.length}열
        </span>
      </div>

      <div className="field-chips" aria-label="감지된 데이터 필드">
        {profile.fields.slice(0, 6).map((field) => (
          <span className={`field-chip field-chip-${field.kind}`} key={field.key}>
            {field.key}
            <small>{field.kind === "quantitative" ? "수치" : field.kind === "temporal" ? "시간" : "범주"}</small>
          </span>
        ))}
      </div>

      <div className="recommendation-list">
        {recommendations.map((recommendation, index) => {
          const selected = recommendation.id === selectedRecommendationId;
          return (
            <button
              className={`recommendation-card${selected ? " is-selected" : ""}`}
              key={recommendation.id}
              type="button"
              onClick={() => selectRecommendation(recommendation.id)}
              aria-pressed={selected}
            >
              <span className="recommendation-rank">{index + 1}</span>
              <span className="recommendation-copy">
                <strong>{recommendation.label}</strong>
                <span>{recommendation.reason}</span>
                {recommendation.aiReason ? (
                  <small className="ai-reason">
                    <Sparkles size={12} aria-hidden="true" /> {recommendation.aiReason}
                  </small>
                ) : null}
                {recommendation.caution ? (
                  <small><Info size={13} aria-hidden="true" /> {recommendation.caution}</small>
                ) : null}
              </span>
              <span className="score-badge">
                {recommendation.score}
                {selected ? <Check size={12} aria-hidden="true" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <AiRefinePanel />
    </section>
  );
}

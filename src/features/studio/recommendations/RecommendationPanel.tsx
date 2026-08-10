"use client";

import { Check, Info, Sparkles } from "lucide-react";
import { useStudioStore } from "@/src/features/studio/studio.store";
import { AiRefinePanel } from "@/src/features/studio/recommendations/AiRefinePanel";

export function RecommendationPanel() {
  const {
    profile,
    recommendations,
    selectedRecommendationId,
    hasUnanalyzedChanges,
    selectRecommendation,
  } = useStudioStore();

  return (
    <section
      className="panel recommendation-panel"
      id="recommendations"
      aria-labelledby="recommendation-title"
    >
      <div className="panel-heading compact-heading">
        <div>
          <span className="eyebrow">STEP 2</span>
          <h2 id="recommendation-title">추천 그래프</h2>
        </div>
        <span className="profile-count">
          {hasUnanalyzedChanges
            ? "분석 필요"
            : `${profile.rowCount.toLocaleString()}행 · ${profile.fields.length}열`}
        </span>
      </div>

      {hasUnanalyzedChanges ? (
        <div className="pending-result" role="status">
          <strong>새 입력을 아직 분석하지 않았어요.</strong>
          <span>이전 결과를 섞지 않도록 추천과 내보내기를 잠시 멈췄습니다.</span>
          <a href="#data">STEP 1에서 변경사항 분석하기</a>
        </div>
      ) : (
        <>
          <div className="field-chips" role="list" aria-label="감지된 데이터 필드">
            {profile.fields.slice(0, 6).map((field) => (
              <span
                className={`field-chip field-chip-${field.kind}`}
                key={field.key}
                role="listitem"
              >
                {field.key}
                <small>
                  {field.kind === "quantitative"
                    ? "수치"
                    : field.kind === "temporal"
                      ? "시간"
                      : "범주"}
                </small>
              </span>
            ))}
          </div>

          {recommendations.length > 0 ? (
            <>
              <p className="panel-hint">1위 추천이 선택되어 있어요. 다른 카드를 누르면 미리보기가 바로 바뀝니다.</p>

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
                      aria-controls="preview"
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
            </>
          ) : (
            <div className="pending-result" role="status">
              <strong>추천 가능한 그래프가 없어요.</strong>
              <span>수치 필드가 하나 이상 포함된 데이터를 넣어 주세요.</span>
              <a href="#data">STEP 1에서 데이터 수정하기</a>
            </div>
          )}
        </>
      )}
    </section>
  );
}

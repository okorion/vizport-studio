"use client";

import { ArrowDownRight, BarChart3, ChevronRight, GitBranch, Sparkles } from "lucide-react";
import { DataInputPanel } from "@/src/features/studio/import/DataInputPanel";
import { RecommendationPanel } from "@/src/features/studio/recommendations/RecommendationPanel";
import { PreviewPanel } from "@/src/features/studio/preview/PreviewPanel";
import { OutputPanel } from "@/src/features/studio/export/OutputPanel";
import { ProjectActions } from "@/src/features/studio/ProjectActions";

export function StudioPage() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="VizPort Studio 홈">
          <span className="brand-mark"><BarChart3 size={19} aria-hidden="true" /></span>
          <span>
            <strong>VizPort</strong>
            <small>Visualization Studio</small>
          </span>
        </a>

        <nav className="flow-nav" aria-label="작업 단계">
          <a href="#data"><span>1</span> 데이터</a><ChevronRight size={13} />
          <a href="#recommendations"><span>2</span> 추천</a><ChevronRight size={13} />
          <a href="#preview"><span>3</span> 미리보기</a><ChevronRight size={13} />
          <a href="#export"><span>4</span> 내보내기</a>
        </nav>

        <div className="topbar-actions">
          <span className="local-badge"><Sparkles size={14} aria-hidden="true" /> Local-first</span>
          <ProjectActions />
          <a
            className="github-link"
            href="https://github.com/okorion/vizport-studio"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 저장소 열기"
          >
            <GitBranch size={17} aria-hidden="true" />
          </a>
        </div>
      </header>

      <div className="hero-strip" id="top">
        <div>
          <span className="hero-kicker">DATA TO PORTABLE VISUALIZATION</span>
          <h1>데이터를 넣으면, 프로젝트에 바로 옮길 수 있는 그래프가 됩니다.</h1>
        </div>
        <p>
          데이터 구조를 로컬에서 읽고 적합한 표현을 추천합니다. 결과는 미리 확인한 뒤
          React 코드, LLM 프롬프트 또는 명세로 가져가세요.
        </p>
      </div>

      <section className="quick-start" aria-labelledby="quick-start-title">
        <div className="quick-start-intro">
          <span>처음이라면</span>
          <div>
            <strong id="quick-start-title">샘플로 30초 체험</strong>
            <p>샘플은 이미 분석되어 있어요. 내 데이터는 STEP 1에 넣고 변경사항을 분석하세요.</p>
          </div>
        </div>
        <ol>
          <li><span>1</span>추천 그래프 선택</li>
          <li><span>2</span>미리보기 확인</li>
          <li><span>3</span>React 코드 복사</li>
        </ol>
        <a className="quick-start-link" href="#recommendations">
          샘플 추천 보기 <ArrowDownRight size={15} aria-hidden="true" />
        </a>
      </section>

      <div className="studio-layout">
        <aside className="studio-sidebar">
          <DataInputPanel />
          <RecommendationPanel />
        </aside>
        <div className="studio-workspace">
          <PreviewPanel />
          <OutputPanel />
        </div>
      </div>
    </main>
  );
}

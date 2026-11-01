import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoadingBlock } from '../components/States';
import { RootLayout } from './RootLayout';
import { AboutPage } from '../pages/AboutPage';
import { CommunityPage } from '../pages/CommunityPage';
import { CompetitionCatalogPage } from '../pages/CompetitionCatalogPage';
import { CompetitionDetailPage } from '../pages/CompetitionDetailPage';
import { ContributePage } from '../pages/ContributePage';
import { DataPolicyPage } from '../pages/DataPolicyPage';
import { GuidesPage } from '../pages/GuidesPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PlannerPage } from '../pages/PlannerPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { RankingsPage } from '../pages/RankingsPage';
import { ScoringMethodPage } from '../pages/ScoringMethodPage';
import { SkillDetailPage } from '../pages/SkillDetailPage';
import { SkillsPage } from '../pages/SkillsPage';

const GuideDetailPage = lazy(() =>
  import('../pages/GuideDetailPage').then((module) => ({ default: module.GuideDetailPage })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="competitions" element={<CompetitionCatalogPage />} />
        <Route path="competitions/:competitionId" element={<CompetitionDetailPage />} />
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="skills/:skillId" element={<SkillDetailPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="guides" element={<GuidesPage />} />
        <Route
          path="guides/:slug"
          element={
            <Suspense fallback={<LoadingBlock label="正在加载文章…" />}>
              <GuideDetailPage />
            </Suspense>
          }
        />
        <Route path="community" element={<CommunityPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contribute" element={<ContributePage />} />
        <Route path="data-policy" element={<DataPolicyPage />} />
        <Route path="scoring-method" element={<ScoringMethodPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/') return undefined;
  return base.replace(/\/$/, '');
}

export function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <AppRoutes />
    </BrowserRouter>
  );
}

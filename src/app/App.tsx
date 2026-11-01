import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PageSkeleton } from '../components/PageSkeleton';
import { RootLayout } from './RootLayout';

const ForumCategoryPage = lazy(() =>
  import('../pages/ForumCategoryPage').then((module) => ({
    default: module.ForumCategoryPage,
  })),
);

const CategoriesPage = lazy(() =>
  import('../pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })),
);

const CategoryDetailPage = lazy(() =>
  import('../pages/CategoryDetailPage').then((module) => ({
    default: module.CategoryDetailPage,
  })),
);
import { AboutPage } from '../pages/AboutPage';
import { CommunityPage } from '../pages/CommunityPage';
import { CareersPage } from '../pages/CareersPage';
import { CompanyDetailPage } from '../pages/CompanyDetailPage';
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

const SubmitCompetitionPage = lazy(() =>
  import('../pages/SubmitCompetitionPage').then((module) => ({
    default: module.SubmitCompetitionPage,
  })),
);

const SubmitReviewPage = lazy(() =>
  import('../pages/SubmitReviewPage').then((module) => ({
    default: module.SubmitReviewPage,
  })),
);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="competitions" element={<CompetitionCatalogPage />} />
        <Route path="competitions/:competitionId" element={<CompetitionDetailPage />} />
        <Route
          path="categories"
          element={
            <Suspense fallback={<PageSkeleton label="正在加载竞赛类别…" />}>
              <CategoriesPage />
            </Suspense>
          }
        />
        <Route
          path="categories/:domainId"
          element={
            <Suspense fallback={<PageSkeleton label="正在加载竞赛类别…" />}>
              <CategoryDetailPage />
            </Suspense>
          }
        />
        <Route path="rankings" element={<RankingsPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="careers/:companyId" element={<CompanyDetailPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="skills/:skillId" element={<SkillDetailPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="guides" element={<GuidesPage />} />
        <Route
          path="guides/:slug"
          element={
            <Suspense fallback={<PageSkeleton label="正在加载文章…" />}>
              <GuideDetailPage />
            </Suspense>
          }
        />
        <Route path="community" element={<CommunityPage />} />
        <Route path="forum" element={<CommunityPage />} />
        <Route
          path="forum/:slug"
          element={
            <Suspense fallback={<PageSkeleton label="正在加载论坛分类…" />}>
              <ForumCategoryPage />
            </Suspense>
          }
        />
        <Route path="about" element={<AboutPage />} />
        <Route path="contribute" element={<ContributePage />} />
        <Route
          path="submit-competition"
          element={
            <Suspense fallback={<PageSkeleton label="正在加载提交表单…" />}>
              <SubmitCompetitionPage />
            </Suspense>
          }
        />
        <Route
          path="submit-review"
          element={
            <Suspense fallback={<PageSkeleton label="正在加载评价表单…" />}>
              <SubmitReviewPage />
            </Suspense>
          }
        />
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

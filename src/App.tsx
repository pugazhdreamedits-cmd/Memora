import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { getSession } from "@/lib/auth";
import { ProfileStore } from "@/lib/storage";

const Landing = lazy(() => import("@/pages/Landing"));
const Auth = lazy(() => import("@/pages/Auth"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const StudySession = lazy(() => import("@/pages/StudySession"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const MemoryLandscape = lazy(() => import("@/pages/MemoryLandscape"));
const MemoryDNA = lazy(() => import("@/pages/MemoryDNA"));
const RetentionForecast = lazy(() => import("@/pages/RetentionForecast"));
const RecoveryMode = lazy(() => import("@/pages/RecoveryMode"));
const Insights = lazy(() => import("@/pages/Insights"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const History = lazy(() => import("@/pages/History"));
const Profile = lazy(() => import("@/pages/Profile"));
const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const QuestionLab = lazy(() => import("@/pages/QuestionLab"));
const QuestionLabTake = lazy(() => import("@/pages/QuestionLabTake"));

const Loader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
  </div>
);

function ProtectedApp() {
  return (
    <AppLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/study" element={<StudySession />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/question-lab" element={<QuestionLab />} />
          <Route path="/question-lab/take" element={<QuestionLabTake />} />
          <Route path="/landscape" element={<MemoryLandscape />} />
          <Route path="/dna" element={<MemoryDNA />} />
          <Route path="/forecast" element={<RetentionForecast />} />
          <Route path="/recovery" element={<RecoveryMode />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) return <Navigate to="/auth" replace />;
  const profile = ProfileStore.getByUser(session.userId);
  if (!profile?.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#131923",
            border: "1px solid #243447",
            color: "#F1F5F9",
            fontSize: "14px",
          },
        }}
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/*" element={<RequireAuth><ProtectedApp /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

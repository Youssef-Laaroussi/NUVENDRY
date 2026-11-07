import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LearnerLayout } from './layouts/LearnerLayout';
import { MerchantLayout } from './layouts/MerchantLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { WorkshopsMarketplace } from './pages/WorkshopsMarketplace';
import { WorkshopDetail } from './pages/WorkshopDetail';
import { DemandIntroPage } from './pages/DemandIntroPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { RewardsPage } from './pages/RewardsPage';
import { ForInstructorsPage } from './pages/ForInstructorsPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Learner Pages
import { LearnerOverview } from './pages/learner/LearnerOverview';
import { MyDemands } from './pages/learner/MyDemands';
import { DiscoverDemands } from './pages/learner/DiscoverDemands';
import { LearnerRecommendations } from './pages/learner/LearnerRecommendations';
import { LearnerReservations } from './pages/learner/LearnerReservations';
import { LearnerRewards } from './pages/learner/LearnerRewards';
import { LearnerReferrals } from './pages/learner/LearnerReferrals';
import { LearnerSettings } from './pages/learner/LearnerSettings';

// Merchant Pages
import { MerchantOverview } from './pages/merchant/MerchantOverview';
import { DemandIntelligence } from './pages/merchant/DemandIntelligence';
import { OfferStudio } from './pages/merchant/OfferStudio';
import { MerchantWorkshops } from './pages/merchant/MerchantWorkshops';
import { MerchantReservations } from './pages/merchant/MerchantReservations';
import { RewardStudio } from './pages/merchant/RewardStudio';
import { MerchantPayments } from './pages/merchant/MerchantPayments';
import { MerchantAnalytics } from './pages/merchant/MerchantAnalytics';
import { ResearchLab } from './pages/merchant/ResearchLab';
import { MerchantSettings } from './pages/merchant/MerchantSettings';

// Admin Page
import { AdminOverview } from './pages/admin/AdminOverview';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Public Marketing Routes: includes marketing Navbar + Marketing Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/workshops" element={<WorkshopsMarketplace />} />
            <Route path="/workshops/:id" element={<WorkshopDetail />} />
            <Route path="/demand" element={<DemandIntroPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/for-instructors" element={<ForInstructorsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* 2. Authentication Routes: focused auth shell without marketing footer */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Route>

          {/* 3. Authenticated Learner Workspace: dedicated app topbar + persistent learner sidebar */}
          <Route element={<LearnerLayout />}>
            <Route path="/app/overview" element={<LearnerOverview />} />
            <Route path="/app/my-demands" element={<MyDemands />} />
            <Route path="/app/discover" element={<DiscoverDemands />} />
            <Route path="/app/recommendations" element={<LearnerRecommendations />} />
            <Route path="/app/reservations" element={<LearnerReservations />} />
            <Route path="/app/rewards" element={<LearnerRewards />} />
            <Route path="/app/referrals" element={<LearnerReferrals />} />
            <Route path="/app/notifications" element={<LearnerOverview />} />
            <Route path="/app/settings" element={<LearnerSettings />} />
          </Route>

          {/* 4. Authenticated Merchant Workspace: dedicated app topbar + persistent merchant sidebar */}
          <Route element={<MerchantLayout />}>
            <Route path="/merchant/overview" element={<MerchantOverview />} />
            <Route path="/merchant/demand-intelligence" element={<DemandIntelligence />} />
            <Route path="/merchant/offer-studio" element={<OfferStudio />} />
            <Route path="/merchant/workshops" element={<MerchantWorkshops />} />
            <Route path="/merchant/reservations" element={<MerchantReservations />} />
            <Route path="/merchant/reward-studio" element={<RewardStudio />} />
            <Route path="/merchant/payments" element={<MerchantPayments />} />
            <Route path="/merchant/analytics" element={<MerchantAnalytics />} />
            <Route path="/merchant/research-lab" element={<ResearchLab />} />
            <Route path="/merchant/settings" element={<MerchantSettings />} />
          </Route>

          {/* 5. Authenticated Admin Workspace: dedicated app topbar + admin governance sidebar */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminOverview />} />
            <Route path="/admin/content" element={<AdminOverview />} />
            <Route path="/admin/payments" element={<AdminOverview />} />
            <Route path="/admin/audit" element={<AdminOverview />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

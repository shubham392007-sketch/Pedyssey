import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ChallengePage } from './pages/ChallengePage';
import { ObjectivesPage } from './pages/ObjectivesPage';
import { PrioritiesPage } from './pages/PrioritiesPage';
import { PedupPage } from './pages/PedupPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
        <Route path="/objectives" element={<ObjectivesPage />} />
        <Route path="/priorities" element={<PrioritiesPage />} />
        <Route path="/pedup" element={<PedupPage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

import React from 'react';
import { PageFrame } from '../components/layout/PageFrame';
import { PillButton } from '../components/common/PillButton';
import { NotFoundIllustration } from '../components/common/Illustrations';

export const NotFoundPage: React.FC = () => {
  return (
    <PageFrame showFooter={false}>
      <section className="text-center max-w-2xl mx-auto my-16 md:my-28 flex flex-col items-center space-y-6">
        <NotFoundIllustration className="w-56 h-56 md:w-64 md:h-64" />
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight">
          Looks like this page wandered <span className="font-script text-[1.25em] font-normal">off the map.</span>
        </h1>
        <p className="text-sm md:text-base text-ink/75 max-w-md font-medium">
          The page or document you're looking for doesn't exist or has moved. Let's get you back on track.
        </p>
        <div className="pt-4">
          <PillButton to="/" variant="primary" size="lg" withArrow>
            BACK HOME
          </PillButton>
        </div>
      </section>
    </PageFrame>
  );
};

import React from 'react';
import { PricingHero, MobileTireServiceSection, PromotionsSection } from '../../components/pricing';
import { CTASection } from '../../components/public';

export const Pricing: React.FC = () => {
  return (
    <>
      <PricingHero />
      <MobileTireServiceSection />
      <PromotionsSection />
      <CTASection 
        title="Ready to Save on Your Auto Service?"
        description="Contact us today for a personalized quote or to learn more about our service packages."
        primaryAction={{
          label: 'Get Your Quote',
          path: '/contact'
        }}
        secondaryAction={{
          label: '📞 (250) 986-9191',
          path: 'tel:2509869191'
        }}
        variant="outlined"
      />
    </>
  );
};
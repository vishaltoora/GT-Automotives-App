import React from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedIcon from '@mui/icons-material/Verified';
import { MobileTireServiceSection } from '../../components/pricing';
import { CTASection } from '../../components/public';
import { PageHero } from '../../components/shared';

// Pricing page slides
const pricingSlides = [
  {
    id: 'transparent-pricing',
    title: 'Simple, Honest Pricing',
    subtitle: 'No Hidden Fees',
    description: 'No hidden fees, no surprises. Get quality service at competitive prices with our transparent pricing structure.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    icon: AttachMoneyIcon,
  },
  {
    id: 'best-value',
    title: 'Best Value Guaranteed',
    subtitle: 'Quality & Savings',
    description: 'We match or beat competitor pricing while maintaining the highest quality standards. Fair prices, every time.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80',
    icon: LocalOfferIcon,
  },
  {
    id: 'warranty',
    title: 'Service Warranty Included',
    subtitle: 'Peace of Mind',
    description: 'Every service comes with our satisfaction guarantee and warranty. Your investment is protected.',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1920&q=80',
    icon: VerifiedIcon,
  },
];

export const Pricing: React.FC = () => {
  return (
    <>
      <PageHero
        slides={pricingSlides}
        primaryAction={{
          label: 'Get Free Quote',
          path: '/contact',
        }}
        secondaryAction={{
          label: 'Call for Pricing',
          path: 'tel:2509869191',
        }}
        height="50vh"
      />
      <MobileTireServiceSection />
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
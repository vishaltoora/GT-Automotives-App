import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { Container } from '@mui/material';
import { CTASection } from '../../components/public';
import {
  ContactSection,
  EmergencyServiceBanner,
  FeaturedServices,
  HeroSection,
  QuickActionsBar,
  ServiceAreasSection,
  ServiceCategoriesGrid,
  TireBrandsSection,
  TrustSection,
} from '../../components/home';

export function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Actions Bar */}
      <QuickActionsBar />

      {/* Mobile Tire Emergency Service Banner */}
      <EmergencyServiceBanner />

      {/* Featured Services */}
      <FeaturedServices />

      {/* Service Categories Grid */}
      <Container maxWidth="lg">
        <ServiceCategoriesGrid />
      </Container>

      {/* Tire Brands Section */}
      <TireBrandsSection />

      {/* Trust & Social Proof Section */}
      <TrustSection />

      {/* Contact Information Section */}
      <ContactSection />

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <CTASection
          title="Need Emergency Service?"
          description="We're available 24/7 for roadside assistance and emergency repairs"
          primaryAction={{
            label: 'Call Now: (250) 986-9191',
            path: 'tel:2509869191',
          }}
          secondaryAction={{
            label: 'Schedule Service',
            path: '/contact',
            icon: <ScheduleIcon />,
          }}
          variant="gradient"
        />
      </Container>

      {/* Service Areas */}
      <ServiceAreasSection />
    </>
  );
}
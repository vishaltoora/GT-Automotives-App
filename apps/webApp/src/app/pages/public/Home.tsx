import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildIcon from '@mui/icons-material/Build';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  ContactSection,
  EmergencyServiceBanner,
  FeaturedServices,
  FloatingActionButtons,
  InteractiveServiceShowcase,
  PricingSection,
  ServiceAreasSection,
  ServiceHighlightBanner,
  ServicesShowcase,
  TireBrandsSection,
} from '../../components/home';
import { SHOP_PHONE_SECONDARY_TEL } from '../../config/shop';
import { useAuth } from '../../hooks/useAuth';

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role, user, isLoading } = useAuth();

  useEffect(() => {
    // Redirect authenticated users to their dashboard
    if (!isLoading && isAuthenticated && user && role) {
      let redirectPath = '/';
      switch (role) {
        case 'admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'accountant':
          redirectPath = '/accountant/dashboard';
          break;
        case 'supervisor':
          redirectPath = '/supervisor/dashboard';
          break;
        case 'staff':
          redirectPath = '/staff/dashboard';
          break;
        // Customer portal disabled — customers stay on the public site.
      }
      if (redirectPath !== '/') {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, role, user, navigate, isLoading]);

  const handleBookAppointment = () => {
    navigate('/book-appointment');
  };

  return (
    <>
      {/* Interactive Services Showcase (Main Hero) */}
      <ServicesShowcase />

      {/* Interactive Service Showcase (animated, faceless) */}
      <InteractiveServiceShowcase />

      {/* Floating Action Buttons */}
      <FloatingActionButtons onBookAppointment={handleBookAppointment} />

      {/* Mechanical Services Highlight */}
      <ServiceHighlightBanner
        headerTitle="Complete Mechanical Repairs"
        headerSubtitle="Oil changes, brakes, diagnostics and full auto repair — done right at our 473 3rd Ave shop"
        badge="FULL-SERVICE SHOP"
        title="Mechanical & Oil Change"
        titleIcon={BuildIcon}
        description="Our certified technicians handle everything from routine oil changes and brake jobs to head gaskets, transmissions, engine rebuilds and major repairs — keeping your vehicle running its best."
        features={[
          'Oil & fluid changes',
          'Brake service',
          'Engine diagnostics',
          'Head gasket & engine repair',
          'Transmission service',
          'Suspension & steering',
          'Electrical & battery',
          'Exhaust & cooling system',
        ]}
        image="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&q=80"
        imageAlt="Mechanical repair work in the shop"
        primaryCta={{ label: 'Book a Service', path: '/book-appointment' }}
        secondaryCta={{ label: 'Call Us', path: SHOP_PHONE_SECONDARY_TEL }}
      />

      {/* Car Detailing Highlight */}
      <ServiceHighlightBanner
        reverse
        headerTitle="Professional Car Detailing"
        headerSubtitle="Interior and exterior detailing to keep your vehicle looking and feeling its best"
        badge="LOOK BRAND NEW"
        title="Car Detailing"
        titleIcon={AutoAwesomeIcon}
        description="Give your vehicle the full treatment — hand wash, polish and buffing on the outside, plus a deep interior clean, shampoo and conditioning. We make your car shine inside and out."
        features={[
          'Hand wash & polish',
          'Interior deep clean',
          'Wax & buffing',
          'Vacuum & shampoo',
          'Leather & upholstery care',
          'Engine bay cleaning',
          'Headlight restoration',
          'Odour removal',
        ]}
        image="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1200&q=80"
        imageAlt="Car detailing and polishing"
        primaryCta={{ label: 'Book Detailing', path: '/book-appointment' }}
        secondaryCta={{ label: 'Call Us', path: SHOP_PHONE_SECONDARY_TEL }}
      />

      {/* Mobile Tire Emergency Service Banner */}
      <EmergencyServiceBanner onBookNow={handleBookAppointment} />

      {/* Featured Services Slider */}
      <FeaturedServices />

      {/* Tire Brands Section */}
      <TireBrandsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Contact Information Section */}
      <ContactSection />

      {/* Service Areas */}
      <ServiceAreasSection />
    </>
  );
}

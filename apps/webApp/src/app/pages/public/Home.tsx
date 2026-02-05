import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContactSection,
  EmergencyServiceBanner,
  FeaturedServices,
  FloatingActionButtons,
  PricingSection,
  ServiceAreasSection,
  ServicesShowcase,
  TireBrandsSection,
} from '../../components/home';
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
        case 'customer':
          redirectPath = '/customer/dashboard';
          break;
      }
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, role, user, navigate, isLoading]);

  const handleBookAppointment = () => {
    navigate('/book-appointment');
  };

  return (
    <>
      {/* Interactive Services Showcase (Main Hero) */}
      <ServicesShowcase />

      {/* Floating Action Buttons */}
      <FloatingActionButtons onBookAppointment={handleBookAppointment} />

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
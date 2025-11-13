import DigitalDefense from "@/components/DigitalDefense";
import DownloadCTA from "@/components/DownloadCTA";
import FAQAccordion from "@/components/FAQAccordion";
import Footer from "@/components/Footer";
import GuardianVsMentor from "@/components/GuardianVsMentor";
import HeroWithNavbar from "@/components/HeroWithNavbar";
import PowerfulModes from "@/components/PowerfulModes";
import PricingPlans from "@/components/PricingPlans";
import PromoCarousel from "@/components/PromoCarousel";
import TestimonialCarousel from "@/components/TestimonialCarousel";


export default function Home() {
  return (
    <>
      <HeroWithNavbar />
      <DigitalDefense />
      <PowerfulModes />
      <GuardianVsMentor />
      <PromoCarousel />
      <PricingPlans />
      <TestimonialCarousel />
      <FAQAccordion />
      <DownloadCTA />
      <Footer />
    </>
  );
}

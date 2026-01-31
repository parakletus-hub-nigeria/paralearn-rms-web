import type { ComponentType } from "react";
import HelpPage from "./subLandingPage/HelpPage";
import BlogPage from "./subLandingPage/BlogPage";
import FeaturesPage from "./subLandingPage/FeaturesPage";
import PricingPage from "./subLandingPage/PricingPage";
import CareersPage from "./subLandingPage/CareersPage";
import DocumentationPage from "./subLandingPage/DocumentationPage";
import PartnersPage from "./subLandingPage/PartnersPage";
import PrivacyPage from "./subLandingPage/PrivacyPage";
import SecurityPage from "./subLandingPage/SecurityPage";
import CookiesPage from "./subLandingPage/CookiesPage";
import TermsPage from "./subLandingPage/TermsPage";
import SupportPage from "./subLandingPage/SupportPage";
import ProductPage from "./subLandingPage/ProductPage";
import ContactPage from "./subLandingPage/ContactPage";
import AboutPage from "./subLandingPage/AboutPage";

export const LANDING_SUBPAGES: Record<string, ComponentType> = {
  help: HelpPage,
  blog: BlogPage,
  features: FeaturesPage,
  pricing: PricingPage,
  careers: CareersPage,
  documentation: DocumentationPage,
  partners: PartnersPage,
  privacy: PrivacyPage,
  security: SecurityPage,
  cookies: CookiesPage,
  terms: TermsPage,
  support: SupportPage,
  product: ProductPage,
  contact: ContactPage,
  about: AboutPage,
};

export const LANDING_SUBPAGE_SLUGS = Object.keys(LANDING_SUBPAGES) as (keyof typeof LANDING_SUBPAGES)[];

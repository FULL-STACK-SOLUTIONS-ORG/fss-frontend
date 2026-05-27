import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaDesktop, FaShoppingCart, FaCode, FaBullhorn, FaDatabase, FaGlobe } from 'react-icons/fa';

const services = [
  {
    icon: FaDesktop,
    title: 'Web Design & Development',
    description:
      'We craft visually stunning, high-performance websites tailored to your brand. From pixel-perfect UI to robust frontend architecture, we build experiences that convert visitors into customers.',
    features: ['Responsive Design', 'UI/UX Strategy', 'React & Next.js', 'Performance Optimisation'],
    color: '#E85D5D',
  },
  {
    icon: FaDatabase,
    title: 'CMS Development',
    description:
      'Empower your team to manage content effortlessly. We develop custom CMS solutions on WordPress, Sanity, Strapi, and headless platforms so you stay in full control of your content.',
    features: ['Headless CMS', 'WordPress Custom Themes', 'Strapi / Sanity', 'Role-based Access'],
    color: '#4A90D9',
  },
  {
    icon: FaBullhorn,
    title: 'Digital Marketing',
    description:
      'Grow your online presence with data-driven strategies. We combine SEO, paid campaigns, and analytics to deliver measurable ROI and sustainable traffic growth.',
    features: ['SEO & Content Strategy', 'Google & Meta Ads', 'Analytics & Reporting', 'Conversion Rate Optimisation'],
    color: '#E85D5D',
  },
  {
    icon: FaCode,
    title: 'Custom Development',
    description:
      'Need something built from scratch? Our engineers deliver bespoke software solutions — APIs, dashboards, internal tools, and complex integrations — designed precisely around your workflow.',
    features: ['Node.js & Express APIs', 'Database Architecture', 'Third-party Integrations', 'Scalable Microservices'],
    color: '#2EAD72',
  },
  {
    icon: FaShoppingCart,
    title: 'e-Commerce Development',
    description:
      'Launch and scale your online store with confidence. We build fast, secure, and conversion-optimised e-commerce platforms that handle everything from catalogue to checkout.',
    features: ['Shopify & WooCommerce', 'Custom Cart & Checkout', 'Payment Gateway Integration', 'Inventory Management'],
    color: '#F5A623',
  },
  {
    icon: FaGlobe,
    title: 'Open Source Development',
    description:
      'Leverage the power of open-source ecosystems. We build, extend, and contribute to open-source projects — giving your product a transparent, community-backed foundation.',
    features: ['Open-source Customisation', 'Community Contributions', 'Plugin & Extension Dev', 'API-first Architecture'],
    color: '#4A90D9',
  },
];

const ServiceCard = ({ service }) => {
  const Icon = service.icon;
  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D0' }}
    >
      <div className="p-8 flex-1 flex flex-col">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
          style={{ backgroundColor: service.color + '1A' }}
        >
          <Icon size={26} style={{ color: service.color }} />
        </div>

        <h3
          className="text-xl font-bold mb-3"
          style={{ fontFamily: 'Playfair Display, serif', color: '#1C1A17' }}
        >
          {service.title}
        </h3>

        <p className="text-sm leading-relaxed mb-6" style={{ color: '#6B6355' }}>
          {service.description}
        </p>

        <ul className="mt-auto space-y-2">
          {service.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#1C1A17' }}>
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: service.color }}
              />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="h-1 w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: service.color }}
      />
    </div>
  );
};

const Development = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <p
          className="text-xs uppercase tracking-widest font-semibold mb-4"
          style={{ color: '#9B7D43' }}
        >
          What We Build
        </p>
        <h1
          className="text-4xl md:text-6xl font-black mb-6 leading-tight"
          style={{ fontFamily: 'Playfair Display, serif', color: '#1C1A17' }}
        >
          Web &amp; Mobile App
          <br />
          <span style={{ color: '#9B7D43' }}>Development Services</span>
        </h1>
        <p
          className="max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          style={{ color: '#6B6355' }}
        >
          Enhance your business with bold design &amp; full-stack digital transformation.
          We deliver end-to-end solutions — from concept to deployment — with free lifetime support after launch.
        </p>

        <div
          className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-full text-sm font-semibold"
          style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Free lifetime support after deployment
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-4 text-center"
        style={{ backgroundColor: '#1C1A17' }}
      >
        <h2
          className="text-3xl md:text-4xl font-black mb-4"
          style={{ fontFamily: 'Playfair Display, serif', color: '#F5F0E8' }}
        >
          Ready to build something great?
        </h2>
        <p className="mb-8 text-base" style={{ color: '#C9A96E' }}>
          Tell us about your project and we&apos;ll get back to you within 24 hours.
        </p>
        <a
          href="https://www.fullstacksolutions.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#9B7D43', color: '#F5F0E8' }}
        >
          Get in Touch
        </a>
      </section>
    </div>
  );
};

export default Development;

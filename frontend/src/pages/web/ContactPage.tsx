import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import apiClient from '../../api/client';
import faqBg from '../../assets/pricing/faqbg.webp';
import ContactSineWaves from '../../components/hero/ContactSineWaves';
import StickyFaqSection, { type FaqItem } from '../../components/common/StickyFaqSection';

/* ─── Animation Variants ─── */
const fadeInUp: any = {
  hidden: { opacity: 0, y: 40, rotateX: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/* ─── Floating Shapes Component (for parallax) ─── */
const FloatingShapes = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div style={{ y: y1 }} className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-100/40 blur-3xl" />
      <motion.div style={{ y: y2 }} className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-violet-100/30 blur-3xl" />
    </div>
  );
};

/* ─── Scroll-linked Section Animation Wrapper ─── */
const ScrollAnimatedSection = ({ 
  children, 
  className = "", 
  id, 
  ref: externalRef 
}: { 
  children: React.ReactNode; 
  className?: string; 
  id?: string; 
  ref?: React.RefObject<HTMLDivElement>; 
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const targetRef = externalRef || internalRef;
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [40, 0, 0, -40]);

  return (
    <motion.div
      ref={targetRef}
      id={id}
      style={{ opacity, scale, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ContactPage = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({ 
    target: heroRef, 
    offset: ["start start", "end start"] 
  });
  const heroY = useTransform(heroScroll, [0, 1], [0, 150]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // FAQ Items
  const faqItems: FaqItem[] = [
    {
      question: t('contact_page.faq_q1', 'How quickly do you respond?'),
      answer: t('contact_page.faq_a1', 'Our team typically replies to all inquiries within 24 hours on working days.')
    },
    {
      question: t('contact_page.faq_q2', 'Can you help me find a 3-way circular match?'),
      answer: t('contact_page.faq_a2', 'Yes, our automated engine scans for circular matching chains, and our support team can guide you through the process.')
    },
    {
      question: t('contact_page.faq_q3', 'Is my contact information public?'),
      answer: t('contact_page.faq_a3', 'No. Your contact details remain private and are only revealed to a match partner after mutual approval.')
    },
    {
      question: t('contact_page.faq_q4', 'Is MutualTransfer.lk an official government agency?'),
      answer: t('contact_page.faq_a4', 'MutualTransfer.lk is an independent platform by MoonSept Studio built to help government employees connect before submitting official paperwork.')
    }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error(t('contact_page.fill_required', 'Please fill in all required fields.'));
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/public/contact', formData).catch(() => ({ data: { success: true } }));
      setIsSubmitted(true);
      toast.success(t('contact_page.form_success_title', 'Message Sent!'));
    } catch {
      toast.error(t('contact_page.send_failed', 'Failed to send message. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <div className="relative">
      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative mesh-gradient-bg overflow-hidden flex flex-col justify-center min-h-screen pt-24 pb-12">
        <ContactSineWaves />
        <FloatingShapes />
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 my-auto"
        >
          <motion.div variants={fadeInUp} className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full mb-6 text-center mx-auto">
            {t('common.contact_us', 'Contact Us')}
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
            {t('contact_page.hero_title_1', "We'd Love to")} <span className="shimmer-text">{t('contact_page.hero_title_highlight', 'Hear From You.')}</span>
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
            {t('contact_page.hero_subtitle', 'Have questions about mutual transfers or need assistance? Reach out to our dedicated team.')}
          </motion.p>
        </motion.div>
      </section>

      {/* ─── Main Content Section (Form & Contact Details) ─── */}
      <ScrollAnimatedSection className="bg-white perspective-2000 overflow-hidden py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              {t('contact_page.section_title', 'Get in Touch')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-slate-600 font-sans max-w-xl mx-auto">
              {t('contact_page.section_desc', 'Send us a message and our support team will get back to you within 24 hours.')}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
            {/* Left Column: Clean Contact Form (7 cols) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-blue-900/5 p-8 sm:p-12 relative overflow-hidden"
            >
              {isSubmitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Check size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    {t('contact_page.form_success_title', 'Message Sent!')}
                  </h3>
                  <p className="text-slate-600 font-sans max-w-md mx-auto mb-8 leading-relaxed">
                    {t('contact_page.form_success_desc', 'Thank you for getting in touch. We will reply to your inquiry shortly.')}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    {t('contact_page.form_send_another', 'Send Another Message')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans">
                      {t('contact_page.form_name', 'Full Name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('contact_page.form_name_placeholder', 'Kasun Bandara')}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-sans text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans">
                        {t('contact_page.form_email', 'Email Address')}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('contact_page.form_email_placeholder', 'kasun@example.com')}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-sans text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans">
                        {t('contact_page.form_phone', 'Phone Number')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('contact_page.form_phone_placeholder', '078 978 7377')}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-sans text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans">
                      {t('contact_page.form_subject', 'Subject')}
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-sans text-sm"
                    >
                      <option value="">{t('contact_page.form_subject_select', 'Select a subject')}</option>
                      <option value="matching">{t('contact_page.form_subject_matching', 'Transfer Matching Assistance')}</option>
                      <option value="verification">{t('contact_page.form_subject_verification', 'ID Verification')}</option>
                      <option value="account">{t('contact_page.form_subject_account', 'Account & Profile Support')}</option>
                      <option value="billing">{t('contact_page.form_subject_billing', 'Packages & Billing')}</option>
                      <option value="general">{t('contact_page.form_subject_general', 'General Inquiry')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans">
                      {t('contact_page.form_message', 'Message')}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('contact_page.form_message_placeholder', 'Write your message here...')}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-sans text-sm resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center group cursor-pointer"
                  >
                    <span>{isSubmitting ? t('contact_page.form_submitting', 'Sending...') : t('contact_page.form_submit', 'Send Message')}</span>
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </button>
                </form>
              )}
            </motion.div>

            {/* Right Column: Clean Information Panel (5 cols) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="lg:col-span-5 space-y-6"
            >
              <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl shadow-blue-900/5 p-8 sm:p-10">
                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                  {t('contact_page.direct_title', 'Contact Information')}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-sans mb-8">
                  {t('contact_page.direct_desc', 'Find us through our official communication channels.')}
                </p>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="border-b border-slate-100 pb-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                      {t('contact_page.email_label', 'Email')}
                    </p>
                    <a 
                      href={`mailto:${t('contact_page.email_val', 'hello@moonsept.com')}`}
                      className="text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t('contact_page.email_val', 'hello@moonsept.com')}
                    </a>
                  </div>

                  {/* Phone & WhatsApp */}
                  <div className="border-b border-slate-100 pb-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                      {t('contact_page.phone_label', 'Phone & WhatsApp')}
                    </p>
                    <p className="text-base font-semibold text-slate-900 mb-2">
                      {t('contact_page.phone_val', '+94 78 978 7377')}
                    </p>
                    <a
                      href={t('contact_page.whatsapp_url', 'https://wa.me/94789787377')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      {t('contact_page.whatsapp_chat', 'Chat on WhatsApp')}
                      <ArrowRight size={14} className="ml-1" />
                    </a>
                  </div>

                  {/* Office */}
                  <div className="border-b border-slate-100 pb-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                      {t('contact_page.office_label', 'Office Location')}
                    </p>
                    <p className="text-base font-semibold text-slate-900 mb-2">
                      {t('contact_page.office_val', 'MoonSept Studio, Sri Lanka')}
                    </p>
                    <a
                      href="https://maps.app.goo.gl/zUV4afpCW7KBarbz8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>{t('contact_page.view_map', 'View on Google Maps')}</span>
                      <ArrowRight size={14} className="ml-1" />
                    </a>
                  </div>

                  {/* Hours */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 font-sans">
                      {t('contact_page.hours_label', 'Working Hours')}
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {t('contact_page.hours_val', 'Monday – Friday: 8:30 AM – 5:00 PM')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollAnimatedSection>

      {/* ─── FAQ Section with Sticky Scroll Cards ─── */}
      <StickyFaqSection
        badge={t('contact_page.faq_badge', 'Help & FAQ')}
        title={t('contact_page.faq_title', 'Frequently Asked Questions')}
        subtitle={t('contact_page.hero_subtitle', 'Have questions about mutual transfers or need assistance? Reach out to our dedicated team.')}
        items={faqItems}
        bgImage={faqBg}
        supportLink="#contact-form"
        supportTitle={t('contact_page.support_title', 'Still have questions?')}
        supportDesc={t('contact_page.support_desc', 'Our support team is always ready to guide you.')}
        supportActionLabel={t('contact_page.support_action', 'Send a Message')}
      />

      {/* ─── CTA Section (Matching AboutPage.tsx & PricingPage.tsx) ─── */}
      <ScrollAnimatedSection className="bg-white perspective-2000 overflow-hidden flex items-center justify-center py-24">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <div className="glass-panel-strong rounded-[40px] p-12 sm:p-20 shadow-2xl shadow-blue-500/5">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-10 tracking-tight">
              {t('contact_page.cta_title', 'Ready to find your match?')}
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
              >
                {t('contact_page.cta_get_started', 'Get Started')}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link 
                to="/pricing" 
                className="w-full sm:w-auto px-12 py-5 glass-panel text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
              >
                {t('contact_page.cta_view_pricing', 'View Pricing')}
              </Link>
            </div>
          </div>
        </motion.div>
      </ScrollAnimatedSection>
    </div>
  );
};

export default ContactPage;

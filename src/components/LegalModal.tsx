import React, { useEffect } from 'react';
import { X, Shield, FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type LegalType = 'privacy' | 'terms';

interface LegalModalProps {
    type: LegalType;
    onClose: () => void;
}

const PRIVACY_SECTIONS = [
    {
        title: 'Information We Collect',
        content: `FEEDX collects information you provide directly when using our platform. This includes:
• Account information such as name, college email address, and department when you register on FXBot.
• Issue submissions including descriptions, attachments, and category selections you submit through FXBot.
• Usage data such as pages visited, features accessed, time spent on the platform, and device/browser information.
• Analytics queries such as roll numbers entered into the Student Analytics tool for fetching academic results.

We do not collect any financial information, national IDs, or sensitive personal data beyond what is listed above.`,
    },
    {
        title: 'How We Use Your Information',
        content: `We use collected information solely to operate and improve FEEDX services:
• To deliver the FXBot issue-tracking functionality and route your submissions to the appropriate faculty or administration.
• To display student academic results through our Analytics feature by querying the SBTET public database.
• To improve platform performance, diagnose technical issues, and monitor service health.
• To send important service notifications (e.g., issue status updates) to your registered email.

We do not sell, rent, or trade your personal information to any third party for commercial purposes.`,
    },
    {
        title: 'Data Storage & Security',
        content: `Your data is stored securely on Supabase infrastructure with industry-standard encryption at rest and in transit (TLS 1.3). Access to your data is restricted to authorized administrators and faculty members on a need-to-know basis.

Session tokens are stored locally on your device and automatically expire. We implement periodic security reviews to identify and address potential vulnerabilities. In the event of a data breach that affects your information, we will notify affected users within 72 hours.`,
    },
    {
        title: 'Third-Party Services',
        content: `FEEDX integrates with the following third-party services:
• Supabase — for authentication and database services (governed by Supabase's Privacy Policy).
• SBTET Telangana API — for fetching public student academic results.
• Google Fonts — for typography assets loaded via CDN.

These services have their own privacy policies and data handling practices, which we encourage you to review.`,
    },
    {
        title: 'Your Rights',
        content: `You have the right to:
• Access the personal data we hold about you.
• Request correction of inaccurate information.
• Request deletion of your account and associated data.
• Withdraw consent for non-essential data processing at any time.

To exercise any of these rights, contact us at the email below. We will respond within 14 business days.`,
    },
    {
        title: 'Contact',
        content: `If you have questions about this Privacy Policy or how your data is handled, please contact the FEEDX Administrative Team through the FXBot issue submission system or reach out via our official institutional email. This policy was last updated on 10 March 2026.`,
    },
];

const TERMS_SECTIONS = [
    {
        title: 'Acceptance of Terms',
        content: `By accessing or using FEEDX — including its web platform, FXBot grievance system, Student Analytics, and all associated features — you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the platform.

These Terms apply to all visitors, students, faculty members, HODs, Principals, and administrators who interact with FEEDX in any capacity.`,
    },
    {
        title: 'Platform Use & Eligibility',
        content: `FEEDX is intended exclusively for use by students, faculty, and staff affiliated with polytechnic institutes registered on the platform. By using FEEDX you represent that:
• You are a currently enrolled student or verified staff member of a participating polytechnic institution.
• You will use the platform only for lawful, educational purposes.
• You will not impersonate another person, submit false information, or misuse the grievance system.
• You will not attempt to reverse-engineer, scrape, or exploit any part of the platform.`,
    },
    {
        title: 'FXBot Grievance System',
        content: `FXBot is a formal grievance and feedback channel. When submitting issues:
• All submissions must be truthful, respectful, and relevant to your academic or institutional experience.
• False, malicious, or defamatory complaints may result in account suspension and disciplinary action via your institution.
• Issues are routed to faculty, HODs, Principals, or Admins based on category and are visible to the relevant authority.
• FEEDX does not guarantee a specific resolution timeline; response times depend on your institution's administration.

Misuse of FXBot for harassment, spam, or inappropriate content is strictly prohibited.`,
    },
    {
        title: 'Student Analytics',
        content: `The Student Analytics tool retrieves publicly available academic results from the SBTET Telangana government database. By using this feature:
• You confirm that you are querying your own results or results you are authorised to access.
• FEEDX is not responsible for inaccuracies in data sourced from SBTET; please refer to the official SBTET portal for authoritative records.
• Results displayed are for informational purposes only and should not be used as official academic transcripts.`,
    },
    {
        title: 'Intellectual Property',
        content: `All content on FEEDX — including the logo, design, code, copy, and branding — is the intellectual property of the FEEDX development team and is protected by applicable copyright and trademark law.

You may not reproduce, distribute, modify, or create derivative works from any FEEDX content without explicit written permission. Student submissions via FXBot remain the property of the submitter, but by submitting you grant FEEDX a limited, non-exclusive licence to process and display that content within the platform.`,
    },
    {
        title: 'Disclaimer & Limitation of Liability',
        content: `FEEDX is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, error-free, or free from viruses or other harmful components.

To the maximum extent permitted by applicable law, FEEDX and its administrators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the platform. Our total liability for any claim shall not exceed the amount you paid to use the platform (which for free users is zero).`,
    },
    {
        title: 'Changes to Terms',
        content: `We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the platform. Continued use of FEEDX after any modification constitutes your acceptance of the new Terms. We will make reasonable efforts to notify users of significant changes via on-platform notifications.

These Terms were last updated on 10 March 2026. For any questions, contact the FEEDX team through FXBot.`,
    },
];

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
    const isPrivacy = type === 'privacy';
    const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
    const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
    const subtitle = isPrivacy
        ? 'How we collect, use, and protect your information.'
        : 'Rules and guidelines for using the FEEDX platform.';
    const Icon = isPrivacy ? Shield : FileText;

    // Lock body scroll while modal is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    // Prevent wheel/touch events on the backdrop from reaching the page
    const blockScroll = (e: React.WheelEvent | React.TouchEvent) => e.stopPropagation();

    return (
        <div
            className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={onClose}
            onWheel={blockScroll}
            onTouchMove={blockScroll}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={cn(
                    'relative z-10 bg-white dark:bg-zinc-950 w-full sm:max-w-2xl',
                    'rounded-t-3xl sm:rounded-3xl shadow-2xl',
                    'flex flex-col max-h-[90dvh]',
                    'border border-black/[0.06] dark:border-white/[0.08]',
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={cn(
                    'flex-shrink-0 px-6 pt-6 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]',
                    'bg-gradient-to-br',
                    isPrivacy
                        ? 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20'
                        : 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20',
                    'rounded-t-3xl sm:rounded-t-3xl',
                )}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                'p-3 rounded-2xl shadow-lg',
                                isPrivacy
                                    ? 'bg-blue-600 shadow-blue-500/25'
                                    : 'bg-emerald-600 shadow-emerald-500/25',
                            )}>
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    {title}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div
                    className="flex-1 overflow-y-auto px-6 py-6 space-y-7"
                    style={{ overscrollBehavior: 'contain' }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    {sections.map((section, i) => (
                        <div key={i} className="group">
                            <div className="flex items-center gap-2 mb-2">
                                <ChevronRight className={cn(
                                    'h-3.5 w-3.5 flex-shrink-0',
                                    isPrivacy ? 'text-blue-500' : 'text-emerald-500',
                                )} />
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                                    {section.title}
                                </h3>
                            </div>
                            <div className="ml-5.5 pl-4 border-l-2 border-slate-100 dark:border-white/[0.06]">
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] rounded-b-3xl">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                            FEEDX • Last updated 10 Mar 2026
                        </p>
                        <button
                            onClick={onClose}
                            className={cn(
                                'text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl text-white transition-all',
                                isPrivacy
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25',
                            )}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalModal;

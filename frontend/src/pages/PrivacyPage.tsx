import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-charcoal">
        <h1 className="text-3xl font-serif">Privacy Policy</h1>
        <p className="text-xs text-charcoal/60">Last updated: November 2026</p>
        
        <div className="space-y-4 text-xs sm:text-sm text-charcoal/80 leading-relaxed bg-white p-8 rounded-2xl border border-warmgray">
          <h2 className="text-base font-semibold text-charcoal">1. Information We Collect</h2>
          <p>
            NUVENDRY collects learner demand submissions, email addresses, and reservation records to match learning interests and fulfill workshop sessions.
          </p>

          <h2 className="text-base font-semibold text-charcoal">2. PayPal Sandbox Payment Processing</h2>
          <p>
            Payment transactions are conducted in the PayPal Sandbox test environment. We do not process, collect, or store real credit card numbers or production financial instruments.
          </p>

          <h2 className="text-base font-semibold text-charcoal">3. Artificial Intelligence & Demand Anonymization</h2>
          <p>
            Learning demands are clustered using semantic NLP algorithms. Aggregated demand opportunities shown to instructors display topic summaries and anonymized willingness-to-pay statistics without disclosing personal contact details.
          </p>
        </div>
      </div>
    </>
  );
};


import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';
import { CALCULATORS } from '../data/calculators';

const competitionColor = {
  'Very Low': 'bg-accentL text-accent',
  'Low':      'bg-blueL text-blue',
  'Medium':   'bg-warnL text-warn',
};

export default function Home() {
  return (
    <>
      <SEOHead
        title="Free India Finance Calculators — FY 2025-26 | NicheCalc India"
        description="Free, accurate finance calculators for Indian taxpayers. Moonlighting tax, freelancer GST, EV vs Petrol, ESOP tax, NRI property gains. Updated FY 2025-26."
        keywords="india finance calculator, tax calculator india 2025, freelancer tax india, ev vs petrol calculator, esop tax india, nri property tax"
        slug=""
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-text mt-4 mb-3 leading-tight">
          Free India Finance Calculators — FY 2025-26
        </h1>

        <p className="text-muted leading-relaxed mb-8 text-sm md:text-base max-w-3xl">
          NicheCalc India offers free, accurate finance calculators built specifically for Indian taxpayers,
          freelancers, and investors. Whether you're moonlighting alongside your salaried job and wondering
          about advance tax, a full-time consultant trying to optimise under Section 44ADA, a potential EV
          buyer comparing 7-year ownership costs, a startup employee navigating ESOP perquisite and capital
          gains tax, or an NRI selling ancestral property — our calculators give you instant, plain-English
          answers. All calculators are updated for FY 2025-26, reflect the latest New Tax Regime slabs,
          post-Budget 2024 LTCG changes, and carry a clear disclaimer: use these as a starting point, then
          consult a CA for your specific situation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {CALCULATORS.map(calc => (
            <div
              key={calc.id}
              className="bg-surface border border-border rounded-xl p-5 hover:border-accentM/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-3xl">{calc.emoji}</div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${competitionColor[calc.competition] || 'bg-bg text-muted'}`}>
                    {calc.competition}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg text-muted border border-border">
                    {calc.searches}
                  </span>
                </div>
              </div>
              <h2 className="font-serif font-semibold text-base text-text mb-1 leading-snug">
                {calc.title}
              </h2>
              <p className="text-xs text-muted leading-relaxed mb-4">{calc.description}</p>
              <Link
                to={`/${calc.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-accentM hover:text-accent transition-colors"
              >
                Calculate →
              </Link>
            </div>
          ))}
        </div>

        <AdSlot size="leaderboard" className="mb-6" />
      </div>
    </>
  );
}

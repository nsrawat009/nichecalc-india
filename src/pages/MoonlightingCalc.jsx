import { useState, useMemo } from 'react';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';
import ResultCard from '../components/ResultCard';
import Insight from '../components/Insight';
import Field, { NumberInput, Slider, Toggle } from '../components/Field';
import { CALCULATORS } from '../data/calculators';
import { calcTax, fmt, fmtN } from '../utils/tax';

const meta = CALCULATORS.find(c => c.id === 'moonlighting');

function calculate({ salary, freelanceGross, expenses, regime, pfOpt }) {
  // Salary processing
  const basic = salary * 0.40;
  const pfDeduct = pfOpt ? Math.min(basic * 0.12, 21600) : 0;
  const stdDeduct = 75000;
  const salaryTaxable = Math.max(0, salary - stdDeduct - pfDeduct * 2);

  // Freelance 44ADA: 50% presumptive
  const freelanceTaxable = freelanceGross * 0.50;
  const actualProfit = freelanceGross - expenses;

  // Tax calculations
  const taxSalaryOnly = calcTax(salaryTaxable, regime);
  const taxCombined   = calcTax(salaryTaxable + freelanceTaxable, regime);
  const extraTaxOwed  = Math.max(0, taxCombined - taxSalaryOnly);
  const totalIncome   = salary + freelanceTaxable;
  const effectiveRate = totalIncome > 0 ? (taxCombined / totalIncome * 100) : 0;
  const advanceTaxRequired = extraTaxOwed > 10000;

  return {
    salaryTaxable,
    freelanceTaxable,
    actualProfit,
    taxSalaryOnly,
    taxCombined,
    extraTaxOwed,
    effectiveRate,
    advanceTaxRequired,
    totalIncome,
  };
}

const ADVANCE_TAX_DATES = [
  { by: '15 June 2025',  pct: '15%' },
  { by: '15 Sep 2025',   pct: '45%' },
  { by: '15 Dec 2025',   pct: '75%' },
  { by: '15 Mar 2026',   pct: '100%' },
];

export default function MoonlightingCalc() {
  const [salary,        setSalary]        = useState(1500000);
  const [freelanceGross,setFreelanceGross] = useState(600000);
  const [expenses,      setExpenses]       = useState(100000);
  const [regime,        setRegime]         = useState('new');
  const [pfOpt,         setPfOpt]          = useState(true);
  const [howOpen,       setHowOpen]        = useState(false);
  const [faqOpen,       setFaqOpen]        = useState(null);

  const r = useMemo(
    () => calculate({ salary, freelanceGross, expenses, regime, pfOpt }),
    [salary, freelanceGross, expenses, regime, pfOpt]
  );

  const faqs = [
    {
      q: 'Do I need to inform my employer about freelance income?',
      a: 'There is no legal requirement under the Income Tax Act to inform your employer. However, many employment contracts contain moonlighting clauses that restrict outside work. Always review your employment agreement — violating it can be grounds for termination, even if your taxes are perfectly in order.',
    },
    {
      q: 'What is Section 44ADA presumptive taxation?',
      a: 'Section 44ADA allows eligible professionals (doctors, lawyers, architects, IT consultants, etc.) earning up to ₹75 lakh to declare 50% of gross receipts as profit without maintaining detailed books of accounts. The remaining 50% is deemed to cover all expenses. This greatly simplifies compliance for freelancers.',
    },
    {
      q: 'When is advance tax due for freelance income?',
      a: 'Advance tax is payable in four instalments: 15% by June 15, 45% by September 15, 75% by December 15, and 100% by March 15. If you miss instalments, interest under Section 234B and 234C at 1% per month applies on the shortfall.',
    },
    {
      q: 'Is freelance income and salary taxed separately?',
      a: 'No. Under the Income Tax Act, all your income heads are clubbed to compute total income, which then determines your tax slab. Your employer deducts TDS only on salary — the additional tax on freelance income is your responsibility via advance tax and self-assessment.',
    },
  ];

  return (
    <>
      <SEOHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        slug={meta.slug}
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-1 text-xs text-muted">Updated for FY 2025-26</div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-text mb-3 leading-snug">
          {meta.title}
        </h1>

        {/* SEO description (collapsible) */}
        <details className="mb-6 bg-surface border border-border rounded-xl overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium cursor-pointer text-muted hover:text-text">
            About this calculator ▾
          </summary>
          <p className="px-4 pb-4 text-sm text-muted leading-relaxed">
            If you're earning a salary and also doing freelance or consulting work on the side — commonly
            called moonlighting — you have a more complex tax situation than a purely salaried person. Your
            employer deducts TDS only on your salary. But your freelance income gets added on top, often
            pushing you into a higher tax bracket. This calculator shows you exactly how much extra tax
            you owe, whether you need to pay advance tax, and gives you FY 2025-26 deadlines and tips.
            Freelance income is calculated under Section 44ADA presumptive taxation (50% of gross receipts
            treated as profit), which applies to most professionals. Not financial advice — consult a CA
            for your specific situation.
          </p>
        </details>

        <AdSlot size="leaderboard" className="mb-6" />

        {/* Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
            <h2 className="font-serif font-semibold text-base text-text">Your Income Details</h2>

            <Field label="Annual CTC / Salary" hint="Your total cost to company">
              <NumberInput value={salary} onChange={setSalary} min={0} max={10000000} step={10000} />
              <Slider value={salary} onChange={setSalary} min={0} max={5000000} step={50000} />
              <p className="text-xs text-hint text-right">{fmt(salary)}</p>
            </Field>

            <Field label="Annual Freelance / Consulting Income" hint="Total gross receipts before any deductions">
              <NumberInput value={freelanceGross} onChange={setFreelanceGross} min={0} max={7500000} step={10000} />
              <Slider value={freelanceGross} onChange={setFreelanceGross} min={0} max={2000000} step={25000} />
              <p className="text-xs text-hint text-right">{fmt(freelanceGross)}</p>
            </Field>

            <Field label="Freelance Business Expenses" hint="Actual expenses (used only for comparison — 44ADA uses 50% presumptive)">
              <NumberInput value={expenses} onChange={setExpenses} min={0} max={freelanceGross} step={5000} />
            </Field>

            <Field label="Tax Regime">
              <Toggle
                options={[{ label: 'New Regime', value: 'new' }, { label: 'Old Regime', value: 'old' }]}
                value={regime}
                onChange={setRegime}
              />
            </Field>

            <Field label="PF deducted from salary?">
              <Toggle
                options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                value={pfOpt}
                onChange={setPfOpt}
              />
            </Field>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="font-serif font-semibold text-base text-text mb-4">Your Tax Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultCard label="Extra Tax on Freelance Income" value={fmt(r.extraTaxOwed)} primary />
                <ResultCard label="Total Combined Tax" value={fmt(r.taxCombined)} />
                <ResultCard label="Freelance Taxable (44ADA)" value={fmt(r.freelanceTaxable)} />
                <ResultCard label="Effective Tax Rate" value={r.effectiveRate.toFixed(1)} suffix="%" />
                <ResultCard
                  label="Advance Tax Required?"
                  value={r.advanceTaxRequired ? 'Yes' : 'No'}
                  primary={r.advanceTaxRequired}
                />
                <ResultCard label="Tax on Salary Only" value={fmt(r.taxSalaryOnly)} />
              </div>
            </div>

            <AdSlot size="rectangle" className="self-start" />
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 flex flex-col gap-3">
          <h2 className="font-serif font-semibold text-lg text-text">Key Insights</h2>

          {r.advanceTaxRequired && (
            <Insight type="warning" title="Advance Tax Due — Don't Miss These Dates">
              You owe more than ₹10,000 in extra tax, so advance tax is mandatory. Miss a deadline and
              Section 234C charges 1% per month interest on the shortfall.
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ADVANCE_TAX_DATES.map(d => (
                  <div key={d.by} className="text-xs bg-warnL border border-amber/30 rounded-lg px-3 py-2">
                    <span className="font-semibold">{d.pct}</span> by {d.by}
                  </div>
                ))}
              </div>
            </Insight>
          )}

          {r.freelanceTaxable > r.actualProfit && (
            <Insight type="info" title="44ADA Presumptive vs Actual Profit">
              Your actual profit ({fmt(r.actualProfit)}) is less than 44ADA presumptive ({fmt(r.freelanceTaxable)}).
              You could declare actual profit, but only by maintaining proper books of accounts and
              getting a CA audit (Section 44AB). For most freelancers, 44ADA simplicity outweighs this benefit.
            </Insight>
          )}

          {freelanceGross > 2000000 && (
            <Insight type="warning" title="GST Registration May Be Mandatory">
              Freelance income above ₹20 lakh (₹10 lakh for some states) requires mandatory GST
              registration. If you're providing services to Indian clients without a GSTIN, you may be
              in violation. Export of services to foreign clients is zero-rated.
            </Insight>
          )}

          <Insight type="positive" title="Timing Tip: Split Invoices Across April">
            The Indian financial year ends March 31. Raising invoices in April (next FY) instead of
            March can defer tax liability by one full year — a legal and commonly used strategy.
            Discuss timing with your clients if you have flexibility on invoice dates.
          </Insight>

          <Insight type="neutral" title="Check Your Employment Contract">
            Many tech and finance employers include moonlighting restriction clauses. The Income Tax Act
            has no issue with dual income — but your HR policy might. Review before starting.
          </Insight>
        </div>

        {/* How it's calculated */}
        <div className="mt-8 bg-surface border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setHowOpen(!howOpen)}
            className="w-full px-5 py-4 text-left font-serif font-semibold text-text flex justify-between items-center hover:bg-bg transition-colors"
          >
            How is this calculated?
            <span className="text-muted text-lg">{howOpen ? '▴' : '▾'}</span>
          </button>
          {howOpen && (
            <div className="px-5 pb-5 text-sm text-muted leading-relaxed space-y-3">
              <p>
                <strong className="text-text">Salary taxable income</strong> is computed by subtracting
                the standard deduction (₹75,000 for FY25-26 under both regimes) and employer's PF
                contribution (if applicable, capped at ₹21,600/year i.e. ₹1,800/month) from your CTC.
              </p>
              <p>
                <strong className="text-text">Freelance income under 44ADA</strong>: Section 44ADA of
                the Income Tax Act allows eligible professionals to declare 50% of gross receipts as
                net profit. The remaining 50% is presumed to cover all business expenses, no matter
                what your actual expenses are. This applies to doctors, lawyers, architects, engineers,
                accountants, technical consultants, and more, up to ₹75 lakh in annual receipts.
              </p>
              <p>
                <strong className="text-text">Tax slabs (New Regime FY25-26)</strong>: 0% up to ₹4L,
                5% from ₹4L–8L, 10% from ₹8L–12L, 15% from ₹12L–16L, 20% from ₹16L–20L, 30% above
                ₹20L. A rebate u/s 87A makes income up to ₹12L completely tax-free. 4% health &
                education cess is added on top of tax.
              </p>
              <p>
                <strong className="text-text">Extra tax</strong> is the difference between tax on
                salary alone and tax on salary + freelance income combined. This is what your
                employer has NOT deducted — you must pay it yourself.
              </p>
              <p className="text-xs">Last updated: May 2025 · Based on Finance Act 2025 · Consult a CA for personalised advice.</p>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="mt-6 mb-8">
          <h2 className="font-serif font-semibold text-lg text-text mb-3">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-2">
            {faqs.map((f, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-5 py-3.5 text-left text-sm font-medium text-text flex justify-between items-center hover:bg-bg transition-colors"
                >
                  {f.q}
                  <span className="text-muted ml-3 flex-shrink-0">{faqOpen === i ? '▴' : '▾'}</span>
                </button>
                {faqOpen === i && (
                  <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <AdSlot size="leaderboard" className="mb-4" />
      </div>
    </>
  );
}

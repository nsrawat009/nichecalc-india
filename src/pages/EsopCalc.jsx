import { useState, useMemo } from 'react';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';
import ResultCard from '../components/ResultCard';
import Insight from '../components/Insight';
import Field, { NumberInput, Slider, Toggle } from '../components/Field';
import { CALCULATORS } from '../data/calculators';
import { calcTax, fmt, getMarginalRate } from '../utils/tax';

const meta = CALCULATORS.find(c => c.id === 'esop');

function calculate({ quantity, strikePrice, fmvAtExercise, salePrice, isListed, isEligibleStartup, holding, otherIncome }) {
  const perquisiteValue = Math.max(0, (fmvAtExercise - strikePrice) * quantity);

  // Perquisite taxed as salary
  const salaryInclPerq = otherIncome + perquisiteValue;
  const marginalRate   = getMarginalRate(salaryInclPerq, 'new');
  const perquisiteTax  = isEligibleStartup ? 0 : perquisiteValue * marginalRate;
  const deferredTax    = isEligibleStartup ? perquisiteValue * marginalRate : 0;

  // Capital gains
  const capitalGain    = (salePrice - fmvAtExercise) * quantity;

  let cgTax = 0;
  if (capitalGain > 0) {
    if (holding === 'stcg') {
      cgTax = isListed
        ? capitalGain * 0.20 * 1.04
        : capitalGain * marginalRate;
    } else {
      // LTCG: 12.5% with ₹1.25L exemption (both listed and unlisted post-Budget 2024)
      cgTax = Math.max(0, capitalGain - 125000) * 0.125 * 1.04;
    }
  }

  const totalTax  = perquisiteTax + (capitalGain > 0 ? cgTax : 0);
  const grossProceedsFromSale = salePrice * quantity;
  const netProceeds = grossProceedsFromSale - totalTax - (isEligibleStartup ? deferredTax : 0);
  const roi = strikePrice > 0 ? ((salePrice - strikePrice) / strikePrice * 100) : 0;
  const effectiveTaxOnProceeds = grossProceedsFromSale > 0 ? (totalTax / grossProceedsFromSale * 100) : 0;

  // LTCG benefit vs STCG
  let stcgTaxHypothetical = 0;
  if (capitalGain > 0) {
    stcgTaxHypothetical = isListed
      ? capitalGain * 0.20 * 1.04
      : capitalGain * marginalRate;
  }
  const ltcgTaxHypothetical = Math.max(0, capitalGain - 125000) * 0.125 * 1.04;
  const holdingBenefit = capitalGain > 0 ? Math.max(0, stcgTaxHypothetical - ltcgTaxHypothetical) : 0;

  return {
    perquisiteValue, perquisiteTax, deferredTax,
    capitalGain, cgTax, totalTax,
    grossProceedsFromSale, netProceeds,
    roi, effectiveTaxOnProceeds,
    holdingBenefit, marginalRate,
  };
}

export default function EsopCalc() {
  const [quantity,        setQuantity]        = useState(1000);
  const [strikePrice,     setStrikePrice]     = useState(100);
  const [fmvAtExercise,   setFmvAtExercise]   = useState(800);
  const [salePrice,       setSalePrice]       = useState(1200);
  const [isListed,        setIsListed]        = useState(false);
  const [isEligibleStartup, setIsEligibleStartup] = useState(false);
  const [holding,         setHolding]         = useState('ltcg');
  const [otherIncome,     setOtherIncome]     = useState(2000000);
  const [howOpen,         setHowOpen]         = useState(false);
  const [faqOpen,         setFaqOpen]         = useState(null);

  const r = useMemo(
    () => calculate({ quantity, strikePrice, fmvAtExercise, salePrice, isListed, isEligibleStartup, holding, otherIncome }),
    [quantity, strikePrice, fmvAtExercise, salePrice, isListed, isEligibleStartup, holding, otherIncome]
  );

  const faqs = [
    {
      q: 'What is ESOP perquisite tax and when do I pay it?',
      a: 'When you exercise ESOPs (convert options to shares), the difference between the Fair Market Value (FMV) and your strike price is a "perquisite" — treated as salary income and taxed in the year of exercise. Your employer should deduct TDS on this amount and report it in your Form 16. You don\'t pay again at sale on this portion.',
    },
    {
      q: 'What is the ESOP tax deferral for eligible startups?',
      a: 'DPIIT-certified eligible startups can defer the perquisite tax to the earliest of: (a) 5 years from allotment, (b) date of sale of shares, (c) date of leaving the company. This is an interest-free deferral — a significant benefit for employees who cannot sell shares immediately after exercise.',
    },
    {
      q: 'What is the capital gains cost basis for ESOPs?',
      a: 'After you exercise and pay perquisite tax on (FMV − strike price), the FMV at exercise becomes your cost of acquisition for capital gains purposes. When you eventually sell, capital gain = Sale Price − FMV at exercise. This prevents double taxation on the same gain.',
    },
    {
      q: 'LTCG vs STCG — what\'s the holding period for unlisted startup shares?',
      a: 'For unlisted company shares, the holding period for LTCG is 24 months. Held ≥ 24 months = LTCG (12.5% without indexation). Held < 24 months = STCG (taxed at your income slab rate). For listed shares, the LTCG threshold is 12 months.',
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

        <details className="mb-6 bg-surface border border-border rounded-xl overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium cursor-pointer text-muted hover:text-text">
            About this calculator ▾
          </summary>
          <p className="px-4 pb-4 text-sm text-muted leading-relaxed">
            ESOPs (Employee Stock Option Plans) create two tax events: a perquisite tax at exercise
            (treated as salary) and a capital gains tax at sale. This calculator covers both events for
            listed and unlisted startups, including the tax deferral benefit available to eligible
            DPIIT-certified startup employees. Enter your ESOP details to see your net proceeds,
            total tax outgo, and whether waiting for LTCG holding period saves you money. Updated for
            post-Budget 2024 LTCG rates. Not financial advice — consult a CA.
          </p>
        </details>

        <AdSlot size="leaderboard" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
            <h2 className="font-serif font-semibold text-base text-text">ESOP Details</h2>

            <Field label="Number of ESOPs">
              <NumberInput value={quantity} onChange={setQuantity} min={1} max={1000000} step={100} prefix="" />
            </Field>

            <Field label="Strike Price (₹/share)">
              <NumberInput value={strikePrice} onChange={setStrikePrice} min={0} max={100000} step={10} />
            </Field>

            <Field label="FMV at Exercise Date (₹/share)" hint="Fair Market Value when you exercise">
              <NumberInput value={fmvAtExercise} onChange={setFmvAtExercise} min={0} max={500000} step={50} />
            </Field>

            <Field label="Expected Sale Price (₹/share)">
              <NumberInput value={salePrice} onChange={setSalePrice} min={0} max={500000} step={50} />
            </Field>

            <Field label="Company Type">
              <Toggle
                options={[{ label: 'Unlisted', value: false }, { label: 'Listed', value: true }]}
                value={isListed}
                onChange={setIsListed}
              />
            </Field>

            {!isListed && (
              <Field label="DPIIT-Eligible Startup?" hint="Enables perquisite tax deferral">
                <Toggle
                  options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                  value={isEligibleStartup}
                  onChange={setIsEligibleStartup}
                />
              </Field>
            )}

            <Field label="Holding After Exercise">
              <Toggle
                options={[{ label: 'LTCG (≥24mo)', value: 'ltcg' }, { label: 'STCG (<24mo)', value: 'stcg' }]}
                value={holding}
                onChange={setHolding}
              />
            </Field>

            <Field label="Other Annual Income" hint="Salary + other income — sets your tax slab">
              <NumberInput value={otherIncome} onChange={setOtherIncome} min={0} max={20000000} step={100000} />
              <Slider value={otherIncome} onChange={setOtherIncome} min={0} max={10000000} step={100000} />
              <p className="text-xs text-hint text-right">{fmt(otherIncome)}</p>
            </Field>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="font-serif font-semibold text-base text-text mb-4">Tax & Net Proceeds</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultCard label="Net Proceeds After Tax" value={fmt(r.netProceeds)} primary />
                <ResultCard label="Total Tax Outgo" value={fmt(r.totalTax)} />
                <ResultCard
                  label={isEligibleStartup ? 'Perquisite Tax (Deferred)' : 'Perquisite Tax (at Exercise)'}
                  value={fmt(isEligibleStartup ? r.deferredTax : r.perquisiteTax)}
                />
                <ResultCard label="Capital Gains Tax (at Sale)" value={fmt(r.cgTax)} />
                <ResultCard label="ROI on Strike Price" value={r.roi.toFixed(0)} suffix="%" />
                <ResultCard label="Effective Tax on Proceeds" value={r.effectiveTaxOnProceeds.toFixed(1)} suffix="%" />
              </div>
            </div>

            <AdSlot size="rectangle" className="self-start" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <h2 className="font-serif font-semibold text-lg text-text">Key Insights</h2>

          {r.holdingBenefit > 10000 && holding === 'ltcg' && (
            <Insight type="positive" title={`LTCG Holding Saves You ${fmt(r.holdingBenefit)} vs STCG`}>
              By holding your shares for ≥ 24 months after exercise (unlisted) or ≥ 12 months (listed),
              you pay LTCG at 12.5% instead of STCG at your income slab rate.
            </Insight>
          )}

          {holding === 'stcg' && r.holdingBenefit > 10000 && (
            <Insight type="warning" title={`Waiting for LTCG Could Save ${fmt(r.holdingBenefit)}`}>
              If you can hold your shares for the LTCG threshold period, you'd save {fmt(r.holdingBenefit)}
              in capital gains tax. Weigh this against company risk and your liquidity needs.
            </Insight>
          )}

          {isEligibleStartup && (
            <Insight type="positive" title={`Eligible Startup: ₹${(r.deferredTax/100000).toFixed(1)}L Tax Deferred`}>
              As a DPIIT-certified startup employee, your perquisite tax of {fmt(r.deferredTax)} is
              deferred till you sell the shares, leave the company, or 5 years from allotment —
              whichever is earliest. This is an interest-free deferral, like a government loan.
            </Insight>
          )}

          {r.perquisiteValue > 2000000 && (
            <Insight type="warning" title="Large Perquisite — Consider Staggered Exercise">
              Your perquisite value of {fmt(r.perquisiteValue)} will significantly push up your taxable
              income this year. If you can exercise in tranches across two financial years, you may
              reduce the marginal rate applied. Discuss with your employer's HR/finance team.
            </Insight>
          )}

          <Insight type="info" title="Check Your Form 16">
            Perquisite income from ESOPs must appear in Part B of your Form 16 (issued by your employer).
            Verify this each year you exercise — it affects your ITR filing and advance tax calculations.
          </Insight>
        </div>

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
                <strong className="text-text">Stage 1 — Perquisite at exercise</strong>: (FMV − Strike Price)
                × Quantity = Perquisite Value. This is added to your other income and taxed at your
                marginal slab rate (+ 4% cess). For eligible startup employees, this is deferred.
              </p>
              <p>
                <strong className="text-text">Stage 2 — Capital gains at sale</strong>: (Sale Price − FMV at
                exercise) × Quantity = Capital Gain. FMV at exercise becomes your cost of acquisition,
                preventing double taxation. STCG (unlisted, &lt;24mo): slab rate. LTCG: 12.5% with
                ₹1.25L annual exemption (post-Budget July 2024). For listed shares, STCG = 20%.
              </p>
              <p>
                <strong className="text-text">Net proceeds</strong>: Total sale value minus both tax
                components (and deferred tax if applicable).
              </p>
              <p className="text-xs">Updated for Finance Act 2024 and Budget 2024 LTCG changes. Consult a CA.</p>
            </div>
          )}
        </div>

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

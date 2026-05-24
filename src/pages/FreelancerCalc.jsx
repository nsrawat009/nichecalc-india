import { useState, useMemo } from 'react';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';
import ResultCard from '../components/ResultCard';
import Insight from '../components/Insight';
import Field, { NumberInput, Slider, Toggle } from '../components/Field';
import { CALCULATORS } from '../data/calculators';
import { calcTax, fmt, getMarginalRate } from '../utils/tax';

const meta = CALCULATORS.find(c => c.id === 'freelancer');

function calculate({ grossBillings, expenses, gstRegistered, exportClient, regime, npsContribution }) {
  const gstRate = 0.18;
  const gstCollected = gstRegistered && !exportClient ? grossBillings * gstRate : 0;
  const totalBilledToClients = grossBillings + gstCollected;
  const itcEstimate = expenses * gstRate * 0.6;
  const gstPayable = Math.max(0, gstCollected - itcEstimate);

  // Income Tax under 44ADA
  const presumptiveProfit = grossBillings * 0.50;
  const npsDeduction = Math.min(npsContribution, 50000);
  const old80C = regime === 'old' ? 150000 : 0;
  const taxableIncome = Math.max(0, presumptiveProfit - npsDeduction - old80C);
  const incomeTax = calcTax(taxableIncome, regime);

  const annualTakeHome = grossBillings - expenses - incomeTax - gstPayable - npsContribution;
  const monthlyTakeHome = annualTakeHome / 12;
  const effectiveRate = grossBillings > 0 ? (incomeTax / grossBillings * 100) : 0;

  const marginalRate = getMarginalRate(taxableIncome, regime);
  const npsTaxSaved = npsContribution * marginalRate;

  return {
    gstCollected,
    totalBilledToClients,
    gstPayable,
    presumptiveProfit,
    taxableIncome,
    incomeTax,
    annualTakeHome,
    monthlyTakeHome,
    effectiveRate,
    npsTaxSaved,
  };
}

export default function FreelancerCalc() {
  const [grossBillings,   setGrossBillings]   = useState(2400000);
  const [expenses,        setExpenses]         = useState(240000);
  const [gstRegistered,   setGstRegistered]    = useState(true);
  const [exportClient,    setExportClient]     = useState(false);
  const [regime,          setRegime]           = useState('new');
  const [npsContribution, setNpsContribution]  = useState(50000);
  const [howOpen,         setHowOpen]          = useState(false);
  const [faqOpen,         setFaqOpen]          = useState(null);

  const r = useMemo(
    () => calculate({ grossBillings, expenses, gstRegistered, exportClient, regime, npsContribution }),
    [grossBillings, expenses, gstRegistered, exportClient, regime, npsContribution]
  );

  const faqs = [
    {
      q: 'What is Section 44ADA and who qualifies?',
      a: 'Section 44ADA allows eligible professionals — including IT consultants, doctors, lawyers, architects, chartered accountants, engineers, and interior designers — to declare 50% of gross receipts as net income without maintaining detailed books. The income limit is ₹75 lakh per year. Above that threshold, a CA audit is mandatory.',
    },
    {
      q: 'Do I need to register for GST as a freelancer?',
      a: 'GST registration is mandatory once your annual revenue crosses ₹20 lakh (₹10 lakh in some special category states). If your clients are businesses (B2B), they may require a GSTIN regardless of your turnover. Export of services to foreign clients qualifies as zero-rated under GST — you charge 0% GST but need to file a Letter of Undertaking (LUT).',
    },
    {
      q: 'How does NPS reduce my freelancer tax?',
      a: 'As a self-employed person, you can claim a deduction under Section 80CCD(1B) for NPS contributions up to ₹50,000 per year over and above the ₹1.5L 80C limit (in old regime). This is one of the best tax-saving instruments for freelancers in the old regime. Under the new regime, only the 80CCD(1B) deduction applies.',
    },
    {
      q: 'What is a Letter of Undertaking (LUT) for exports?',
      a: "If you provide services to foreign clients (export of services), you can supply them without charging GST by filing a LUT with the GST portal at the start of each financial year. This is free and straightforward. Without a LUT, you'd have to charge IGST at 18% and then claim a refund — LUT avoids this cash flow burden entirely.",
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
            Full-time freelancers and consultants face a unique tax situation: income tax under Section
            44ADA presumptive scheme, GST compliance, and no employer benefits. This calculator gives
            you a complete picture of your real take-home pay after income tax, GST payable, NPS
            contributions, and business expenses. It factors in whether you serve Indian vs export
            clients (which changes your GST obligation) and compares new vs old tax regimes. Use this
            to plan quarterly advance tax payments and make smart decisions about NPS contributions.
            Not financial advice — consult a CA.
          </p>
        </details>

        <AdSlot size="leaderboard" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
            <h2 className="font-serif font-semibold text-base text-text">Your Freelance Details</h2>

            <Field label="Annual Gross Billings" hint="Total invoiced to all clients (excl. GST)">
              <NumberInput value={grossBillings} onChange={setGrossBillings} min={0} max={7500000} step={10000} />
              <Slider value={grossBillings} onChange={setGrossBillings} min={0} max={7500000} step={50000} />
              <p className="text-xs text-hint text-right">{fmt(grossBillings)}</p>
            </Field>

            <Field label="Annual Business Expenses" hint="Software, hardware, office, internet, etc.">
              <NumberInput value={expenses} onChange={setExpenses} min={0} max={grossBillings} step={5000} />
            </Field>

            <Field label="GST Registered?">
              <Toggle
                options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                value={gstRegistered}
                onChange={setGstRegistered}
              />
            </Field>

            {gstRegistered && (
              <Field label="All clients are foreign / export?" hint="Zero-rated GST with LUT filing">
                <Toggle
                  options={[{ label: 'Yes (Export)', value: true }, { label: 'No (India)', value: false }]}
                  value={exportClient}
                  onChange={setExportClient}
                />
              </Field>
            )}

            <Field label="Tax Regime">
              <Toggle
                options={[{ label: 'New Regime', value: 'new' }, { label: 'Old Regime', value: 'old' }]}
                value={regime}
                onChange={setRegime}
              />
            </Field>

            <Field label="NPS Contribution (Annual)" hint="Up to ₹50,000 deductible under 80CCD(1B)">
              <NumberInput value={npsContribution} onChange={setNpsContribution} min={0} max={200000} step={1000} />
              <Slider value={npsContribution} onChange={setNpsContribution} min={0} max={200000} step={5000} />
            </Field>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="font-serif font-semibold text-base text-text mb-4">Your Take-Home</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultCard label="Annual Take-Home" value={fmt(r.annualTakeHome)} primary />
                <ResultCard label="Monthly Take-Home" value={fmt(r.monthlyTakeHome)} primary />
                <ResultCard label="Total Billed to Clients" value={fmt(r.totalBilledToClients)} />
                <ResultCard label="Income Tax Payable" value={fmt(r.incomeTax)} />
                <ResultCard label="GST Payable" value={fmt(r.gstPayable)} />
                <ResultCard label="Effective Tax Rate" value={r.effectiveRate.toFixed(1)} suffix="%" />
              </div>
            </div>

            <AdSlot size="rectangle" className="self-start" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <h2 className="font-serif font-semibold text-lg text-text">Key Insights</h2>

          {exportClient && (
            <Insight type="positive" title="Export of Services — Zero-Rated GST">
              You qualify for zero-rated GST on exports. File a Letter of Undertaking (LUT) on the GST
              portal before the financial year starts. It's free and takes 10 minutes. This means no
              GST charged to foreign clients and no refund hassle.
            </Insight>
          )}

          {grossBillings > 5000000 && (
            <Insight type="warning" title="Revenue Above ₹50L — CA Audit Required">
              Under Section 44AB, freelancers with turnover above ₹50 lakh must get books audited by a
              Chartered Accountant. You cannot use the 44ADA presumptive scheme above ₹75 lakh. Budget
              ₹15,000–50,000 for audit fees.
            </Insight>
          )}

          {r.npsTaxSaved > 0 && (
            <Insight type="positive" title={`NPS Saves You ${fmt(r.npsTaxSaved)} in Tax`}>
              Your ₹{(npsContribution/1000).toFixed(0)}K NPS contribution saves {fmt(r.npsTaxSaved)} in
              tax this year at your marginal rate. NPS locks in money till retirement (60) but 60% of
              the corpus is tax-free on withdrawal.
            </Insight>
          )}

          {r.gstPayable > 100000 && (
            <Insight type="info" title="Consider Monthly GST Filing">
              Your GST payable suggests significant monthly liability. Businesses with turnover above
              ₹5 crore must file monthly (GSTR-1 + GSTR-3B). Below that, you can opt for quarterly
              filing under QRMP scheme to reduce compliance burden.
            </Insight>
          )}

          <Insight type="neutral" title="Old vs New Regime">
            The new regime offers lower slabs but fewer deductions. The old regime lets you claim 80C
            (₹1.5L), HRA, LTA, and more. Toggle between regimes above to see which saves more for your
            income level.
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
                <strong className="text-text">GST</strong>: If registered and serving Indian clients,
                18% GST is added on top of your billings. You can claim Input Tax Credit (ITC) on
                business expenses (estimated at 60% of expenses × 18%). The net GST payable goes to
                the government — it's not your income.
              </p>
              <p>
                <strong className="text-text">Income tax (44ADA)</strong>: 50% of gross billings
                (excluding GST) is treated as taxable profit. NPS deductions under 80CCD(1B) and 80C
                (old regime only) reduce this further. Tax is computed on the remaining amount using
                the applicable regime slabs with 4% cess.
              </p>
              <p>
                <strong className="text-text">Take-home</strong>: Gross billings minus actual expenses,
                income tax, GST payable, and NPS contribution.
              </p>
              <p className="text-xs">Last updated: May 2025 · Based on Finance Act 2025 · Consult a CA for personalised advice.</p>
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

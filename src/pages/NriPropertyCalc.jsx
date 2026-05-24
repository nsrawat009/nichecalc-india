import { useState, useMemo } from 'react';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';
import ResultCard from '../components/ResultCard';
import Insight from '../components/Insight';
import Field, { NumberInput, Slider, Toggle } from '../components/Field';
import { CALCULATORS } from '../data/calculators';
import { fmt } from '../utils/tax';

const meta = CALCULATORS.find(c => c.id === 'nri-property');

const CII = {
  2001:100, 2002:105, 2003:109, 2004:113, 2005:117, 2006:122,
  2007:129, 2008:137, 2009:148, 2010:167, 2011:184, 2012:200,
  2013:220, 2014:240, 2015:254, 2016:264, 2017:272, 2018:280,
  2019:289, 2020:301, 2021:317, 2022:331, 2023:348, 2024:363, 2025:375,
};

const YEARS = Array.from({ length: 25 }, (_, i) => 2001 + i);

function calculate({ salePrice, purchasePrice, purchaseYear, saleYear, reinvest, reinvestAmount }) {
  const holdingYears = saleYear - purchaseYear;
  const isLTCG = holdingYears >= 2;

  let capitalGain, taxWithIndex, taxWithout, applicableTax;

  if (isLTCG) {
    const indexedCost = purchasePrice * ((CII[saleYear] || 375) / (CII[purchaseYear] || 100));
    capitalGain = salePrice - indexedCost;

    // Post-July 23 2024 Budget: choose lower of:
    // (a) 12.5% without indexation on original gain
    // (b) 20% with indexation
    const gainWithoutIndex = salePrice - purchasePrice;
    taxWithout = Math.max(0, gainWithoutIndex) * 0.125 * 1.04;
    taxWithIndex = Math.max(0, capitalGain) * 0.20 * 1.04;
    applicableTax = Math.min(taxWithout, taxWithIndex);
    capitalGain = Math.max(0, capitalGain); // use indexed for display
  } else {
    capitalGain = salePrice - purchasePrice;
    // STCG: 30% slab (NRIs commonly in 30% bracket)
    applicableTax = Math.max(0, capitalGain) * 0.30 * 1.04;
    taxWithIndex = null;
    taxWithout = applicableTax;
  }

  // Section 54 exemption: reinvest in residential property within 2 years
  const exemption54 = reinvest
    ? Math.min(Math.max(0, capitalGain), reinvestAmount)
    : 0;
  const taxableGainAfterExemption = Math.max(0, capitalGain - exemption54);
  const taxAfterExemption = isLTCG
    ? taxableGainAfterExemption * 0.125 * 1.04
    : taxableGainAfterExemption * 0.30 * 1.04;

  // TDS: buyer deducts 12.5% on entire sale consideration for NRI
  const tdsAmount   = salePrice * 0.125;
  const finalTax    = reinvest ? taxAfterExemption : applicableTax;
  const tdsRefund   = Math.max(0, tdsAmount - finalTax);
  const tdsShortfall = Math.max(0, finalTax - tdsAmount);
  const netAfterTax = salePrice - finalTax;

  return {
    holdingYears, isLTCG,
    capitalGain, taxWithIndex, taxWithout, applicableTax,
    exemption54, taxAfterExemption, finalTax,
    tdsAmount, tdsRefund, tdsShortfall,
    netAfterTax,
  };
}

export default function NriPropertyCalc() {
  const [salePrice,     setSalePrice]     = useState(8000000);
  const [purchasePrice, setPurchasePrice] = useState(3000000);
  const [purchaseYear,  setPurchaseYear]  = useState(2010);
  const [saleYear,      setSaleYear]      = useState(2025);
  const [country,       setCountry]       = useState('other');
  const [reinvest,      setReinvest]      = useState(false);
  const [reinvestAmount,setReinvestAmount]= useState(5000000);
  const [howOpen,       setHowOpen]       = useState(false);
  const [faqOpen,       setFaqOpen]       = useState(null);

  const r = useMemo(
    () => calculate({ salePrice, purchasePrice, purchaseYear, saleYear, reinvest, reinvestAmount }),
    [salePrice, purchasePrice, purchaseYear, saleYear, reinvest, reinvestAmount]
  );

  const hasDTAA = ['usa', 'uk', 'singapore'].includes(country);

  const faqs = [
    {
      q: 'Why does the buyer deduct TDS on the full sale price, not just the gain?',
      a: 'Under Section 195, the buyer of property from an NRI must deduct TDS at the applicable rate on the entire sale consideration (not just the capital gain). The NRI then files an ITR, and if the TDS exceeds actual tax liability, the excess is refunded. To avoid this cash blockage, NRIs can apply for a Lower TDS Certificate (Form 13) from the Income Tax Department before the sale.',
    },
    {
      q: 'What is Section 54 exemption and how does it work for NRIs?',
      a: 'Section 54 allows exemption from LTCG tax if you reinvest the gains in a residential property in India within 1 year before or 2 years after the sale, or construct a house within 3 years. NRIs can also invest in a single residential property outside India (Section 54F conditions apply). The exemption is limited to the amount reinvested.',
    },
    {
      q: 'What is the indexation benefit and how does it reduce tax?',
      a: 'Indexation adjusts your purchase price for inflation using the Cost Inflation Index (CII). A higher indexed cost means a lower capital gain. For properties purchased before July 23, 2024, you can choose between 20% tax with indexation OR 12.5% tax without indexation — whichever results in lower tax. This calculator shows both and picks the lower option.',
    },
    {
      q: 'How much can an NRI repatriate from property sale proceeds?',
      a: 'NRIs can repatriate up to USD 1 million (approx ₹8.3 crore) per financial year from property sale proceeds through their NRO account, after paying all applicable taxes. The funds must be transferred to an NRE account or foreign bank account. You need a CA certificate (Form 15CA/15CB) for the remittance.',
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
            NRIs selling property in India face a unique set of obligations: mandatory TDS deduction by
            the buyer at 12.5% of the sale value (not just the gain), capital gains tax at LTCG or STCG
            rates, and potential DTAA benefits depending on your country of residence. This calculator
            helps you estimate your tax liability, TDS deducted, potential refund, and net repatriatable
            amount. Updated for the July 2024 Budget changes to LTCG indexation rules. Always consult a
            CA before completing the transaction. Not financial advice.
          </p>
        </details>

        <AdSlot size="leaderboard" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
            <h2 className="font-serif font-semibold text-base text-text">Property Details</h2>

            <Field label="Sale Price">
              <NumberInput value={salePrice} onChange={setSalePrice} min={100000} max={100000000} step={100000} />
              <Slider value={salePrice} onChange={setSalePrice} min={500000} max={50000000} step={500000} />
              <p className="text-xs text-hint text-right">{fmt(salePrice)}</p>
            </Field>

            <Field label="Original Purchase Price">
              <NumberInput value={purchasePrice} onChange={setPurchasePrice} min={100000} max={salePrice} step={100000} />
              <Slider value={purchasePrice} onChange={setPurchasePrice} min={100000} max={20000000} step={100000} />
              <p className="text-xs text-hint text-right">{fmt(purchasePrice)}</p>
            </Field>

            <Field label="Year of Purchase">
              <select
                value={purchaseYear}
                onChange={e => setPurchaseYear(Number(e.target.value))}
                className="w-full border border-border rounded-lg py-2.5 px-3 text-sm bg-surface focus:outline-none focus:border-accentM transition-colors"
              >
                {YEARS.filter(y => y < saleYear).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>

            <Field label="Year of Sale">
              <select
                value={saleYear}
                onChange={e => setSaleYear(Number(e.target.value))}
                className="w-full border border-border rounded-lg py-2.5 px-3 text-sm bg-surface focus:outline-none focus:border-accentM transition-colors"
              >
                {YEARS.filter(y => y > purchaseYear).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>

            <Field label="Resident Country">
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full border border-border rounded-lg py-2.5 px-3 text-sm bg-surface focus:outline-none focus:border-accentM transition-colors"
              >
                <option value="usa">USA</option>
                <option value="uk">UK</option>
                <option value="singapore">Singapore</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Will you reinvest in India property?" hint="Section 54 / 54F exemption">
              <Toggle
                options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                value={reinvest}
                onChange={setReinvest}
              />
            </Field>

            {reinvest && (
              <Field label="Reinvestment Amount" hint="Amount to be invested in new property">
                <NumberInput value={reinvestAmount} onChange={setReinvestAmount} min={0} max={salePrice} step={100000} />
                <p className="text-xs text-hint text-right">{fmt(reinvestAmount)}</p>
              </Field>
            )}
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="font-serif font-semibold text-base text-text mb-4">Tax & Net Amount</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultCard label="Net Amount After Tax" value={fmt(r.netAfterTax)} primary />
                <ResultCard
                  label={r.isLTCG ? `Capital Gains (LTCG, ${r.holdingYears}yr)` : `Capital Gains (STCG, ${r.holdingYears}yr)`}
                  value={fmt(r.capitalGain)}
                />
                <ResultCard label="Tax Payable" value={fmt(r.finalTax)} />
                <ResultCard label="TDS Deducted by Buyer" value={fmt(r.tdsAmount)} />
                {r.tdsRefund > 0 && (
                  <ResultCard label="TDS Refund Due" value={fmt(r.tdsRefund)} primary />
                )}
                {r.tdsShortfall > 0 && (
                  <ResultCard label="Additional Tax to Pay" value={fmt(r.tdsShortfall)} />
                )}
                {reinvest && (
                  <ResultCard label="Section 54 Exemption" value={fmt(r.exemption54)} primary />
                )}
              </div>

              {r.isLTCG && r.taxWithIndex !== null && (
                <div className="mt-4 p-3 bg-blueL border border-blue/20 rounded-lg">
                  <p className="text-xs font-semibold text-blue mb-2">Budget 2024: Choose Lower of Two</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface p-2 rounded border border-border">
                      <p className="text-muted">12.5% without indexation</p>
                      <p className="font-bold text-text">{fmt(r.taxWithout)}</p>
                    </div>
                    <div className="bg-surface p-2 rounded border border-border">
                      <p className="text-muted">20% with indexation</p>
                      <p className="font-bold text-text">{fmt(r.taxWithIndex)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue mt-2">
                    ✓ Using {r.taxWithout <= r.taxWithIndex ? '12.5% without indexation' : '20% with indexation'} (lower option)
                  </p>
                </div>
              )}
            </div>

            <AdSlot size="rectangle" className="self-start" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <h2 className="font-serif font-semibold text-lg text-text">Key Insights</h2>

          {r.tdsRefund > 0 && (
            <Insight type="info" title={`TDS Refund of ${fmt(r.tdsRefund)} — File ITR to Claim`}>
              The buyer will deduct {fmt(r.tdsAmount)} as TDS, but your actual tax liability is only
              {fmt(r.finalTax)}. The difference ({fmt(r.tdsRefund)}) is refundable. File your ITR
              (Form ITR-2 or ITR-3) for the relevant assessment year to claim this refund.
            </Insight>
          )}

          <Insight type="warning" title="Apply for Lower TDS Certificate (Form 13) Before Sale">
            If you expect a large TDS-vs-tax gap, apply for a Lower Deduction Certificate from your
            Jurisdictional AO via the TRACES portal before the sale. This can significantly reduce
            the cash locked in TDS — especially useful when the refund process takes months.
          </Insight>

          {hasDTAA && (
            <Insight type="info" title={`DTAA with ${country.toUpperCase()} May Reduce Your Tax`}>
              India has a Double Taxation Avoidance Agreement with {country === 'usa' ? 'the USA' : country === 'uk' ? 'the UK' : 'Singapore'}.
              DTAA provisions may allow you to claim a tax credit in your resident country for taxes
              paid in India, or provide specific reduced tax rates. Consult a CA who specialises in
              cross-border taxation.
            </Insight>
          )}

          {reinvest && r.exemption54 > 0 && (
            <Insight type="positive" title={`Section 54 Saves ${fmt(r.finalTax < r.applicableTax ? r.applicableTax - r.finalTax : 0)} in Tax`}>
              You must purchase the new property within 1 year before or 2 years after the sale
              (or construct within 3 years). Keep all transaction records. If the sale and purchase
              don't happen in the same financial year, deposit the amount in Capital Gains Account
              Scheme (CGAS) in a PSU bank before filing your ITR.
            </Insight>
          )}

          <Insight type="neutral" title="NRE Account Repatriation — USD 1M Annual Limit">
            NRIs can repatriate up to USD 1 million per financial year from property sale proceeds
            (post-tax). Funds must flow through your NRO account. You'll need a CA certificate in
            Form 15CA/15CB to initiate the foreign remittance.
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
                <strong className="text-text">LTCG vs STCG</strong>: Property held for ≥ 2 years is
                Long-Term Capital Gain (LTCG). Held less is Short-Term (STCG), taxed at your income
                slab rate (typically 30% + 4% cess for NRIs).
              </p>
              <p>
                <strong className="text-text">Indexation</strong>: The Cost Inflation Index (CII) adjusts
                your purchase price for inflation. A higher indexed cost means lower gains. CII is
                published by the Income Tax Department each year (base year FY 2001-02 = 100).
              </p>
              <p>
                <strong className="text-text">Budget 2024 change</strong>: For properties purchased before
                July 23, 2024, taxpayers can choose the lower of (a) 12.5% on unindexed gain or
                (b) 20% on indexed gain. This calculator automatically picks the lower option.
              </p>
              <p>
                <strong className="text-text">TDS by buyer</strong>: Under Section 195, buyers must
                deduct 12.5% TDS on the entire sale consideration (not just the gain) when purchasing
                from NRIs. This is deposited to the government via Form 26QB.
              </p>
              <p className="text-xs">Updated May 2025 · Based on Finance Act 2024 and Budget 2024 amendments · Consult a CA.</p>
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

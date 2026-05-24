import { useState, useMemo } from 'react';
import SEOHead from '../components/SEOHead';
import AdSlot from '../components/AdSlot';
import ResultCard from '../components/ResultCard';
import Insight from '../components/Insight';
import Field, { NumberInput, Slider, Toggle } from '../components/Field';
import { CALCULATORS } from '../data/calculators';
import { fmt } from '../utils/tax';

const meta = CALCULATORS.find(c => c.id === 'ev-petrol');

function calculate({ evPrice, petrolPrice, kmYear, petrolRate, elecRate, petrolEff, evEff, years, homeCharger }) {
  const petrolFuelCost  = (kmYear / petrolEff) * petrolRate;
  const evElecCost      = (kmYear / evEff) * elecRate;
  const chargerAmortised = homeCharger ? 25000 / years : 0;

  const petrolService  = 18000;
  const evService      = 7000;

  const petrolInsurance = petrolPrice * 0.018;
  const evInsurance     = evPrice    * 0.022;

  const petrolRoadTax  = petrolPrice * 0.09;
  const evRoadTax      = 0;

  const petrolAnnual = petrolFuelCost + petrolService + petrolInsurance + (petrolRoadTax / years);
  const evAnnual     = evElecCost    + evService      + evInsurance     + chargerAmortised;

  const chargerOnce  = homeCharger ? 25000 : 0;
  const petrolTCO    = petrolPrice + petrolRoadTax + petrolAnnual * years;
  const evTCO        = evPrice     + chargerOnce   + evAnnual     * years;

  const annualSaving   = petrolAnnual - evAnnual;
  const totalSaving    = petrolTCO - evTCO;
  const breakEvenYears = annualSaving > 0
    ? (evPrice - petrolPrice + chargerOnce - petrolRoadTax) / annualSaving
    : Infinity;

  const co2SavedKg   = kmYear * years * (0.162 - 0.040);
  const petrolCostKm = petrolAnnual / kmYear;
  const evCostKm     = evAnnual    / kmYear;

  return {
    petrolFuelCost, evElecCost,
    petrolService, evService,
    petrolInsurance, evInsurance,
    petrolRoadTax, evRoadTax,
    petrolAnnual, evAnnual,
    petrolTCO, evTCO,
    annualSaving, totalSaving,
    breakEvenYears, co2SavedKg,
    petrolCostKm, evCostKm,
  };
}

function CostBar({ label, fuel, service, insurance, roadTax, color }) {
  const total = fuel + service + insurance + roadTax;
  if (total === 0) return null;
  const pct = v => Math.round((v / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span className="font-medium text-text">{label}</span>
        <span>{fmt(total)}/yr</span>
      </div>
      <div className="flex h-6 rounded-lg overflow-hidden text-xs text-white font-medium">
        <div style={{ width: `${pct(fuel)}%` }}  className="bg-accentM flex items-center justify-center overflow-hidden" title={`Fuel: ${fmt(fuel)}`}>{pct(fuel) > 8 ? `${pct(fuel)}%` : ''}</div>
        <div style={{ width: `${pct(service)}%` }} className="bg-blue flex items-center justify-center overflow-hidden" title={`Service: ${fmt(service)}`}>{pct(service) > 8 ? `${pct(service)}%` : ''}</div>
        <div style={{ width: `${pct(insurance)}%` }} className="bg-amber flex items-center justify-center overflow-hidden" title={`Insurance: ${fmt(insurance)}`}>{pct(insurance) > 8 ? `${pct(insurance)}%` : ''}</div>
        {roadTax > 0 && <div style={{ width: `${pct(roadTax)}%` }} className="bg-warn flex items-center justify-center overflow-hidden" title={`Road Tax: ${fmt(roadTax)}`}>{pct(roadTax) > 8 ? `${pct(roadTax)}%` : ''}</div>}
      </div>
      <div className="flex gap-3 mt-1 flex-wrap">
        {[
          { label: 'Fuel/Elec', color: 'bg-accentM' },
          { label: 'Servicing', color: 'bg-blue' },
          { label: 'Insurance', color: 'bg-amber' },
          roadTax > 0 && { label: 'Road Tax', color: 'bg-warn' },
        ].filter(Boolean).map(item => (
          <span key={item.label} className="flex items-center gap-1 text-xs text-muted">
            <span className={`inline-block w-2 h-2 rounded-full ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function EvPetrolCalc() {
  const [evPrice,     setEvPrice]     = useState(1500000);
  const [petrolPrice, setPetrolPrice] = useState(1000000);
  const [kmYear,      setKmYear]      = useState(15000);
  const [petrolRate,  setPetrolRate]  = useState(102);
  const [elecRate,    setElecRate]    = useState(8);
  const [petrolEff,   setPetrolEff]   = useState(15);
  const [evEff,       setEvEff]       = useState(6.5);
  const [years,       setYears]       = useState(7);
  const [homeCharger, setHomeCharger] = useState(true);
  const [howOpen,     setHowOpen]     = useState(false);
  const [faqOpen,     setFaqOpen]     = useState(null);

  const r = useMemo(
    () => calculate({ evPrice, petrolPrice, kmYear, petrolRate, elecRate, petrolEff, evEff, years, homeCharger }),
    [evPrice, petrolPrice, kmYear, petrolRate, elecRate, petrolEff, evEff, years, homeCharger]
  );

  const evWins   = r.totalSaving > 0;
  const beValid  = isFinite(r.breakEvenYears) && r.breakEvenYears > 0;

  const faqs = [
    {
      q: 'Does EV battery replacement affect the calculation?',
      a: 'Battery replacement (typically ₹3–6 lakh for a standard 40kWh pack) is not in the base calculation as modern EV batteries are warranted for 8 years / 1,60,000 km by most manufacturers in India. If your battery needs replacement within the comparison window, add that cost to the EV TCO manually.',
    },
    {
      q: 'Which states give road tax exemption on EVs?',
      a: 'As of 2025, states including Delhi, Maharashtra, Gujarat, Karnataka, and Rajasthan offer partial or full road tax exemption on electric vehicles. Some also offer registration fee waivers. The exact benefit varies — check your state transport department website for current rates.',
    },
    {
      q: 'What is the real-world range of popular Indian EVs?',
      a: 'Popular choices in India: Tata Nexon EV (312–465 km ARAI, real-world 250–350 km), MG ZS EV (~461 km ARAI), Hyundai Ioniq 5 (~631 km), and Tata Punch EV (315–421 km). Real-world range is typically 70–80% of ARAI-certified range depending on driving conditions.',
    },
    {
      q: 'Is home charging significantly cheaper than public charging?',
      a: 'Yes — significantly. Home charging costs ₹6–10/kWh on average. Public fast chargers cost ₹15–25/kWh. If you can charge at home overnight, your running cost advantage over petrol is maximised. Public charging is best for top-ups during long journeys.',
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
            The sticker price of an EV is just the beginning. This calculator computes the true total
            cost of ownership over your chosen period, including fuel/electricity, insurance, servicing,
            road tax, and the one-time home charger investment. Indian-specific assumptions: petrol
            service at ₹18,000/year, EV service at ₹7,000/year, EV road tax exemption in most states,
            EV insurance premium ~20% higher due to battery risk. CO₂ savings use India's grid
            emission factor.
          </p>
        </details>

        <AdSlot size="leaderboard" className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
            <h2 className="font-serif font-semibold text-base text-text">Car Details</h2>

            <Field label="EV On-Road Price">
              <NumberInput value={evPrice} onChange={setEvPrice} min={500000} max={10000000} step={25000} />
              <Slider value={evPrice} onChange={setEvPrice} min={500000} max={5000000} step={25000} />
              <p className="text-xs text-hint text-right">{fmt(evPrice)}</p>
            </Field>

            <Field label="Petrol Car On-Road Price">
              <NumberInput value={petrolPrice} onChange={setPetrolPrice} min={300000} max={5000000} step={25000} />
              <Slider value={petrolPrice} onChange={setPetrolPrice} min={300000} max={3000000} step={25000} />
              <p className="text-xs text-hint text-right">{fmt(petrolPrice)}</p>
            </Field>

            <Field label="Annual Driving (km)">
              <NumberInput value={kmYear} onChange={setKmYear} min={3000} max={60000} step={1000} prefix="" />
              <Slider value={kmYear} onChange={setKmYear} min={3000} max={50000} step={500} />
              <p className="text-xs text-hint text-right">{new Intl.NumberFormat('en-IN').format(kmYear)} km/yr</p>
            </Field>

            <Field label={`Petrol Price (₹/litre) — ₹${petrolRate}`}>
              <Slider value={petrolRate} onChange={setPetrolRate} min={85} max={130} step={1} />
            </Field>

            <Field label={`Electricity Rate (₹/kWh) — ₹${elecRate}`}>
              <Slider value={elecRate} onChange={setElecRate} min={4} max={15} step={0.5} />
            </Field>

            <Field label={`Petrol Efficiency — ${petrolEff} km/litre`}>
              <Slider value={petrolEff} onChange={setPetrolEff} min={8} max={25} step={0.5} />
            </Field>

            <Field label={`EV Efficiency — ${evEff} km/kWh`}>
              <Slider value={evEff} onChange={setEvEff} min={4} max={10} step={0.1} />
            </Field>

            <Field label={`Comparison Period — ${years} years`}>
              <Slider value={years} onChange={setYears} min={3} max={12} step={1} />
            </Field>

            <Field label="Home Charger? (+₹25,000 one-time)">
              <Toggle
                options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]}
                value={homeCharger}
                onChange={setHomeCharger}
              />
            </Field>
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Winner banner */}
            <div className={`rounded-xl p-5 border ${evWins ? 'bg-accentL border-accentM/40' : 'bg-warnL border-amber/40'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${evWins ? 'text-accentM' : 'text-warn'}`}>
                {years}-Year Winner
              </p>
              <p className={`text-3xl font-serif font-bold ${evWins ? 'text-accent' : 'text-warn'}`}>
                {evWins ? '⚡ EV' : '⛽ Petrol'} saves {fmt(Math.abs(r.totalSaving))}
              </p>
              {beValid && (
                <p className="text-sm text-muted mt-1">
                  EV breaks even in <span className="font-semibold text-text">{r.breakEvenYears.toFixed(1)} years</span>
                </p>
              )}
            </div>

            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="font-serif font-semibold text-base text-text mb-4">Cost Comparison</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <ResultCard label="EV Annual Running" value={fmt(r.evAnnual)} primary />
                <ResultCard label="Petrol Annual Running" value={fmt(r.petrolAnnual)} />
                <ResultCard label={`EV TCO (${years}yr)`} value={fmt(r.evTCO)} primary />
                <ResultCard label={`Petrol TCO (${years}yr)`} value={fmt(r.petrolTCO)} />
                <ResultCard label="EV Cost/km" value={`₹${r.evCostKm.toFixed(1)}`} />
                <ResultCard label="Petrol Cost/km" value={`₹${r.petrolCostKm.toFixed(1)}`} />
              </div>

              <div className="flex flex-col gap-4">
                <CostBar
                  label="EV Annual Cost Breakdown"
                  fuel={r.evElecCost}
                  service={r.evService}
                  insurance={r.evInsurance}
                  roadTax={0}
                />
                <CostBar
                  label="Petrol Annual Cost Breakdown"
                  fuel={r.petrolFuelCost}
                  service={r.petrolService}
                  insurance={r.petrolInsurance}
                  roadTax={r.petrolRoadTax / years}
                />
              </div>
            </div>

            <ResultCard
              label={`CO₂ Saved over ${years} years`}
              value={`${(r.co2SavedKg / 1000).toFixed(1)} tonnes`}
            />

            <AdSlot size="rectangle" className="self-start" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <h2 className="font-serif font-semibold text-lg text-text">Key Insights</h2>

          {petrolRate > 100 && (
            <Insight type="positive" title={`At ₹${petrolRate}/litre, EV Saves ₹${(r.petrolFuelCost - r.evElecCost).toFixed(0)}/yr on Fuel Alone`}>
              High petrol prices significantly accelerate EV payback. Every ₹1 increase in petrol price
              saves you an extra {fmt((kmYear / petrolEff))} per year on fuel.
            </Insight>
          )}

          {kmYear < 10000 && (
            <Insight type="warning" title="Low Mileage — EV Premium Takes Longer to Recover">
              At {new Intl.NumberFormat('en-IN').format(kmYear)} km/year, you're saving less on running
              costs. Break-even extends significantly. Consider whether the EV premium is justified for
              your usage pattern.
            </Insight>
          )}

          {kmYear > 20000 && (
            <Insight type="positive" title="High Mileage Driver — EV Payoff is Fastest for You">
              Above 20,000 km/year, the fuel savings compound quickly. High-mileage drivers see the
              strongest case for switching to EV.
            </Insight>
          )}

          {evPrice <= 1500000 && (
            <Insight type="info" title="FAME III / State Subsidy May Apply">
              EVs priced below ₹15 lakh may qualify for central FAME III subsidies and additional state
              subsidies. Check the government e-Amrit portal for current incentives — they can
              significantly reduce the purchase price gap.
            </Insight>
          )}

          <Insight type="neutral" title="Home Charging vs Public Charging">
            Home charging (₹{elecRate}/kWh assumed) is 2–3× cheaper than public fast chargers
            (₹16–24/kWh). If you live in an apartment without dedicated parking/charging, factor in
            the higher public charging cost — it narrows the EV advantage.
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
              <p><strong className="text-text">Fuel costs</strong>: Annual km ÷ efficiency × price per unit. EV uses kWh, petrol uses litres.</p>
              <p><strong className="text-text">Servicing</strong>: Industry average for India — petrol ₹18,000/yr (oil changes, filters, spark plugs, etc.), EV ₹7,000/yr (tyres, brakes, coolant top-up). EVs have ~70% fewer moving parts.</p>
              <p><strong className="text-text">Insurance</strong>: Petrol ~1.8% of on-road price/yr, EV ~2.2% (slightly higher due to battery replacement risk). Adjust as per actual quotes.</p>
              <p><strong className="text-text">Road tax</strong>: Petrol ~9% of on-road price (national average), EV = 0% in most states. Amortised over comparison years.</p>
              <p><strong className="text-text">CO₂</strong>: Petrol 162g CO₂/km (ARAI average), EV 40g CO₂/km (India grid average per MNRE).</p>
              <p className="text-xs">This is a simplified model. Actual costs vary by state, vehicle model, and usage. Updated May 2025.</p>
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

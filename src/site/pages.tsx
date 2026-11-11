import { Link } from 'react-router-dom'
import { Icon } from '../components/icons'
import { site, telHref, waHref } from './content'
import { usePublic } from './usePublic'
import { CtaBand, PageHero } from './SiteLayout'
import Gallery from './Gallery'
import RequestForm from './RequestForm'
import { useTitle } from './useTitle'

function Section({ kicker, title, children, className = '' }: { kicker: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-flash">{kicker}</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-5xl">{title}</h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}

function ServiceCards({ detailed }: { detailed?: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {site.services.map((s) => (
        <article key={s.slug} id={s.slug} className="group scroll-mt-28 rounded-lg border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-flash/40 hover:shadow-lg">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-flash/10 text-flash transition group-hover:bg-flash group-hover:text-white"><Icon name={s.icon} size={26} /></div>
          <h3 className="mt-4 text-xl font-bold leading-snug text-ink">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.text}</p>
          {detailed && <ul className="mt-4 space-y-1.5 text-sm">{s.points.map((p) => <li key={p} className="flex gap-2"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-flash" />{p}</li>)}</ul>}
        </article>
      ))}
    </div>
  )
}

export function Home() {
  const { company, realisations } = usePublic()
  useTitle()
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} aria-hidden="true" />
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-flash/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 font-display text-sm font-bold uppercase tracking-[0.15em] text-white/85"><Icon name="bolt" size={15} className="text-flash" /> {site.hero.kicker}</p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">{site.hero.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-white/75">{site.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/devis" className="flex items-center gap-2 rounded-md bg-flash px-6 py-3.5 text-lg font-bold transition hover:brightness-110">Devis gratuit <Icon name="arrow" size={20} /></Link>
              <a href={telHref(company.phone)} className="flex items-center gap-2 rounded-md border-2 border-white/30 px-6 py-3 text-lg font-bold transition hover:border-white"><Icon name="phone" size={20} /> {company.phone}</a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/60"><Icon name="pin" size={15} /> {site.area}</p>
          </div>
          <div className="hidden gap-4 lg:grid">
            {site.promises.map((p) => (
              <div key={p.title} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-flash"><Icon name={p.icon} size={22} /></div>
                <div><p className="font-bold">{p.title}</p><p className="text-sm text-white/65">{p.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-panel lg:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6">
          {site.promises.map((p) => <div key={p.title} className="flex items-start gap-2"><Icon name={p.icon} size={20} className="mt-0.5 shrink-0 text-flash" /><p className="text-sm font-semibold leading-snug">{p.title}</p></div>)}
        </div>
      </div>

      <Section kicker="Nos services" title="Toute l'électricité du bâtiment, du particulier au chantier professionnel">
        <ServiceCards />
        <Link to="/services" className="mt-8 inline-flex items-center gap-2 font-bold text-flash hover:underline">Détail des services <Icon name="arrow" size={18} /></Link>
      </Section>

      <Section kicker="Comment ça se passe" title="De votre appel à la mise en service" className="bg-panel">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.steps.map((s, i) => (
            <li key={s.title} className="relative rounded-lg bg-white p-6 shadow-sm">
              <span className="font-display text-5xl font-bold text-flash/25">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-2 text-xl font-bold text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-ink/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {(realisations === null || realisations.length > 0) && (
        <Section kicker="Réalisations" title="Quelques-uns de nos chantiers">
          <Gallery limit={6} />
          <Link to="/realisations" className="mt-8 inline-flex items-center gap-2 font-bold text-flash hover:underline">Toutes les réalisations <Icon name="arrow" size={18} /></Link>
        </Section>
      )}

      <Section kicker="Questions fréquentes" title="Vous vous demandez peut-être…" className={realisations?.length ? 'bg-panel' : ''}>
        <div className="mx-auto max-w-3xl divide-y divide-line rounded-lg border border-line bg-white">
          {site.faq.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-ink">{f.q}<Icon name="down" size={20} className="shrink-0 text-flash transition group-open:rotate-180" /></summary>
              <p className="mt-3 leading-relaxed text-ink/75">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
      <CtaBand />
    </>
  )
}

export function Services() {
  useTitle('Services')
  return (
    <>
      <PageHero kicker="Services" title="Nos prestations en électricité" text="Particuliers, commerces, bureaux et promoteurs : nous prenons en charge l'installation, la rénovation, la mise aux normes et le dépannage." />
      <Section kicker="Ce que nous faisons" title="Des travaux faits dans les règles"><ServiceCards detailed /></Section>
      <section className="bg-panel py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-flash">Professionnels</p>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Un suivi de chantier rigoureux</h2>
            <p className="mt-4 leading-relaxed text-ink/75">Pour les lots électricité, nous établissons un devis quantitatif détaillé, puis des attachements des quantités réellement réalisées et les factures correspondantes : vous savez à tout moment ce qui a été fait et ce qui reste à réaliser.</p>
          </div>
          <ul className="grid gap-3 self-center">
            {['Devis quantitatif et estimatif', 'Bons pour accord', 'Attachements : quantité du contrat, réalisée et restante', 'Factures HT / TVA / TTC'].map((t) => (
              <li key={t} className="flex items-center gap-3 rounded-md bg-white p-4 font-semibold shadow-sm"><Icon name="doc" size={20} className="text-flash" />{t}</li>
            ))}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  )
}

export function Realisations() {
  useTitle('Réalisations')
  return (
    <>
      <PageHero kicker="Réalisations" title="Nos chantiers en images" text="Installations, rénovations et tableaux réalisés par notre équipe." />
      <section className="py-16"><div className="mx-auto max-w-6xl px-4"><Gallery /></div></section>
      <CtaBand />
    </>
  )
}

function ContactAside() {
  const { company } = usePublic()
  const items = [
    { icon: 'phone' as const, label: 'Téléphone', value: company.phone, href: telHref(company.phone) },
    { icon: 'whatsapp' as const, label: 'WhatsApp', value: 'Écrire un message', href: waHref() },
    ...(company.email ? [{ icon: 'mail' as const, label: 'E-mail', value: company.email, href: `mailto:${company.email}` }] : []),
    { icon: 'pin' as const, label: 'Adresse', value: company.address },
    { icon: 'clock' as const, label: 'Zone', value: site.area },
  ]
  return (
    <aside className="space-y-3">
      {items.map((i) => {
        const body = <><div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-flash/10 text-flash"><Icon name={i.icon} size={22} /></div><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{i.label}</p><p className="break-words font-bold text-ink">{i.value}</p></div></>
        return i.href
          ? <a key={i.label} href={i.href} target={i.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-4 rounded-lg border border-line bg-white p-4 transition hover:border-flash/40 hover:shadow">{body}</a>
          : <div key={i.label} className="flex items-center gap-4 rounded-lg border border-line bg-white p-4">{body}</div>
      })}
    </aside>
  )
}

export function Devis() {
  useTitle('Devis gratuit')
  return (
    <>
      <PageHero kicker="Devis gratuit" title="Décrivez votre projet, nous vous répondons rapidement" text="Gratuit et sans engagement. Plus votre description est précise, plus notre devis le sera." />
      <section className="py-16"><div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1.6fr_1fr]"><RequestForm kind="devis" /><ContactAside /></div></section>
    </>
  )
}

export function Contact() {
  useTitle('Contact')
  return (
    <>
      <PageHero kicker="Contact" title="Parlons de votre installation" text="Appelez-nous, écrivez-nous sur WhatsApp ou laissez un message." />
      <section className="py-16"><div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1fr_1.6fr]"><ContactAside /><RequestForm kind="contact" /></div></section>
    </>
  )
}

export function NotFound() {
  useTitle('Page introuvable')
  return (
    <section className="py-24 text-center">
      <p className="font-display text-8xl font-bold text-flash">404</p>
      <p className="mt-4 text-2xl font-bold text-ink">Cette page n'existe pas.</p>
      <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-md bg-flash px-6 py-3 font-bold text-white">Retour à l'accueil <Icon name="arrow" size={18} /></Link>
    </section>
  )
}

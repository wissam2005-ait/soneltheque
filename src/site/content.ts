import type { IconName } from '../components/icons'

/** CONTENU DU SITE PUBLIC — textes modifiables ici. Coordonnées : admin → Paramètres. */
export const site = {
  name: 'Sonaltech Électrique',
  area: 'Béjaïa, Alger et leurs environs',
  phone: '0770 337 963',
  whatsapp: '213770337963',
  whatsappMessage: 'Bonjour, je vous contacte depuis votre site internet.',
  address: 'Village El Ghaba, Smaoun, Béjaïa',

  hero: {
    kicker: "Entreprise d'électricité générale",
    title: 'Votre électricité, installée et dépannée par des professionnels',
    text: "Installation neuve, rénovation, mise aux normes, tableaux électriques et dépannage : une équipe qualifiée, des chantiers propres et des devis clairs.",
  },
  promises: [
    { icon: 'doc', title: 'Devis gratuit et détaillé', text: 'Chaque poste chiffré, sans surprise.' },
    { icon: 'clock', title: 'Intervention rapide', text: 'Dépannage dans les meilleurs délais.' },
    { icon: 'shield', title: 'Installations sécurisées', text: 'Protections, terre et différentiels.' },
    { icon: 'team', title: 'Équipe qualifiée', text: 'Des électriciens du métier.' },
  ] satisfies { icon: IconName; title: string; text: string }[],
  services: [
    { slug: 'installation', icon: 'home', title: 'Installation électrique neuve', text: "Logements, villas, locaux professionnels : étude, passage des gaines et câbles, appareillage, tableau et mise en service.", points: ['Plan des prises et points lumineux', 'Tableau, protections et circuits dédiés', 'Mise en service et contrôle'] },
    { slug: 'renovation', icon: 'wrench', title: 'Rénovation électrique', text: "Remplacement d'une installation ancienne ou dangereuse, en limitant la gêne si vous habitez les lieux.", points: ["Diagnostic de l'existant", 'Câbles et appareillage remplacés', 'Chantier propre'] },
    { slug: 'conformite', icon: 'shield', title: 'Mise aux normes', text: 'Mise à la terre, protections différentielles, remplacement des éléments vétustes : votre installation en sécurité.', points: ['Mise à la terre', 'Protections différentielles', 'Remplacement des éléments dangereux'] },
    { slug: 'tableau', icon: 'gauge', title: 'Tableau électrique', text: 'Remplacement ou extension de tableau, disjoncteurs, contacteurs, minuteries, télérupteurs.', points: ['Disjoncteurs et différentiels', 'Contacteurs, télérupteurs, minuteries', 'Repérage clair des circuits'] },
    { slug: 'eclairage', icon: 'bulb', title: 'Éclairage et blocs de secours', text: 'Spots LED, éclairage intérieur et extérieur, blocs autonomes de sécurité, détecteurs.', points: ['Spots et éclairage LED', 'Blocs autonomes de secours', 'Détecteurs de gaz et de présence'] },
    { slug: 'depannage', icon: 'bolt', title: 'Dépannage', text: 'Panne de courant, disjoncteur qui saute, prise défectueuse : recherche de panne et réparation.', points: ['Recherche de panne', "Remplacement d'appareillage", 'Rétablissement du courant'] },
    { slug: 'climatisation', icon: 'snow', title: 'Climatisation', text: 'Ligne dédiée et protégée pour chaque climatiseur, raccordement électrique des unités.', points: ['Ligne dédiée', 'Protection adaptée', 'Raccordement'] },
    { slug: 'pro', icon: 'building', title: 'Bâtiments et lots électricité', text: 'Commerces, bureaux, projets de promotion : chiffrage par devis quantitatif, attachements et suivi de chantier.', points: ['Devis quantitatif détaillé', 'Attachements des quantités réalisées', 'Suivi du chantier'] },
  ] satisfies { slug: string; icon: IconName; title: string; text: string; points: string[] }[],
  steps: [
    { title: 'Votre demande', text: 'Par téléphone, WhatsApp ou le formulaire de devis.' },
    { title: 'Visite et diagnostic', text: 'Nous étudions votre installation et vos besoins sur place.' },
    { title: 'Devis détaillé', text: 'Un devis clair, poste par poste, validé avant tout travail.' },
    { title: 'Travaux et mise en service', text: 'Chantier propre, contrôle final et explications à la livraison.' },
  ],
  faq: [
    { q: 'Où intervenez-vous ?', a: 'À Béjaïa, à Alger et dans leurs environs, pour les particuliers comme pour les professionnels.' },
    { q: 'Le devis est-il gratuit ?', a: 'Oui. Décrivez votre projet via le formulaire, par téléphone ou sur WhatsApp : nous vous remettons un devis détaillé, sans engagement.' },
    { q: 'Travaillez-vous pour les entreprises et les promoteurs ?', a: 'Oui : commerces, bureaux et lots électricité, avec devis quantitatif, attachements des quantités réalisées et factures.' },
    { q: 'Mon disjoncteur saute souvent, que faire ?', a: 'Débranchez les appareils du circuit concerné puis réarmez. Si le problème persiste, appelez-nous : une surcharge ou un défaut d’isolement peut être dangereux.' },
    { q: 'Comment se passe le règlement ?', a: 'Les modalités sont indiquées sur le devis. Règlement par chèque, virement ou espèces.' },
  ],
}

export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
export const waHref = (text = site.whatsappMessage) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`

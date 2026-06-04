"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";

type Coach = {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  slots: string[];
};

/**
 * Photo coach : fichier dans `public/` nommé comme le prenom + `.JPG`
 * Le prenom = premier mot du nom affiche (ex. "Yanel Martin" → `/Yanel.JPG`).
 * Pour un prenom compose, utilise un tiret : "Jean-Luc Dupont" → `/Jean-Luc.JPG`
 * (pas "Jean Luc" → ce serait `/Jean.JPG`).
 */
function srcPhotoCoach(nomComplet: string): string {
  const prenom = (nomComplet.trim().split(/\s+/)[0] ?? nomComplet.trim()).normalize("NFD");
  const sansAccents = prenom.replace(/[\u0300-\u036f]/g, "");
  const base = sansAccents.replace(/[^a-zA-Z0-9-]/g, "");
  return `/${base}.JPG`;
}

/** Photo espace club : fichier dans `public/` (nom exact, espaces et accents inclus). */
function srcPhotoClub(nomFichier: string): string {
  return `/${nomFichier.split("/").map(encodeURIComponent).join("/")}`;
}

const coachesData = [
  {
    id: 1,
    name: "Yanel",
    specialty: "HIIT et perte de poids",
    slots: ["Lun 08:00", "Mar 18:30", "Jeu 19:30"],
  },
  {
    id: 2,
    name: "Axel",
    specialty: "Force et conditioning",
    slots: ["Lun 17:00", "Mer 09:00", "Ven 18:00"],
  },
  {
    id: 3,
    name: "Shayan",
    specialty: "Mobilite et entrainement fonctionnel",
    slots: ["Mar 07:30", "Jeu 12:00", "Sam 10:00"],
  },
  {
    id: 4,
    name: "Jean-Luc",
    specialty: "Recomposition corporelle",
    slots: ["Lun 12:00", "Mer 19:00", "Sam 08:30"],
  },
  {
    id: 5,
    name: "Lola",
    specialty: "Performance cardio",
    slots: ["Mar 17:30", "Jeu 08:00", "Ven 19:00"],
  },
  {
    id: 6,
    name: "Abygaelle",
    specialty: "Core et mobilite",
    slots: ["Mar 09:00", "Jeu 18:00", "Sam 11:30"],
  },
];

const coaches: Coach[] = coachesData.map((c) => ({
  ...c,
  photo: srcPhotoCoach(c.name),
}));

const navItems = [
  { href: "#about", label: "Le club" },
  { href: "#coaches", label: "Coachs" },
  { href: "#planning", label: "Planning" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

const tarifsPlans: readonly {
  titre: string;
  prix: string;
  engagement: string;
  adhesion: string;
  inclus?: readonly string[];
}[] = [
  {
    titre: "Musculation & Cardio",
    prix: "39€/mois",
    engagement: "Engagement 12 mois",
    adhesion: "Frais d'adhésion 50€",
  },
  {
    titre: "Cours Collectifs",
    prix: "49€/mois",
    engagement: "Engagement 12 mois",
    adhesion: "Frais d'adhésion 50€",
  },
  {
    titre: "1 Coaching, Sauna, Boisson",
    inclus: ["+ Musculation & Cardio", "+ Cours Collectifs"],
    prix: "59€/mois",
    engagement: "Engagement 12 mois",
    adhesion: "Frais d'adhésion 40€",
  },
];

/** Liens pied de page : ordre de defilement du site (sections #id). */
const footerNavLinks = [
  { href: "#about", label: "Le club" },
  { href: "#coaches", label: "Coachs" },
  { href: "#planning", label: "Planning" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#gofit", label: "GoFit — seance offerte" },
  { href: "#inscription", label: "Inscription au club" },
  { href: "#avis", label: "Avis" },
  { href: "#contact", label: "Contact" },
];

const clubEspacePhotos: { src: string; alt: string }[] = [
  { src: srcPhotoClub("Espace 1.JPG"), alt: "Espace du club" },
  { src: srcPhotoClub("Espace  2.JPG"), alt: "Espace du club" },
  { src: srcPhotoClub("Machines Cardio.JPG"), alt: "Machines cardio" },
  { src: srcPhotoClub("Rameurs.JPG"), alt: "Rameurs" },
  { src: srcPhotoClub("Haltères.JPG"), alt: "Zone haltères" },
  { src: srcPhotoClub("Poids libre.JPG"), alt: "Poids libre" },
  { src: srcPhotoClub("Machines guidées.JPG"), alt: "Machines guidées" },
  { src: srcPhotoClub("Cours collectifs.JPG"), alt: "Salle cours collectifs" },
  { src: srcPhotoClub("RMP.JPG"), alt: "Espace RMP" },
];

/** Triple copie pour defilement infini (repositionnement sur la bande centrale). */
const clubEspacePhotosLoop: { src: string; alt: string }[] = [
  ...clubEspacePhotos,
  ...clubEspacePhotos,
  ...clubEspacePhotos,
];

const joursPlanning = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
/** Creneaux affiches : 9h-11h puis 17h-19h (trou 12h-16h non affiche) */
const heuresPlanning = ["09:00", "10:00", "11:00", "17:00", "18:00", "19:00"];

const coursPlanningNoms = [
  "Yoga",
  "RMP LesMills",
  "Step Inter",
  "Abdos Killer",
  "C.A.F",
  "Pilates",
  "BodyAttack",
  "BodyPump",
  "BodyBalance",
  "Fit'Dance",
  "BodySculpt",
  "Stretching",
  "BodyStep",
  "BodyCombat",
] as const;

const planningCours: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  let i = 0;
  for (const jour of joursPlanning) {
    for (const heure of heuresPlanning) {
      const cle = `${jour}-${heure}`;
      map[cle] = coursPlanningNoms[i % coursPlanningNoms.length];
      i += 1;
    }
  }
  return map;
})();

/** Creneaux GoFit : avril 2026 a partir du mercredi 15 (dimanche 19 non propose). */
const datesEssaiGoFit = [15, 16, 17, 18, 20, 21].map((jour) => new Date(2026, 3, jour));
const nomsJours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] as const;
const joursEssai = datesEssaiGoFit.map((d) => nomsJours[d.getDay()]);

function libelleColonneEssai(index: number) {
  const d = datesEssaiGoFit[index];
  return `${joursEssai[index].slice(0, 3)} ${d.getDate()}`;
}
/** Lignes horaires : 12h-13h avec "-" ; places offertes 9h-11h et 14h-19h */
const horairesEssai = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const creneauxPlacesOuvertes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const planningEssai: Record<string, string> = Object.fromEntries(
  joursEssai.flatMap((jour) =>
    creneauxPlacesOuvertes.map((heure) => [`${jour}-${heure}`, "Places ouvertes"] as const),
  ),
);

/** Short YouTube de la campagne GoFit */
const GOFIT_YOUTUBE_SHORT_ID = "iam5hTPiATo";

/** Fin affichee de la promo : jeudi 30 avril 2026, minuit (fin de journee, heure locale) */
const FIN_PROMO_SEANCES_OFFERTES = new Date(2026, 3, 30, 23, 59, 59, 999).getTime();

/** Mise en scene : compte a rebours fictif (~1 j 23 h), la date affichee reste le 30 avril. */
const PROMO_COMPTE_REBOURS_FICTIF = true;
const PROMO_FICTIF_DUREE_MS = (2 * 86400 - 10 * 60) * 1000; // un peu moins de 2 jours (-10 min)

let promoFictifDebutClient: number | null = null;

function msUntilFinPromo() {
  if (PROMO_COMPTE_REBOURS_FICTIF) {
    if (promoFictifDebutClient === null) promoFictifDebutClient = Date.now();
    return Math.max(0, PROMO_FICTIF_DUREE_MS - (Date.now() - promoFictifDebutClient));
  }
  return Math.max(0, FIN_PROMO_SEANCES_OFFERTES - Date.now());
}

function formatCompteRebours(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const j = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { j, h, m, s };
}

function CompteReboursPromoBlocs({ ms, variant }: { ms: number; variant: "bar" | "popup" }) {
  const { j, h, m, s } = formatCompteRebours(ms);
  const labels = ["j", "h", "m", "s"] as const;
  const valeurs = [j, h, m, s];
  const box =
    variant === "bar"
      ? "rounded border border-red-500/35 bg-black/40 px-2 py-1 font-mono text-lg font-bold tabular-nums text-white sm:px-2.5 sm:text-xl md:text-2xl"
      : "rounded border border-red-500/40 bg-black/50 px-2 py-1 font-mono text-xl font-bold tabular-nums text-white";
  const lab =
    variant === "bar"
      ? "pb-1 text-[9px] uppercase tracking-wide text-zinc-500"
      : "pb-1 text-[9px] uppercase tracking-wide text-zinc-400";
  const row =
    variant === "bar"
      ? "flex flex-wrap items-end justify-center gap-2 sm:gap-3 md:justify-end"
      : "mt-3 flex flex-wrap items-end justify-center gap-2";
  return (
    <div className={row} role="timer" aria-live="polite" aria-atomic="true">
      {valeurs.map((valeur, i) => (
        <div key={labels[i]} className="flex items-end gap-1.5">
          <span className={box}>{valeur}</span>
          <span className={lab}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/** Compte a rebours calcule cote client uniquement (evite l'erreur d'hydratation avec Date.now). */
function CompteReboursPromoClient({ variant }: { variant: "bar" | "popup" }) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(msUntilFinPromo());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const row =
    variant === "bar"
      ? "flex flex-wrap items-end justify-center gap-2 sm:gap-3 md:justify-end"
      : "mt-3 flex flex-wrap items-end justify-center gap-2";
  const box =
    variant === "bar"
      ? "rounded border border-red-500/35 bg-black/40 px-2 py-1 font-mono text-lg font-bold tabular-nums text-transparent sm:px-2.5 sm:text-xl md:text-2xl"
      : "rounded border border-red-500/40 bg-black/50 px-2 py-1 font-mono text-xl font-bold tabular-nums text-transparent";
  const lab =
    variant === "bar"
      ? "pb-1 text-[9px] uppercase tracking-wide text-transparent"
      : "pb-1 text-[9px] uppercase tracking-wide text-transparent";

  if (ms === null) {
    return (
      <div className={row} aria-hidden="true">
        {(["j", "h", "m", "s"] as const).map((label) => (
          <div key={label} className="flex items-end gap-1.5">
            <span className={box}>00</span>
            <span className={lab}>{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return <CompteReboursPromoBlocs ms={ms} variant={variant} />;
}

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 5.996 4.388 10.96 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
  },
];

type Testimonial = {
  name: string;
  quote: string;
  rating: string;
  date: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    quote: "Salle ultra propre, materiel haut de gamme et coachs tres pro. Je recommande.",
    rating: "5.0",
    date: "il y a 2 semaines",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Yacine B.",
    quote: "Excellent suivi. J'ai repris le sport sans douleur et avec de vrais resultats.",
    rating: "4.9",
    date: "il y a 1 mois",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Nadia L.",
    quote: "L'ambiance est premium, les cours sont bien structures et motivants.",
    rating: "5.0",
    date: "il y a 3 semaines",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Thomas R.",
    quote: "Espace kids au top, ma fille adore les seances le mercredi. Merci a toute l'equipe.",
    rating: "5.0",
    date: "il y a 5 jours",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Leila K.",
    quote: "Planning clair, pas d'attente aux machines le soir. Je viens 3 fois par semaine.",
    rating: "4.8",
    date: "il y a 2 mois",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Marc D.",
    quote: "Coaching personnalise au rendez-vous. J'ai gagne en confiance et en technique.",
    rating: "5.0",
    date: "il y a 1 semaine",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Emma P.",
    quote: "Douches propres, casiers securises et musique qui motive sans etre agressive.",
    rating: "4.9",
    date: "il y a 3 mois",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Julien C.",
    quote: "Premiere seance offerte geniale pour tester. Je me suis abonne le lendemain.",
    rating: "5.0",
    date: "il y a 4 jours",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Ines F.",
    quote: "Cours collectifs dynamiques, le coach explique bien les mouvements. Top.",
    rating: "4.9",
    date: "il y a 6 semaines",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Hugo V.",
    quote: "Ambiance conviviale sans chichi. On progresse serieusement tout en s'amusant.",
    rating: "5.0",
    date: "il y a 2 semaines",
    avatar:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80",
  },
];

function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="mb-2 text-sm uppercase tracking-[0.2em] text-red-400">{eyebrow}</p>
      <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
      <p className="mt-3 text-zinc-300">{subtitle}</p>
    </div>
  );
}

function MarqueGoFit({ size = "md" }: { size?: "bar" | "md" | "lg" | "hero" }) {
  const cls = {
    bar: "rounded-md border border-red-300/80 bg-gradient-to-br from-red-500 via-red-600 to-red-950 px-2.5 py-1 text-sm font-black tracking-tight text-white shadow-lg shadow-red-950/50 ring-1 ring-white/15 md:px-3 md:text-base",
    md: "rounded-lg border border-red-400/70 bg-gradient-to-br from-red-500 to-red-950 px-3 py-1.5 text-base font-black tracking-tight text-white shadow-md ring-1 ring-white/10",
    lg: "rounded-lg border border-red-400/80 bg-gradient-to-br from-red-500 to-zinc-900 px-3 py-2 text-lg font-black tracking-tight text-white shadow-lg ring-1 ring-red-300/30 md:text-xl",
    hero: "rounded-xl border-2 border-red-400/90 bg-gradient-to-br from-red-500 via-red-600 to-zinc-950 px-6 py-2.5 text-3xl font-black tracking-[0.08em] text-white shadow-2xl shadow-red-950/50 ring-2 ring-white/20 md:text-4xl",
  }[size];
  return <span className={`inline-block ${cls}`}>GoFit</span>;
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [activeCoach, setActiveCoach] = useState<Coach | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [booked, setBooked] = useState(false);
  const [selectedAccessSlot, setSelectedAccessSlot] = useState<string>("");
  const [leadSent, setLeadSent] = useState(false);
  const [clubLeadSent, setClubLeadSent] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [promoRestanteMs, setPromoRestanteMs] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [clubLightboxIndex, setClubLightboxIndex] = useState<number | null>(null);
  const coachesCarouselRef = useRef<HTMLDivElement | null>(null);
  const clubPhotosCarouselRef = useRef<HTMLDivElement | null>(null);
  const activeCarouselDragRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const clubLoopClampRef = useRef(false);
  const clubScrollIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Carrousel club : bande en 3 copies, repositionnement sans saut visible. */
  const normalizeClubCarouselLoop = useCallback(() => {
    const el = clubPhotosCarouselRef.current;
    if (!el || clubLoopClampRef.current) return;
    const segment = el.scrollWidth / 3;
    if (segment <= 0 || el.scrollWidth <= el.clientWidth + 1) return;
    const { scrollLeft } = el;
    if (scrollLeft < segment) {
      clubLoopClampRef.current = true;
      el.scrollLeft = scrollLeft + segment;
      clubLoopClampRef.current = false;
    } else if (scrollLeft >= segment * 2) {
      clubLoopClampRef.current = true;
      el.scrollLeft = scrollLeft - segment;
      clubLoopClampRef.current = false;
    }
  }, []);

  const beginDrag = (clientX: number, container: HTMLDivElement | null) => {
    if (!container) return;
    activeCarouselDragRef.current = container;
    isDraggingRef.current = true;
    startXRef.current = clientX;
    startScrollLeftRef.current = container.scrollLeft;
    container.classList.add("is-dragging");
  };

  const moveDrag = (clientX: number) => {
    const el = activeCarouselDragRef.current;
    if (!el || !isDraggingRef.current) return;
    const delta = clientX - startXRef.current;
    el.scrollLeft = startScrollLeftRef.current - delta;
  };

  const openClubPhotoLightbox = (loopIndex: number) => {
    setClubLightboxIndex(loopIndex % clubEspacePhotos.length);
  };

  /** Evite que le carrousel capture le pointeur et bloque le clic sur carte / photo. */
  const stopCarouselPointerBubble = (event: PointerEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const closeClubPhotoLightbox = () => setClubLightboxIndex(null);

  const stepClubLightbox = (delta: 1 | -1) => {
    setClubLightboxIndex((current) => {
      if (current === null) return null;
      return (current + delta + clubEspacePhotos.length) % clubEspacePhotos.length;
    });
  };

  const endDrag = () => {
    const el = activeCarouselDragRef.current;
    const wasClub = el === clubPhotosCarouselRef.current;
    if (el) el.classList.remove("is-dragging");
    isDraggingRef.current = false;
    activeCarouselDragRef.current = null;
    if (wasClub) normalizeClubCarouselLoop();
  };

  const onCarouselPointerDown = (event: PointerEvent<HTMLDivElement>, container: HTMLDivElement | null) => {
    if (event.pointerType !== "mouse" || !container) return;
    if ((event.target as HTMLElement).closest("button, a, [role='button']")) return;
    container.setPointerCapture(event.pointerId);
    beginDrag(event.clientX, container);
  };

  const onCarouselPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !isDraggingRef.current) return;
    moveDrag(event.clientX);
  };

  const onCarouselPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* capture deja relachee */
    }
    endDrag();
  };

  const scrollCoaches = (direction: "left" | "right") => {
    if (!coachesCarouselRef.current) return;
    const step = Math.round(coachesCarouselRef.current.clientWidth * 0.82);
    coachesCarouselRef.current.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const scrollClubPhotos = (direction: "left" | "right") => {
    if (!clubPhotosCarouselRef.current) return;
    const step = Math.round(clubPhotosCarouselRef.current.clientWidth * 0.75);
    clubPhotosCarouselRef.current.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const openCoachModal = (coach: Coach) => {
    if (activeCoach) return;
    setBooked(false);
    setSelectedSlot(coach.slots[0] ?? "");
    setActiveCoach(coach);
  };

  useEffect(() => {
    const tick = () => setPromoRestanteMs(msUntilFinPromo());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  /** Au rechargement (F5) : haut de page, sans ancre — évite la restauration de scroll du navigateur. */
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type !== "reload") return;
    window.history.scrollRestoration = "manual";
    if (window.location.hash) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, "", pathname + search);
    }
    window.scrollTo(0, 0);
  }, []);

  useLayoutEffect(() => {
    const el = clubPhotosCarouselRef.current;
    if (!el) return;

    const snapToMiddleSegment = () => {
      const segment = el.scrollWidth / 3;
      if (segment > 0 && el.scrollWidth > el.clientWidth + 1) {
        el.scrollLeft = segment;
      }
    };

    snapToMiddleSegment();
    const raf = requestAnimationFrame(snapToMiddleSegment);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (isDraggingRef.current) return;
            snapToMiddleSegment();
          })
        : null;
    ro?.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = clubPhotosCarouselRef.current;
    if (!el) return;

    const onScroll = () => {
      if (isDraggingRef.current || clubLoopClampRef.current) return;

      if (clubScrollIdleRef.current) clearTimeout(clubScrollIdleRef.current);
      clubScrollIdleRef.current = setTimeout(() => {
        normalizeClubCarouselLoop();
      }, 120);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (clubScrollIdleRef.current) clearTimeout(clubScrollIdleRef.current);
    };
  }, [normalizeClubCarouselLoop]);

  useEffect(() => {
    const carousel = coachesCarouselRef.current;
    if (!carousel) return;

    const centerMiddleCoach = () => {
      const middleIndex = Math.floor(coaches.length / 2);
      const middleCard = carousel.children.item(middleIndex) as HTMLElement | null;
      if (!middleCard) return;
      const targetLeft =
        middleCard.offsetLeft - carousel.clientWidth / 2 + middleCard.offsetWidth / 2;
      const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
      carousel.scrollTo({
        left: Math.max(0, Math.min(targetLeft, maxScroll)),
        top: 0,
        behavior: "auto",
      });
    };

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(centerMiddleCoach);
    });
    const t1 = window.setTimeout(centerMiddleCoach, 120);
    const t2 = window.setTimeout(centerMiddleCoach, 600);

    const ro = new ResizeObserver(() => centerMiddleCoach());
    ro.observe(carousel);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mobileNavOpen && clubLightboxIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen, clubLightboxIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (clubLightboxIndex !== null) {
        if (event.key === "Escape") {
          closeClubPhotoLightbox();
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          stepClubLightbox(-1);
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          stepClubLightbox(1);
          return;
        }
      }
      if (event.key !== "Escape") return;
      if (mobileNavOpen) {
        setMobileNavOpen(false);
        return;
      }
      if (showPromoPopup) {
        setShowPromoPopup(false);
        return;
      }
      if (activeCoach) {
        setActiveCoach(null);
        setBooked(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCoach, showPromoPopup, mobileNavOpen, clubLightboxIndex]);

  useEffect(() => {
    const firstPopup = window.setTimeout(() => setShowPromoPopup(true), 12000);
    const recurringPopup = window.setInterval(() => setShowPromoPopup(true), 45000);
    return () => {
      window.clearTimeout(firstPopup);
      window.clearInterval(recurringPopup);
    };
  }, []);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
        <nav
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3.5 md:px-8"
          aria-label="Navigation principale"
        >
          <a
            href="#hero"
            onClick={closeMobileNav}
            className="min-w-0 shrink truncate text-sm font-extrabold tracking-wide text-white sm:text-base md:text-lg"
          >
            Fitness Club & Kids
          </a>
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-7 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#inscription"
              className="hidden rounded-md border border-red-500 bg-red-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-500 sm:inline-flex"
            >
              S&apos;inscrire
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-zinc-900/80 text-zinc-100 transition hover:border-red-400 hover:text-white md:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileNavOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Fermer le menu"
                className="fixed inset-0 z-[60] bg-black/75 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeMobileNav}
              />
              <motion.div
                id="mobile-nav-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navigation mobile"
                className="fixed inset-y-0 right-0 z-[61] flex h-dvh max-h-dvh w-[min(88vw,20rem)] min-h-0 flex-col border-l border-white/10 bg-zinc-950 shadow-2xl shadow-black/60 md:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
                  <span className="text-sm font-extrabold tracking-wide text-white">Menu</span>
                  <button
                    type="button"
                    onClick={closeMobileNav}
                    aria-label="Fermer le menu"
                    className="flex h-9 w-9 items-center justify-center rounded border border-white/20 text-zinc-200 transition hover:border-red-400 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <nav
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1"
                  aria-label="Onglets de navigation"
                >
                  <ul className="flex flex-col">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={closeMobileNav}
                          className="block border-b border-white/10 px-5 py-4 text-base font-semibold text-white transition hover:bg-red-500/15 active:bg-red-500/25"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="shrink-0 border-t border-white/10 bg-zinc-950 p-4">
                  <a
                    href="#inscription"
                    onClick={closeMobileNav}
                    className="flex w-full items-center justify-center rounded-md border border-red-500 bg-red-600 px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-500"
                  >
                    S&apos;inscrire
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <main>
        <div className="flex min-h-[calc(100dvh-3.75rem)] flex-col">
          <section
            aria-label="Compte a rebours offre GoFit"
            className="relative sticky top-[3.75rem] z-40 shrink-0 overflow-hidden border-b border-red-600/25 bg-gradient-to-r from-red-950/95 via-zinc-950 to-red-950/95 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            {!reduceMotion && (
              <>
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-red-600/25 via-transparent to-red-600/25"
                  animate={{ opacity: [0.12, 0.38, 0.12] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(96deg, transparent 0%, transparent 38%, rgba(255,255,255,0.24) 50%, transparent 62%, transparent 100%)",
                    backgroundSize: "320% 100%",
                    backgroundRepeat: "no-repeat",
                  }}
                  animate={{ backgroundPosition: ["120% 50%", "-120% 50%"] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "linear", repeatDelay: 0.35 }}
                />
              </>
            )}
            {promoRestanteMs === null || promoRestanteMs > 0 ? (
              <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8 md:py-3.5">
                <div className="min-w-0 text-center md:max-w-md md:text-left">
                  <p className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-red-400 md:justify-start md:text-[11px]">
                    <MarqueGoFit size="bar" />
                    {!reduceMotion && (
                      <motion.span
                        aria-hidden
                        className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]"
                        animate={{ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
                        transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                    <span className="normal-case tracking-normal text-zinc-200">Seance offerte</span>
                    {reduceMotion ? (
                      <span className="ml-0 rounded border border-red-400/40 bg-red-950/50 px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-red-200 md:ml-1">
                        Temps limite
                      </span>
                    ) : (
                      <motion.span
                        className="ml-0 rounded border border-red-400/40 bg-red-950/50 px-2 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-red-200 md:ml-1"
                        animate={{ opacity: [0.75, 1, 0.75], borderColor: ["rgba(248,113,113,0.25)", "rgba(252,165,165,0.65)", "rgba(248,113,113,0.25)"] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Temps limite
                      </motion.span>
                    )}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-zinc-300 md:text-sm">
                    Avec <strong className="font-semibold text-white">GoFit</strong>, acces salle offert — fin le{" "}
                    <span className="whitespace-nowrap font-semibold text-white">30 avril 2026</span>{" "}
                    minuit.
                  </p>
                </div>
                <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-3 md:justify-end">
                  <CompteReboursPromoClient variant="bar" />
                </div>
                <div className="flex justify-center md:shrink-0 md:justify-end">
                  {reduceMotion ? (
                    <a
                      href="#gofit"
                      className="inline-flex items-center justify-center rounded border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-red-400/50 hover:bg-red-500/15 md:text-sm"
                    >
                      Choisir mon creneau GoFit
                    </a>
                  ) : (
                    <motion.a
                      href="#gofit"
                      className="inline-flex items-center justify-center rounded border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-red-400/50 hover:bg-red-500/15 md:text-sm"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(248, 113, 113, 0)",
                          "0 0 18px 1px rgba(248, 113, 113, 0.45)",
                          "0 0 0 0 rgba(248, 113, 113, 0)",
                        ],
                        borderColor: [
                          "rgba(255, 255, 255, 0.2)",
                          "rgba(252, 165, 165, 0.75)",
                          "rgba(255, 255, 255, 0.2)",
                        ],
                      }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Choisir mon creneau GoFit
                    </motion.a>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative z-10 px-4 py-3 text-center text-xs text-zinc-400 md:text-sm">
                La promotion GoFit est terminee.
              </div>
            )}
          </section>

          <section
            id="hero"
            className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 md:px-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.28),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(127,29,29,0.35),transparent_35%),linear-gradient(135deg,#030303_8%,#0a0a0a_40%,#160809_100%)]" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto max-w-4xl text-center"
            >
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-zinc-500">Club fitness — Castres</p>
              <h1 className="text-4xl font-black leading-[1.08] text-white sm:text-5xl md:text-7xl">Fitness Club & Kids</h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
                Club accueillant, coachs passionnes et cours collectifs pour progresser dans un cadre motivant.
              </p>
              <a
                href="#inscription"
                className="mt-8 inline-flex items-center justify-center rounded-md border border-red-500 bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-500"
              >
                S&apos;inscrire
              </a>
            </motion.div>
          </section>
        </div>

        <section id="about" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Le club"
            title="Le club en images"
            subtitle="Photos des espaces : musculation, cardio et cours collectifs. Ambiance familiale, avec une equipe disponible pour t'aider quand tu en as besoin."
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => scrollClubPhotos("left")}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/60 text-sm text-zinc-100 backdrop-blur transition hover:border-red-400 hover:text-red-300"
              aria-label="Photo precedente"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => scrollClubPhotos("right")}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/25 bg-black text-sm text-zinc-100 backdrop-blur transition hover:border-red-400 hover:text-red-300"
              aria-label="Photo suivante"
            >
              &gt;
            </button>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent md:w-20" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-zinc-950 via-zinc-950/85 to-transparent md:w-20" />

            <div
              ref={clubPhotosCarouselRef}
              onPointerDown={(event) => onCarouselPointerDown(event, clubPhotosCarouselRef.current)}
              onPointerMove={onCarouselPointerMove}
              onPointerUp={onCarouselPointerEnd}
              onPointerCancel={onCarouselPointerEnd}
              className="carousel-horizontal carousel-horizontal--grab flex snap-x snap-mandatory gap-4 overflow-x-auto px-12 pb-3 pt-1 select-none [scrollbar-width:none] scroll-px-12 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:gap-6 md:px-14 md:scroll-px-14 [&::-webkit-scrollbar]:hidden"
            >
              {clubEspacePhotosLoop.map((photo, index) => (
                <motion.button
                  key={`${photo.src}-${index}`}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: (index % clubEspacePhotos.length) * 0.05 }}
                  onPointerDown={stopCarouselPointerBubble}
                  onClick={() => openClubPhotoLightbox(index)}
                  className="min-w-[82%] shrink-0 cursor-pointer snap-center text-left transition hover:opacity-95 md:min-w-[48%] lg:min-w-[38%]"
                  aria-label={`Agrandir : ${photo.alt}`}
                >
                  <div className="relative h-56 w-full overflow-hidden border border-white/10 shadow-xl shadow-black/50 md:h-72">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 82vw, (max-width: 1024px) 48vw, 38vw"
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                  <span className="mt-2 block text-center text-xs text-zinc-500 md:text-left">{photo.alt}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="coaches" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Coachs"
            title="L&apos;equipe qui t&apos;accompagne"
            subtitle="Decouvre chaque coach et ses specialites. Ouvre une fiche pour voir les creneaux et reserver en ligne. Tu peux aussi nous appeler ou passer a l'accueil si tu preferes."
          />
          <div className="relative">
            <button
              onClick={() => scrollCoaches("left")}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/60 text-sm text-zinc-100 backdrop-blur transition hover:border-red-400 hover:text-red-300"
              aria-label="Defiler a gauche"
            >
              &lt;
            </button>
            <button
              onClick={() => scrollCoaches("right")}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/25 bg-black text-sm text-zinc-100 backdrop-blur transition hover:border-red-400 hover:text-red-300"
              aria-label="Defiler a droite"
            >
              &gt;
            </button>

            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent"
            />

            <div
              ref={coachesCarouselRef}
              onPointerDown={(event) => onCarouselPointerDown(event, coachesCarouselRef.current)}
              onPointerMove={onCarouselPointerMove}
              onPointerUp={onCarouselPointerEnd}
              onPointerCancel={onCarouselPointerEnd}
              className="carousel-horizontal carousel-horizontal--grab flex snap-x snap-mandatory gap-6 overflow-x-auto px-14 pb-4 select-none [scrollbar-width:none] scroll-px-14 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [&::-webkit-scrollbar]:hidden"
            >
            {coaches.map((coach, index) => (
                <motion.button
                  key={coach.id}
                  type="button"
                  onPointerDown={stopCarouselPointerBubble}
                  onClick={() => openCoachModal(coach)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="h-[520px] min-w-[78%] cursor-pointer snap-center text-left md:min-w-[42%] xl:min-w-[29%]"
                >
                  <div className="relative flex h-full w-full flex-col overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl shadow-black/60 [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)]">
                    <div className="relative h-[380px] w-full shrink-0 cursor-pointer">
                      <Image
                        src={coach.photo}
                        alt={coach.name}
                        fill
                        sizes="(max-width: 768px) 78vw, (max-width: 1280px) 42vw, 29vw"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-2xl font-bold text-white">{coach.name}</h3>
                      <p className="mt-2 text-red-400">{coach.specialty}</p>
                    </div>
                  </div>
                </motion.button>
            ))}
            </div>
          </div>

        </section>

        <section id="planning" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Cours collectifs"
            title="Planning hebdomadaire"
            subtitle="Planning des cours collectifs en vigueur a la salle (semaine type, sous reserve de changements ponctuels)."
          />
          <div className="overflow-x-auto border border-white/10">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[120px_repeat(6,minmax(0,1fr))] border-b border-white/10 bg-red-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-red-300">
                <span>Heure</span>
                {joursPlanning.map((jour) => (
                  <span key={jour}>{jour}</span>
                ))}
              </div>
              {heuresPlanning.map((heure, rowIndex) => (
                <motion.div
                  key={heure}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: rowIndex * 0.04 }}
                  className="grid grid-cols-[120px_repeat(6,minmax(0,1fr))] border-b border-white/10 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-200 last:border-none"
                >
                  <span className="font-semibold text-red-300">{heure}</span>
                  {joursPlanning.map((jour) => {
                    const cle = `${jour}-${heure}`;
                    return (
                      <span key={cle} className="pr-2 text-zinc-300">
                        {planningCours[cle] ?? "-"}
                      </span>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="tarifs" className="scroll-mt-24 border-y border-white/10 bg-zinc-950 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <SectionTitle
              eyebrow="Abonnements"
              title="Tarifs"
              subtitle="Formules indicatives avec engagement 12 mois et frais d'adhésion."
            />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {tarifsPlans.map((plan) => (
                <article
                  key={plan.titre}
                  className="flex flex-col border border-white/12 bg-zinc-900/60 p-6 shadow-lg shadow-black/40 md:p-8"
                >
                  <h3 className="text-lg font-bold leading-snug text-white md:text-xl">{plan.titre}</h3>
                  {plan.inclus?.map((ligne) => (
                    <p key={ligne} className="mt-2 text-sm font-semibold text-red-300/95">
                      {ligne}
                    </p>
                  ))}
                  <p className="mt-5 text-3xl font-black text-red-400 md:text-4xl">{plan.prix}</p>
                  <p className="mt-3 text-sm text-zinc-400">{plan.engagement}</p>
                  <p className="mt-2 text-sm text-zinc-300">{plan.adhesion}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gofit" className="scroll-mt-24 border-y border-red-500/15 bg-gradient-to-b from-red-950/20 via-zinc-950 to-zinc-950 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-400">Offre promotionnelle</p>
              <div className="mt-5 flex flex-col items-center gap-3">
                <MarqueGoFit size="hero" />
                <h2 className="text-2xl font-bold leading-snug text-white md:text-3xl">
                  Seance offerte — acces salle sans engagement
                </h2>
              </div>
              <p className="mx-auto mt-4 max-w-2xl text-zinc-300">
                <strong className="text-white">GoFit</strong>, c&apos;est notre facon de te faire decouvrir le club : choisis un creneau, envoie ta demande.
                Pas d&apos;adhesion, pas d&apos;abonnement, ce n&apos;est{" "}
                <span className="font-medium text-white">pas</span> une inscription au club.
              </p>
            </div>

            <div className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 items-stretch gap-6 px-2 sm:max-w-5xl sm:grid-cols-2 sm:gap-8">
              <figure className="flex min-w-0 flex-col">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border-2 border-red-500/45 bg-black shadow-2xl shadow-red-950/40 ring-1 ring-white/10">
                  <Image
                    src="/GoFit.png"
                    alt="Affiche GoFit : 1 seance offerte du 15 au 30 avril 2026 — Fitness Club and Kids, Castres"
                    width={1024}
                    height={1536}
                    sizes="(max-width: 640px) 90vw, 45vw"
                    className="h-full w-full object-contain object-center"
                    priority
                  />
                </div>
                <figcaption className="mt-3 text-center text-xs text-zinc-500 sm:text-left">
                  Affiche officielle GoFit — du 15 au 30 avril 2026
                </figcaption>
              </figure>

              <figure className="flex min-w-0 flex-col">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border-2 border-red-500/45 bg-black shadow-2xl shadow-red-950/40 ring-1 ring-white/10">
                  <iframe
                    src={`https://www.youtube.com/embed/${GOFIT_YOUTUBE_SHORT_ID}`}
                    title="Video GoFit — Fitness Club and Kids"
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                <figcaption className="mt-3 text-center text-xs text-zinc-500 sm:text-left">
                  <a
                    href={`https://youtube.com/shorts/${GOFIT_YOUTUBE_SHORT_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400/90 transition hover:text-red-300"
                  >
                    Voir le short sur YouTube
                  </a>
                </figcaption>
              </figure>
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-zinc-500">
              Les dates et conditions detaillees de l&apos;operation sont aussi rappellees ci-dessous.
            </p>

            <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
              <div className="min-w-0 flex-1">
                <p className="mb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Etape 1 — Creneau GoFit
                </p>
                <div className="w-full overflow-x-auto rounded-lg border border-white/10 bg-zinc-900/50 shadow-lg shadow-black/30">
                  <div className="min-w-[640px] md:min-w-0">
                    <div className="grid grid-cols-[100px_repeat(6,minmax(0,1fr))] border-b border-white/10 bg-red-500/10 px-3 py-3 text-[11px] font-semibold leading-tight tracking-wide text-red-300 sm:px-4 sm:text-xs">
                      <span className="uppercase">Heure</span>
                      {joursEssai.map((jour, index) => (
                        <span key={jour} className="text-center font-semibold normal-case sm:text-left">
                          {libelleColonneEssai(index)}
                        </span>
                      ))}
                    </div>
                    {horairesEssai.map((heure) => (
                      <div
                        key={heure}
                        className="grid grid-cols-[100px_repeat(6,minmax(0,1fr))] border-b border-white/10 bg-zinc-900/70 px-3 py-2.5 text-[11px] text-zinc-200 last:border-none sm:px-4 sm:py-3 sm:text-xs"
                      >
                        <span className="font-semibold text-red-300">{heure}</span>
                        {joursEssai.map((jour) => {
                          const key = `${jour}-${heure}`;
                          const disponible = Boolean(planningEssai[key]);
                          const selected = selectedAccessSlot === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                if (!disponible) return;
                                setSelectedAccessSlot(key);
                                setLeadSent(false);
                              }}
                              className={`min-h-[2rem] text-center transition sm:text-left ${
                                !disponible
                                  ? "cursor-not-allowed text-zinc-600"
                                  : selected
                                    ? "font-medium text-white underline decoration-red-400 decoration-2"
                                    : "text-zinc-300 hover:text-white"
                              }`}
                            >
                              {disponible ? planningEssai[key] : "-"}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full shrink-0 lg:max-w-md">
                <p className="mb-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Etape 2 — Coordonnees GoFit
                </p>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setLeadSent(true);
                  }}
                  className="rounded-lg border border-red-500/35 bg-zinc-950/80 p-6 shadow-xl shadow-black/40 md:p-8"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Demande GoFit</p>
                  <p className="mt-1 text-xs text-zinc-500">Nous te recontactons pour confirmer le creneau.</p>
                  <div className="mt-5 space-y-4">
                    <input required placeholder="Nom complet" className="w-full rounded border border-white/20 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-400" />
                    <input required type="tel" placeholder="Telephone" className="w-full rounded border border-white/20 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-400" />
                    <input required type="email" placeholder="Email" className="w-full rounded border border-white/20 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-400" />
                    <input
                      value={selectedAccessSlot ? selectedAccessSlot.replace("-", " • ") : ""}
                      readOnly
                      placeholder="Selectionne d'abord un creneau ci-contre"
                      className="w-full rounded border border-white/20 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!selectedAccessSlot}
                    className="mt-6 w-full rounded-md border border-red-400 bg-red-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Envoyer ma demande GoFit
                  </button>
                  {leadSent && (
                    <p className="mt-4 rounded border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-300">
                      Merci. Ta demande <strong className="text-emerald-200">GoFit</strong> est enregistree pour le creneau{" "}
                      {selectedAccessSlot.replace("-", " • ")}.
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        <section id="inscription" className="scroll-mt-24 border-b border-white/10 bg-zinc-950 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl">Inscription au club</h2>
              <p className="mx-auto mt-4 text-zinc-300">
                Pour une adhesion, une carte ou un abonnement classique : envoie-nous ta demande. Ce formulaire ne concerne pas l&apos;offre{" "}
                <strong className="text-zinc-200">GoFit</strong> (seance offerte).
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                setClubLeadSent(true);
              }}
              className="mx-auto mt-10 max-w-xl rounded-lg border border-white/15 bg-zinc-900/50 p-6 md:p-8"
            >
              <div className="space-y-4">
                <input required placeholder="Nom complet" className="w-full rounded border border-white/20 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-400" />
                <input required type="tel" placeholder="Telephone" className="w-full rounded border border-white/20 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-400" />
                <input required type="email" placeholder="Email" className="w-full rounded border border-white/20 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-400" />
                <textarea
                  required
                  rows={4}
                  placeholder="Formule souhaitee, objectifs, message libre..."
                  className="w-full resize-y rounded border border-white/20 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-zinc-400"
                />
              </div>
              <button
                type="submit"
                className="mt-6 w-full rounded-md border border-white/25 bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-zinc-950 transition hover:bg-zinc-200"
              >
                Envoyer ma demande d&apos;inscription
              </button>
              {clubLeadSent && (
                <p className="mt-4 rounded border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-300">
                  Merci. Ta demande d&apos;inscription au club a bien ete envoyee.
                </p>
              )}
            </form>
          </div>
        </section>

        <section id="avis" className="w-full py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <SectionTitle
              eyebrow="Avis"
              title="Ce que disent nos adherents"
              subtitle="Retours d'experience de notre communaute."
            />
          </div>
          <div className="marquee-avis-outer relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="marquee-avis-track">
              {[...testimonials, ...testimonials].map((item, index) => (
                <blockquote
                  key={`${item.name}-${index}`}
                  className="flex h-full w-[min(100vw-2rem,340px)] shrink-0 flex-col border border-white/10 bg-zinc-900 p-6 shadow-lg"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-white/20">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-zinc-400">
                        {item.rating} ★
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 text-xs text-zinc-500">{item.date}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-200">&quot;{item.quote}&quot;</p>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Contact"
            title="Retrouve-nous au Fitness Club & Kids"
            subtitle="Passe a la salle ou contacte-nous directement."
          />
          <div className="items-stretch grid gap-8 md:grid-cols-2">
            <div className="border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm">
              <p className="mb-3 text-zinc-200">
                <span className="font-semibold text-white">Adresse : </span> 24 Av. d&apos;Hauterive, 81100 Castres
              </p>
              <p className="mb-3 text-zinc-200">
                <span className="font-semibold text-white">Telephone :</span> 05 81 43 64 61
              </p>
              <p className="mb-2 text-zinc-200">
                <span className="font-semibold text-white">Horaires :</span>
              </p>
              <ul className="space-y-1 text-sm text-zinc-300">
                <li>Lundi : 06:00-23:00</li>
                <li>Mardi : 06:00-23:00</li>
                <li>Mercredi : 06:00-23:00</li>
                <li>Jeudi : 06:00-23:00</li>
                <li>Vendredi : 06:00-23:00</li>
                <li>Samedi : 06:00-23:00</li>
                <li>Dimanche : 06:00-23:00</li>
              </ul>
              <p className="mt-3 text-zinc-200">
                <span className="font-semibold text-white">Email :</span> fitnessclubandkids81@gmail.com
              </p>
            </div>
            <iframe
              title="Localisation Fitness Club and Kids"
              src="https://maps.google.com/maps?q=24%20Av.%20d%27Hauterive%2C%2081100%20Castres&t=&z=14&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              className="h-full min-h-[360px] w-full border border-white/10"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-red-500/20 bg-black/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-8">
          <div>
            <p className="text-lg font-extrabold tracking-wide text-white">Fitness Club & Kids</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Reseaux sociaux</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center border border-white/20 bg-zinc-900 text-zinc-200 transition hover:border-red-400 hover:text-red-400"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Navigation</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              {footerNavLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition hover:text-red-400">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Contact</p>
            <p className="mt-4 text-sm text-zinc-300">24 Av. d&apos;Hauterive, 81100 Castres</p>
            <p className="mt-2 text-sm text-zinc-300">05 81 43 64 61</p>
            <a
              href="mailto:fitnessclubandkids81@gmail.com"
              className="mt-2 inline-block text-sm text-red-400 transition hover:text-red-300"
            >
              fitnessclubandkids81@gmail.com
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Fitness Club & Kids. Tous droits reserves.
        </div>
      </footer>

      <AnimatePresence>
        {clubLightboxIndex !== null && (
          <motion.div
            key="club-lightbox-shell"
            role="presentation"
            className="fixed inset-0 z-[75] flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeClubPhotoLightbox}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="club-lightbox-title"
              className="relative flex w-full max-w-5xl flex-col"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeClubPhotoLightbox}
                aria-label="Fermer la galerie"
                className="absolute right-0 top-0 z-20 border border-white/25 bg-zinc-950/95 px-3 py-1.5 text-xl leading-none text-zinc-200 transition hover:border-red-400 hover:text-white sm:-right-2 sm:-top-2"
              >
                ×
              </button>

              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                {clubLightboxIndex + 1} / {clubEspacePhotos.length}
              </p>

              <div className="relative flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => stepClubLightbox(-1)}
                  aria-label="Photo precedente"
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-black/60 text-lg text-zinc-100 backdrop-blur transition hover:border-red-400 hover:text-red-300 sm:h-11 sm:w-11"
                >
                  &lt;
                </button>

                <div className="relative min-h-[min(55vh,520px)] flex-1 overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl shadow-black/60">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={clubLightboxIndex}
                      className="relative h-[min(55vh,520px)] w-full"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.22 }}
                    >
                      <Image
                        src={clubEspacePhotos[clubLightboxIndex].src}
                        alt={clubEspacePhotos[clubLightboxIndex].alt}
                        fill
                        sizes="(max-width: 768px) 92vw, 80vw"
                        className="object-contain"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => stepClubLightbox(1)}
                  aria-label="Photo suivante"
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-black/60 text-lg text-zinc-100 backdrop-blur transition hover:border-red-400 hover:text-red-300 sm:h-11 sm:w-11"
                >
                  &gt;
                </button>
              </div>

              <p id="club-lightbox-title" className="mt-4 text-center text-sm text-zinc-300">
                {clubEspacePhotos[clubLightboxIndex].alt}
              </p>

              <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
                {clubEspacePhotos.map((thumb, thumbIndex) => (
                  <button
                    key={thumb.src}
                    type="button"
                    onClick={() => setClubLightboxIndex(thumbIndex)}
                    aria-label={thumb.alt}
                    aria-current={thumbIndex === clubLightboxIndex}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden border-2 transition sm:h-16 sm:w-24 ${
                      thumbIndex === clubLightboxIndex
                        ? "border-red-500 ring-2 ring-red-500/40"
                        : "border-white/20 opacity-70 hover:border-red-400/60 hover:opacity-100"
                    }`}
                  >
                    <Image src={thumb.src} alt="" fill sizes="96px" className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCoach && (
          <motion.div
            key="coach-modal-shell"
            role="presentation"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setActiveCoach(null);
              setBooked(false);
            }}
          >
            <motion.div
              key={activeCoach.id}
              role="dialog"
              aria-modal="true"
              aria-labelledby="coach-modal-title"
              className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-red-500/40 bg-zinc-950 shadow-2xl shadow-black/60"
              initial={{ opacity: 0, y: 44, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.85 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveCoach(null);
                  setBooked(false);
                }}
                aria-label="Fermer"
                className="absolute right-3 top-3 z-10 border border-white/25 bg-zinc-950/95 px-3 py-1.5 text-xl leading-none text-zinc-200 transition hover:border-red-400 hover:text-white"
              >
                ×
              </button>

              <div className="flex flex-col gap-8 p-6 md:flex-row md:items-start md:gap-10 md:p-10">
                <motion.div
                  className="flex w-full shrink-0 justify-center md:w-auto md:pt-2"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 260, damping: 22 }}
                >
                  <div className="relative mx-auto aspect-[3/4] w-[min(240px,82vw)] max-h-[min(68vh,540px)] overflow-hidden rounded-lg border-2 border-red-500/45 bg-zinc-900 shadow-2xl shadow-black/50 md:mx-0 md:w-56">
                    <Image
                      src={activeCoach.photo}
                      alt={activeCoach.name}
                      fill
                      sizes="(max-width: 768px) 82vw, 224px"
                      className="object-cover object-top"
                    />
                  </div>
                </motion.div>
                <motion.div
                  className="min-w-0 flex-1 text-center md:pt-2 md:text-left"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.09, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 id="coach-modal-title" className="text-3xl font-bold text-white">
                    {activeCoach.name}
                  </h3>
                  <p className="mt-2 text-zinc-300">{activeCoach.specialty}</p>
                  <p className="mt-8 text-sm uppercase tracking-[0.2em] text-red-400">Creneaux disponibles</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {activeCoach.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setBooked(false);
                        }}
                        className={`border px-3 py-2 text-sm transition ${
                          selectedSlot === slot
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-white/20 bg-zinc-900 text-zinc-200 hover:border-red-400"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setBooked(true)}
                    disabled={!selectedSlot}
                    className="mt-6 border border-red-300 bg-red-500 px-6 py-3 font-bold uppercase tracking-wide text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Confirmer le creneau
                  </button>
                  {booked && selectedSlot && (
                    <p className="mt-4 border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-300">
                      Reservation confirmee avec {activeCoach.name} pour {selectedSlot}.
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPromoPopup && (
          <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/45 p-4 md:p-6">
            <motion.div
              key="promo-popup"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="relative w-full max-w-sm border border-red-500/40 bg-zinc-950 p-5 shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <MarqueGoFit size="md" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Offre limitee</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPromoPopup(false)}
                  aria-label="Fermer"
                  className="shrink-0 border border-white/25 bg-zinc-950 px-3 py-1.5 text-xl leading-none text-zinc-200 transition hover:border-red-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <h4 className="mt-3 text-xl font-bold text-white">GoFit — seance offerte</h4>
              {promoRestanteMs === null || promoRestanteMs > 0 ? (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    L&apos;operation <strong className="text-white">GoFit</strong> (acces salle offert) se termine le{" "}
                    <span className="whitespace-nowrap font-semibold text-white">30 avril 2026</span>{" "}
                    minuit. Temps restant :
                  </p>
                  <CompteReboursPromoClient variant="popup" />
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">La promotion GoFit est terminee.</p>
              )}
              <a
                href="#gofit"
                onClick={() => setShowPromoPopup(false)}
                className="mt-5 block w-full rounded-md border border-red-400 bg-red-600 px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-500"
              >
                Decouvrir GoFit
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

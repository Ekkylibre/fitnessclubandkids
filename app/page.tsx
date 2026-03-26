"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Coach = {
  id: number;
  name: string;
  specialty: string;
  photo: string;
  slots: string[];
};

const navItems = [
  { href: "#about", label: "Le club" },
  { href: "#coaches", label: "Coachs" },
  { href: "#services", label: "Services" },
  { href: "#offre", label: "Seance offerte" },
  { href: "#avis", label: "Avis Google" },
  { href: "#contact", label: "Contact" },
];

const coaches: Coach[] = [
  {
    id: 1,
    name: "Sofia Martinez",
    specialty: "HIIT et perte de poids",
    photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=900&q=80",
    slots: ["Lun 08:00", "Mar 18:30", "Jeu 19:30"],
  },
  {
    id: 2,
    name: "David Laurent",
    specialty: "Force et conditioning",
    photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
    slots: ["Lun 17:00", "Mer 09:00", "Ven 18:00"],
  },
  {
    id: 3,
    name: "Amina Rossi",
    specialty: "Mobilite et entrainement fonctionnel",
    photo: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=900&q=80",
    slots: ["Mar 07:30", "Jeu 12:00", "Sam 10:00"],
  },
  {
    id: 4,
    name: "Lucas Bernard",
    specialty: "Recomposition corporelle",
    photo: "https://images.unsplash.com/photo-1567013127542-490d757e6349?auto=format&fit=crop&w=900&q=80",
    slots: ["Lun 12:00", "Mer 19:00", "Sam 08:30"],
  },
  {
    id: 5,
    name: "Nora Kim",
    specialty: "Performance cardio",
    photo: "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?auto=format&fit=crop&w=900&q=80",
    slots: ["Mar 17:30", "Jeu 08:00", "Ven 19:00"],
  },
  {
    id: 6,
    name: "Marco Silva",
    specialty: "Powerlifting",
    photo: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=900&q=80",
    slots: ["Lun 19:30", "Mer 07:00", "Ven 12:30"],
  },
  {
    id: 7,
    name: "Chloe Moreau",
    specialty: "Core et mobilite",
    photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    slots: ["Mar 09:00", "Jeu 18:00", "Sam 11:30"],
  },
];

const joursPlanning = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const heuresPlanning = ["07:00", "09:00", "12:15", "17:30", "18:30", "19:15"];
const planningCours: Record<string, string> = {
  "Lundi-07:00": "HIIT Express • Sofia",
  "Lundi-18:30": "Renforcement total body • David",
  "Mardi-12:15": "Circuit Cardio • Nora",
  "Mardi-19:15": "Core et Mobilite • Chloe",
  "Mercredi-18:30": "Bootcamp • Marco",
  "Jeudi-19:15": "Cuisses Abdos Fessiers • Amina",
  "Vendredi-17:30": "Power Strength • Lucas",
  "Samedi-09:00": "Conditioning Team • David",
  "Samedi-12:15": "Stretch et Recovery • Amina",
};

const joursEssai = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const horairesEssai = ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];
const planningEssai: Record<string, string> = {
  "Lundi-06:00": "Places ouvertes",
  "Lundi-18:00": "Places ouvertes",
  "Mardi-09:00": "Places ouvertes",
  "Mardi-15:00": "Places ouvertes",
  "Mercredi-12:00": "Places ouvertes",
  "Jeudi-09:00": "Places ouvertes",
  "Jeudi-21:00": "Places ouvertes",
  "Vendredi-15:00": "Places ouvertes",
  "Samedi-12:00": "Places ouvertes",
  "Samedi-18:00": "Places ouvertes",
  "Dimanche-09:00": "Places ouvertes",
  "Dimanche-15:00": "Places ouvertes",
};

const testimonials = [
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

export default function Home() {
  const [activeCoach, setActiveCoach] = useState<Coach | null>(null);
  const [flippingCoachId, setFlippingCoachId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [booked, setBooked] = useState(false);
  const [selectedAccessSlot, setSelectedAccessSlot] = useState<string>("");
  const [leadSent, setLeadSent] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const coachesCarouselRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  const beginDrag = (clientX: number) => {
    if (!coachesCarouselRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = clientX;
    startScrollLeftRef.current = coachesCarouselRef.current.scrollLeft;
  };

  const moveDrag = (clientX: number) => {
    if (!coachesCarouselRef.current || !isDraggingRef.current) return;
    const delta = clientX - startXRef.current;
    coachesCarouselRef.current.scrollLeft = startScrollLeftRef.current - delta;
  };

  const endDrag = () => {
    isDraggingRef.current = false;
  };

  const scrollCoaches = (direction: "left" | "right") => {
    if (!coachesCarouselRef.current) return;
    const step = Math.round(coachesCarouselRef.current.clientWidth * 0.82);
    coachesCarouselRef.current.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const openCoachModal = (coach: Coach) => {
    if (flippingCoachId || activeCoach) return;
    setBooked(false);
    setSelectedSlot(coach.slots[0] ?? "");
    setFlippingCoachId(coach.id);

    window.setTimeout(() => {
      setActiveCoach(coach);
    }, 360);
  };

  useEffect(() => {
    if (!coachesCarouselRef.current) return;
    const carousel = coachesCarouselRef.current;
    const middleIndex = Math.floor(coaches.length / 2);
    const middleCard = carousel.children.item(middleIndex) as HTMLElement | null;
    if (!middleCard) return;
    const target =
      middleCard.offsetLeft - carousel.clientWidth / 2 + middleCard.clientWidth / 2;
    carousel.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, []);

  useEffect(() => {
    const firstPopup = window.setTimeout(() => setShowPromoPopup(true), 12000);
    const recurringPopup = window.setInterval(() => setShowPromoPopup(true), 45000);
    return () => {
      window.clearTimeout(firstPopup);
      window.clearInterval(recurringPopup);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-red-500/20 bg-black/75 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <a href="#hero" className="text-lg font-extrabold tracking-wide text-white">
            Fitness Club & Kids
          </a>
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-zinc-300 transition hover:text-red-400">
                {item.label}
              </a>
            ))}
          </div>
          <a
            href="#offre"
            className="border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-300 transition hover:scale-105 hover:bg-red-500 hover:text-white"
          >
            Reserver
          </a>
        </nav>
      </header>

      <main>
        <section
          id="hero"
          className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 md:px-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.28),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(127,29,29,0.35),transparent_35%),linear-gradient(135deg,#030303_8%,#0a0a0a_40%,#160809_100%)]" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto max-w-4xl text-center"
          >
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-red-400">Club fitness local</p>
            <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">Fitness Club & Kids</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300 md:text-xl">
              Pousse plus fort aujourd&apos;hui, deviens plus fort demain. Ta transformation commence ici.
            </p>
            <a
              href="#offre"
              className="mt-10 inline-block border border-red-300 bg-red-500 px-8 py-4 font-bold uppercase tracking-wide text-white shadow-2xl shadow-red-900/60 transition hover:-translate-y-1 hover:bg-red-400"
            >
              Reserver une seance offerte
            </a>
          </motion.div>
        </section>

        <section id="about" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Le club"
            title="Un espace haut de gamme pour progresser"
            subtitle="Un gym local axe sur les resultats, avec accompagnement humain et methodes efficaces."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
              "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
              "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80",
            ].map((src) => (
              <motion.img
                key={src}
                src={src}
                alt="Interieur de la salle"
                className="h-60 w-full border border-white/10 object-cover shadow-xl shadow-black/50"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
              />
            ))}
          </div>
        </section>

        <section id="coaches" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Coachs"
            title="Choisis ton coach"
            subtitle="Fais glisser le carousel et clique sur un coach pour ouvrir sa fiche complete."
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
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-red-400/70 bg-red-500/70 text-sm text-white backdrop-blur transition hover:bg-red-400"
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
              onMouseDown={(event) => beginDrag(event.clientX)}
              onMouseMove={(event) => moveDrag(event.clientX)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={(event) => beginDrag(event.touches[0]?.clientX ?? 0)}
              onTouchMove={(event) => moveDrag(event.touches[0]?.clientX ?? 0)}
              onTouchEnd={endDrag}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-14 pb-4 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [&::-webkit-scrollbar]:hidden"
            >
            {coaches.map((coach, index) => {
              const isFlipping = flippingCoachId === coach.id;
              return (
                <motion.button
                  key={coach.id}
                  onClick={() => openCoachModal(coach)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="h-[540px] min-w-[78%] snap-center text-left [perspective:1200px] md:min-w-[42%] xl:min-w-[29%]"
                >
                  <motion.div
                    layoutId={`coach-card-${coach.id}`}
                    animate={{
                      rotateY: isFlipping ? 180 : 0,
                      scale: isFlipping ? 1.04 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 130, damping: 18 }}
                    className="relative h-full w-full overflow-hidden border border-white/15 shadow-2xl shadow-black/60 [clip-path:polygon(8%_0,100%_0,92%_100%,0_100%)] [transform-style:preserve-3d]"
                  >
                    <div className="absolute inset-0 overflow-hidden bg-zinc-900 [backface-visibility:hidden]">
                      <motion.img
                        layoutId={`coach-image-${coach.id}`}
                        src={coach.photo}
                        alt={coach.name}
                        className="h-[405px] w-full object-cover object-top"
                      />
                      <div className="p-6">
                        <motion.h3 layoutId={`coach-name-${coach.id}`} className="text-2xl font-bold text-white">
                          {coach.name}
                        </motion.h3>
                        <p className="mt-2 text-red-400">{coach.specialty}</p>
                        <p className="mt-4 text-sm text-zinc-400">Clique pour ouvrir la fiche coach</p>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-zinc-900/95 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <h4 className="text-xl font-bold text-white">Apercu des creneaux</h4>
                      <ul className="mt-5 space-y-3">
                        {coach.slots.map((slot) => (
                          <li key={slot} className="border border-white/10 bg-zinc-800 px-3 py-2 text-zinc-200">
                            {slot}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-red-300">
                        Ouverture de la fiche...
                      </p>
                    </div>
                  </motion.div>
                </motion.button>
              );
            })}
            </div>
          </div>

        </section>

        <section id="services" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Cours collectifs"
            title="Planning hebdomadaire (fictif)"
            subtitle="Exemple de planning pour visualiser l'organisation des cours en salle."
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

        <section id="offre" className="mx-auto w-full max-w-6xl px-4 py-14 md:px-8">
          <SectionTitle
            eyebrow="Seance offerte"
            title="Acces salle offert (sans coach)"
            subtitle="Choisis un creneau d'acces puis laisse tes coordonnees pour valider ta premiere visite."
          />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border border-white/10">
              <div className="grid grid-cols-[110px_repeat(7,minmax(0,1fr))] border-b border-white/10 bg-red-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-300">
                <span>Heure</span>
                {joursEssai.map((jour) => (
                  <span key={jour}>{jour}</span>
                ))}
              </div>
              {horairesEssai.map((heure) => (
                <div
                  key={heure}
                  className="grid grid-cols-[110px_repeat(7,minmax(0,1fr))] border-b border-white/10 bg-zinc-900/70 px-4 py-3 text-xs text-zinc-200 last:border-none"
                >
                  <span className="font-semibold text-red-300">{heure}</span>
                  {joursEssai.map((jour) => {
                    const key = `${jour}-${heure}`;
                    const disponible = Boolean(planningEssai[key]);
                    const selected = selectedAccessSlot === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (!disponible) return;
                          setSelectedAccessSlot(key);
                          setLeadSent(false);
                        }}
                        className={`text-left transition ${
                          !disponible
                            ? "cursor-not-allowed text-zinc-600"
                            : selected
                              ? "text-white underline decoration-red-400 decoration-2"
                              : "text-zinc-300 hover:text-white"
                        }`}
                      >
                        {planningEssai[key] ?? "-"}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                setLeadSent(true);
              }}
              className="border border-red-500/30 bg-black/50 p-6"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-red-400">Formulaire d&apos;inscription</p>
              <div className="mt-5 space-y-4">
                <input required placeholder="Nom complet" className="w-full border border-white/20 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-400" />
                <input required type="tel" placeholder="Telephone" className="w-full border border-white/20 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-400" />
                <input required type="email" placeholder="Email" className="w-full border border-white/20 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-400" />
                <input
                  value={selectedAccessSlot ? selectedAccessSlot.replace("-", " • ") : ""}
                  readOnly
                  placeholder="Selectionne d'abord un creneau"
                  className="w-full border border-white/20 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedAccessSlot}
                className="mt-6 w-full border border-red-300 bg-red-500 px-6 py-3 font-bold uppercase tracking-wide text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Demander ma seance offerte
              </button>
              {leadSent && (
                <p className="mt-4 border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-300">
                  Merci. Ta demande est enregistree pour le creneau {selectedAccessSlot.replace("-", " • ")}.
                </p>
              )}
            </form>
          </div>
        </section>

        <section id="avis" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8">
          <SectionTitle
            eyebrow="Avis Google"
            title="Ce que disent nos adherents"
            subtitle="Avis clients mockes pour la maquette visuelle."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <motion.blockquote
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                className="flex h-full min-h-[260px] flex-col border border-white/10 bg-zinc-900 p-6 shadow-lg"
              >
                <div className="mb-4 flex items-center gap-3">
                  <img src={item.avatar} alt={item.name} className="h-11 w-11 border border-white/20 object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-zinc-400">Google • {item.rating} ★</p>
                  </div>
                  <span className="ml-auto text-xs text-zinc-500">{item.date}</span>
                </div>
                <p className="text-zinc-200">&quot;{item.quote}&quot;</p>
                <footer className="mt-auto pt-4 text-sm text-red-400">Avis verifie</footer>
              </motion.blockquote>
            ))}
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
                <span className="font-semibold text-white">Adresse :</span> 24 Av. d&apos;Hauterive, 81100 Castres
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

      <AnimatePresence>
        {activeCoach && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative h-auto max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-red-500/40 bg-zinc-950 p-6 md:p-10"
          >
            <motion.div layoutId={`coach-card-${activeCoach.id}`} className="absolute inset-0 -z-10" />
            <button
              onClick={() => {
                setActiveCoach(null);
                setBooked(false);
                  setFlippingCoachId(null);
              }}
              className="absolute right-4 top-4 border border-white/20 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200 transition hover:border-red-400 hover:text-white"
            >
              Fermer
            </button>

            <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
              <motion.img
                layoutId={`coach-image-${activeCoach.id}`}
                src={activeCoach.photo}
                alt={activeCoach.name}
                className="h-[360px] w-full border border-white/15 object-cover"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-red-400">Fiche coach</p>
                <motion.h3 layoutId={`coach-name-${activeCoach.id}`} className="mt-2 text-3xl font-bold text-white">
                  {activeCoach.name}
                </motion.h3>
                <p className="mt-2 text-zinc-300">{activeCoach.specialty}</p>
                <p className="mt-8 text-sm uppercase tracking-[0.2em] text-red-400">Creneaux disponibles</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {activeCoach.slots.map((slot) => (
                    <button
                      key={slot}
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
                  onClick={() => setBooked(true)}
                  disabled={!selectedSlot}
                  className="mt-6 border border-red-300 bg-red-500 px-6 py-3 font-bold uppercase tracking-wide text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Confirmer la reservation
                </button>
                {booked && selectedSlot && (
                  <p className="mt-4 border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-300">
                    Reservation confirmee avec {activeCoach.name} pour {selectedSlot}.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPromoPopup && (
          <div className="fixed inset-0 z-[80] flex items-end justify-end bg-black/45 p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-sm border border-red-500/40 bg-zinc-950 p-5 shadow-2xl shadow-black/60"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-red-400">Offre decouverte</p>
              <h4 className="mt-2 text-xl font-bold text-white">1 acces salle offert</h4>
              <p className="mt-2 text-sm text-zinc-300">
                Teste la salle gratuitement sur un creneau disponible, sans engagement.
              </p>
              <div className="mt-5 flex gap-2">
                <a
                  href="#offre"
                  onClick={() => setShowPromoPopup(false)}
                  className="flex-1 border border-red-300 bg-red-500 px-4 py-2 text-center text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-red-400"
                >
                  Voir l&apos;offre
                </a>
                <button
                  onClick={() => setShowPromoPopup(false)}
                  className="border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-zinc-200 transition hover:border-red-400 hover:text-white"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

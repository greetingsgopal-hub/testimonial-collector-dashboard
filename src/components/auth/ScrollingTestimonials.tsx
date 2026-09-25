import React from 'react';
import { BookOpen } from 'lucide-react';

export interface TestimonialItem {
  name: string;
  role: string;
  avatar: string;
  stars: number;
  text: string;
  tag?: string;
  highlight?: string;
}

const TESTIMONIALS_LIST: TestimonialItem[] = [
  {
    name: 'Devin Lee',
    role: 'Systems Strategist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'It took mere minutes to get set up and add GORGEOUS testimonials to my website',
  },
  {
    name: 'Alex M.',
    role: 'SaaS Founder',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'Took me less than 5 minutes to start collecting',
  },
  {
    name: 'Elliot Thomas',
    role: 'Founder',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'an absolute game changer',
  },
  {
    name: 'LaShonda Brown',
    role: 'Tech Educator & YouTuber',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'Effective tech tools are great. Effective tools run by incredibly supportive humans, even better.',
  },
  {
    name: 'femke',
    role: '@femkesvs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: "I switched to Panda Praise to collect testimonials and it's my fav tool of the year! A+ all around from design to support.",
    highlight: "it's my fav tool of the year",
  },
  {
    name: 'Michel Bardelmeijer',
    role: 'Founder of redirect.pizza',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'Loving Panda Praise! We needed an easy-to-use testimonial solution with great design which Panda Praise fully delivers.',
  },
  {
    name: 'Fed',
    role: 'Founder, BetterProof',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'Promoting and sharing testimonials has been fantastic. The social proof already paid for itself!',
    highlight: 'paid for itself',
  },
  {
    name: 'Jay Clouse',
    role: 'Founder, Creator Science',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: "I've already seen a tangible impact on revenue and conversion by sharing more social proof.",
  },
];

export const ScrollingTestimonials: React.FC = () => {
  // Duplicate for seamless infinite loop
  const duplicatedList = [...TESTIMONIALS_LIST, ...TESTIMONIALS_LIST];

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#6701e6] p-8 xl:p-12 flex-col justify-center relative overflow-hidden text-white select-none">
      
      {/* Soft atmospheric background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-900/40 blur-3xl" />

      {/* Top and Bottom gradient mask to soften card entrance and exit */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#6701e6] via-[#6701e6]/80 to-transparent z-20" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#6701e6] via-[#6701e6]/80 to-transparent z-20" />

      {/* Infinite Upward Scrolling Container */}
      <div className="relative z-10 max-w-lg mx-auto w-full h-[760px] overflow-hidden">
        <div className="animate-vertical-scroll space-y-5 hover:[animation-play-state:paused]">
          {duplicatedList.map((t, idx) => (
            <div
              key={`${t.name}-${idx}`}
              className="rounded-3xl bg-white/10 border border-white/15 p-6 backdrop-blur-md shadow-xl transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-white/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex text-amber-400 text-sm mb-1.5">
                    {'★'.repeat(t.stars)}
                  </div>
                  <p className="text-base sm:text-lg font-bold leading-snug break-words">
                    {t.highlight ? (
                      <>
                        {t.text.split(t.highlight)[0]}
                        <span className="underline decoration-amber-300 decoration-2 underline-offset-2">
                          {t.highlight}
                        </span>
                        {t.text.split(t.highlight)[1]}
                      </>
                    ) : (
                      t.text
                    )}
                  </p>
                  <p className="text-xs text-white/80 mt-2 font-medium">
                    {t.name} <span className="text-emerald-400 font-semibold">/ {t.role}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Small floating bottom-right docs badge (Screenshot 1 Exact) */}
      <div className="absolute bottom-6 right-6 z-30 w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-lg">
        <BookOpen className="w-4 h-4" />
      </div>

    </div>
  );
};
export default ScrollingTestimonials;

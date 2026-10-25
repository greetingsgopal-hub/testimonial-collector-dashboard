export interface CustomerVideoReview {
  id: number;
  name: string;
  verified: boolean;
  order: string;
  location: string;
  timeAgo: string;
  product: string;
  price: string;
  quote: string;
  fullTranscript: string;
  hooks: string[];
  duration: string;
  sentiment: string;
  status: 'pending' | 'ready';
  phone: string;
  colorFrom: string;
  colorTo: string;
}

export interface ToastItem {
  id: number;
  title: string;
  msg: string;
}

export const INITIAL_MERCHANT_REVIEWS: CustomerVideoReview[] = [
  {
    id: 1,
    name: 'Priya Sundaram',
    verified: true,
    order: 'KS-89104',
    location: 'Kochi, KL',
    timeAgo: '2h ago',
    product: 'Chanderi Anarkali Kurta Set',
    price: '₹3,499',
    quote: "Honestly shocked by the pocket depth! Phone + keys and silhouette didn't pull at all.",
    fullTranscript:
      "Honestly shocked by the pocket depth! I put my phone and keys and the silhouette didn't pull at all. Material is pure summer luxury. Ordered size M and it fits like it was tailored. The chanderi is so breathable for Kochi humidity. Will definitely order the green one next.",
    hooks: [
      'POV: Kurta with REAL POCKETS',
      '₹3499 looks like ₹12,000 designer',
      'Unboxing Kerala Handloom Festive',
    ],
    duration: '0:28',
    sentiment: '98%',
    status: 'pending',
    phone: '+91 •• 8841',
    colorFrom: '#2a2a2e',
    colorTo: '#1e1e22',
  },
  {
    id: 2,
    name: 'Arjun Nair',
    verified: true,
    order: 'KS-89022',
    location: 'Bengaluru, KA',
    timeAgo: '5h ago',
    product: 'Raw Silk Nehru Jacket - Sandalwood',
    price: '₹2,899',
    quote: "Wore this to my brother's engagement. 5 people asked if I bought it from Sabyasachi.",
    fullTranscript:
      "Wore this to my brother's engagement. Literally 5 people asked me if I bought it from Sabyasachi. The zari stitching is immaculate. For ₹2899 this is a steal. Groomsmen, please don't spend 10k. This looks premium, feels premium, photographs premium.",
    hooks: [
      '₹2899 Wedding Outfit Hack',
      'They thought it was ₹40k designer!',
      'Groomsmen styling under 3k',
    ],
    duration: '0:41',
    sentiment: '96%',
    status: 'pending',
    phone: '+91 •• 4912',
    colorFrom: '#25251e',
    colorTo: '#1e1e18',
  },
  {
    id: 3,
    name: 'Meera Kapoor',
    verified: true,
    order: 'KS-88971',
    location: 'Mumbai, MH',
    timeAgo: '9h ago',
    product: 'Mul Cotton Saree - Indigo Dabu',
    price: '₹4,200',
    quote: 'The indigo didn\'t bleed even after first wash. Drapes like a dream, super light.',
    fullTranscript:
      'The indigo didn\'t bleed even after first wash. Drapes like a dream, super light. Got so many compliments at office. The tassels are hand-made, you can feel the craft. Packaging was also super aesthetic, no plastic.',
    hooks: [
      'Indigo that actually stays',
      'Office saree that feels like air',
      'Handloom that doesn\'t bleed',
    ],
    duration: '0:33',
    sentiment: '94%',
    status: 'pending',
    phone: '+91 •• 7732',
    colorFrom: '#1e232a',
    colorTo: '#1a1e25',
  },
  {
    id: 4,
    name: 'Sana Ali',
    verified: true,
    order: 'KS-88810',
    location: 'Hyderabad, TS',
    timeAgo: '1d ago',
    product: 'Chanderi Anarkali Kurta Set',
    price: '₹3,499',
    quote: 'Pockets saved me at my cousin\'s mehendi. Finally a kurta where I can keep lipstick.',
    fullTranscript:
      'Pockets saved me at my cousin\'s mehendi. Finally a kurta where I can keep lipstick and phone. Also the length is perfect for 5\'3". No alterations needed.',
    hooks: [
      'Finally kurta with pockets',
      'No alteration needed 5\'3" approved',
      'Mehendi ready',
    ],
    duration: '0:22',
    sentiment: '97%',
    status: 'ready',
    phone: '+91 •• 9921',
    colorFrom: '#262022',
    colorTo: '#1e1c1e',
  },
  {
    id: 5,
    name: 'Rohan Desai',
    verified: true,
    order: 'KS-88702',
    location: 'Pune, MH',
    timeAgo: '2d ago',
    product: 'Linen Bandhgala - Charcoal',
    price: '₹3,899',
    quote: 'Stitching is clean, buttons are solid. Looks like a 15k designer piece.',
    fullTranscript:
      'Stitching is clean, buttons are solid. Looks like a 15k designer piece. Wore it for Diwali cards and got 3 inquiries.',
    hooks: [
      'Charcoal bandhgala under 4k',
      'Diwali outfit = 3 inquiries',
      'Linen that holds structure',
    ],
    duration: '0:18',
    sentiment: '95%',
    status: 'ready',
    phone: '+91 •• 5518',
    colorFrom: '#23231e',
    colorTo: '#1c1c18',
  },
];

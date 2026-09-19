export const siteContent = {
  brand: {
    name: "Zenith Surf & Climb",
    tagline: "Surf. Climb. Create.",
    supportingLine:
      "From the Atlantic to the mountains, discover Morocco through movement, creativity and community.",
  },

  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "Surf. Climb. Create.", href: "#experiences" },
      { label: "Morocco", href: "#morocco" },
      { label: "Gallery", href: "#gallery" },
      { label: "Contact", href: "#contact" },
      { label: "Book", href: "#booking" },
    ],
  },

  hero: {
    backgroundImage: "/images/location/zenith-coast-01.JPG",
    backgroundAlt: "Atlantic coastline waves along the Moroccan coast",
    cta: {
      label: "Discover Zenith",
      href: "#about",
    },
    scrollCue: "Scroll to explore",
  },

  about: {
    eyebrow: "About Zenith",
    heading: "From ocean to mountains.",
    paragraphs: [
      "From the ocean to the mountains, we connect surfing and climbing with creative art workshops, allowing every guest to discover new challenges while expressing their creativity.",
      "We honor Moroccan heritage by bringing together local traditions, cuisine and community with modern adventure and creativity.",
    ],
    themes: ["Movement", "Creativity", "Culture", "Community"],
    image: {
      src: "/images/location/zenith-coast-03.JPG",
      alt: "A hiker looking out over Morocco's Atlantic coastline and mountains",
    },
  },

  experiences: {
    eyebrow: "Surf. Climb. Create.",
    intro: "Three ways to experience Zenith — through movement, creativity and connection.",
    items: [
      {
        number: "01",
        title: "Surf",
        label: "Ocean",
        copy: "Meet the Atlantic through movement, challenge and freedom.",
        image: {
          src: "/images/program/7B4E241F-9231-4258-B246-3A01439A101A_VSCO.jpg",
          alt: "A row of colourful surfboards leaning against a vintage van on a sunny beach",
        },
      },
      {
        number: "02",
        title: "Climb",
        label: "Mountains",
        copy: "From the ocean to the mountains, discover new perspectives and new challenges.",
        image: {
          src: "/images/program/IMG_5043.JPG",
          alt: "A hiker standing atop a large rock formation in the Moroccan mountains",
        },
      },
      {
        number: "03",
        title: "Create",
        label: "Art & Culture",
        copy: "Slow down, make something and connect with Moroccan culture through creativity.",
        image: {
          src: "/images/program/IMG_2885_VSCO.jpg",
          alt: "A hand pouring traditional Moroccan tea on a rooftop terrace at golden hour",
        },
      },
    ],
  },

  week: {
    eyebrow: "A Week at Zenith",
    heading: "Seven days. More than one adventure.",
    intro:
      "No two days at Zenith feel the same. Move between the Atlantic, the mountains and the rhythm of Moroccan life — surfing, climbing, creating, slowing down and discovering the places in between.",
    activities: [
      {
        number: "01",
        title: "Surf Lessons",
        copy: "Atlantic mornings, coached sessions and time in the water.",
      },
      {
        number: "02",
        title: "Yoga",
        copy: "Slow down, reset and find balance between the more active days.",
      },
      {
        number: "03",
        title: "Climbing",
        copy: "Leave the coast behind and discover Morocco from the rock.",
      },
      {
        number: "04",
        title: "Sand Surfing",
        copy: "Trade ocean waves for the dunes.",
      },
      {
        number: "05",
        title: "Souk / Market",
        copy: "Colours, spices, food and the everyday rhythm of Morocco.",
      },
      {
        number: "06",
        title: "Skate Park",
        copy: "Another kind of movement, away from the water.",
      },
      {
        number: "07",
        title: "Hammam",
        copy: "A traditional Moroccan ritual and a chance to properly unwind.",
      },
      {
        number: "08",
        title: "Desert Bonfire",
        copy: "An evening outside, gathered around the fire.",
      },
      {
        number: "09",
        title: "Creative Time",
        copy: "Space to make, experiment and express yourself.",
      },
    ],
  },

  stay: {
    eyebrow: "Your Home for the Week",
    heading: "A place to slow down between adventures.",
    body: "After days spent moving, exploring and discovering Morocco, Zenith gives you space to slow down, connect and make yourself at home.",
    supportingLine:
      "Seven nights. One base. A week shaped by movement, culture and connection.",
  },

  package: {
    eyebrow: "The Complete Experience",
    heading: "One week. Everything in one rhythm.",
    body: "Seven nights built around movement, creativity and Morocco — with your stay, daily rhythm and shared experiences brought together into one complete week.",
    price: "€900",
    priceNote: "per person · 7 nights",
    schedule: "Monday → Monday",
    included: [
      { label: "Stay", value: "7 nights" },
      { label: "Meals", value: "Breakfast & dinner" },
      { label: "Transport", value: "Local transport during the programme" },
      { label: "Experiences", value: "Surf, climb, move, create & explore" },
      {
        label: "Activities",
        value:
          "Surf lessons · Yoga · Sand surfing · Souk / market · Skate park · Climbing · Hammam · Desert bonfire · Creative time",
      },
    ],
    cta: {
      label: "Reserve your week",
      href: "#booking",
    },
  },

  paradiseValley: {
    eyebrow: "Paradise Valley · Imouzzer",
    heading: "Wild water. Red rock. Endless palms.",
    body: "Beyond the Atlantic lies another side of Morocco. Paradise Valley winds through rock, palms and natural pools — a place to swim, explore and slow down between the mountains.",
    supportingLine: "A change of rhythm, only a journey away from the coast.",
    metadata: ["Natural Pools", "Atlas Foothills", "Palm Valley"],
  },

  morocco: {
    eyebrow: "Rooted in Morocco",
    headline: {
      lead: "More than a place.",
      accent: "A culture to experience.",
    },
    body: "We honor Moroccan heritage by bringing together local traditions, cuisine and community with modern adventure and creativity.",
    themes: ["Traditions", "Cuisine", "Community"],
    image: {
      src: "/images/program/06b297b3-fc26-43fd-998d-ed19f64b5dd9.jpg",
      alt: "Vivid cones of spices for sale at a Moroccan souk",
    },
  },

  gallery: {
    eyebrow: "Gallery",
    heading: "Moments from Zenith",
    // Deliberately mixed across pools (2 Paradise Valley + 2 location) so
    // Gallery reads as a genuine cross-section of the whole Zenith
    // experience rather than "four Paradise Valley photos" — every image
    // here is homepage-unique (see the photography curation report).
    images: [
      {
        size: "large",
        src: "/images/paradise-valley/paradise-valley-07.jpg",
        alt: "A person swimming in a turquoise canyon pool surrounded by rock walls in Paradise Valley",
      },
      {
        size: "medium",
        src: "/images/location/zenith-morocco-location-01.JPG",
        alt: "A traditional Moroccan courtyard with palm trees and earthen architecture",
      },
      {
        size: "medium",
        src: "/images/location/zenith-coast-02.JPG",
        alt: "Sunlit horizon over the Atlantic Ocean along the Moroccan coast",
      },
      {
        size: "wide",
        src: "/images/paradise-valley/paradise-valley-08.jpg",
        alt: "A rocky canyon gorge opening onto distant mountains in Paradise Valley",
      },
    ],
  },

  booking: {
    eyebrow: "Reserve Your Week",
    heading: "Choose your week. We’ll take care of the rest.",
    intro:
      "Choose a Monday-to-Monday week and send us your reservation request. No payment is required now — we’ll confirm your stay personally.",
    confirmationNote:
      "Your reservation is confirmed only after you receive confirmation from Zenith.",
    pricePerPerson: 900,
    included: ["Breakfast", "Dinner", "Transport", "Zenith programme"],
    emptyWeekPrompt: "Choose a week to continue.",
    form: {
      fullNameLabel: "Full name",
      emailLabel: "Email",
      phoneLabel: "Phone / WhatsApp",
      countryLabel: "Country",
      messageLabel: "Message",
      submitLabel: "Request this week",
    },
    success: {
      heading: "Your request is on its way.",
      body: "We’ve received your reservation request for {dates}. Zenith will get back to you personally to confirm your stay.",
      note: "No payment has been taken.",
      resetLabel: "Send another request",
    },
  },

  finalCta: {
    eyebrow: "Next Step",
    headline: "Ready to experience Zenith?",
    cta: {
      label: "Reserve your week",
      href: "#booking",
    },
  },
};
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
      { label: "Surf / Climb / Create", href: "#experiences" },
      { label: "Morocco", href: "#morocco" },
      { label: "Gallery", href: "#gallery" },
      { label: "Contact", href: "#contact" },
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
          src: "/images/location/zenith-coast-02.JPG",
          alt: "Sunlit horizon over the Atlantic Ocean along the Moroccan coast",
        },
      },
      {
        number: "02",
        title: "Climb",
        label: "Mountains",
        copy: "From the ocean to the mountains, discover new perspectives and new challenges.",
        image: {
          src: "/images/location/zenith-coast-03.JPG",
          alt: "A hiker overlooking the Atlantic coastline and mountains of Morocco",
        },
      },
      {
        number: "03",
        title: "Create",
        label: "Art & Culture",
        copy: "Slow down, make something and connect with Moroccan culture through creativity.",
        image: {
          src: "/images/location/zenith-morocco-location-01.JPG",
          alt: "A traditional Moroccan courtyard with palm trees and earthen architecture",
        },
      },
    ],
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
      src: "/images/location/zenith-morocco-location-01.JPG",
      alt: "A traditional Moroccan courtyard with palm trees and earthen architecture",
    },
  },

  gallery: {
    eyebrow: "Gallery",
    heading: "Moments from Zenith",
    images: [
      {
        size: "large",
        src: "/images/location/zenith-coast-01.JPG",
        alt: "Close-up view of ocean waves along the Moroccan coast",
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
        src: "/images/location/zenith-coast-03.JPG",
        alt: "A hiker overlooking the Atlantic coastline and mountains of Morocco",
      },
    ],
  },

  finalCta: {
    eyebrow: "Next Step",
    headline: "Ready to experience Zenith?",
    cta: {
      label: "Get in touch",
      href: "#contact",
    },
  },
};
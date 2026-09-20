// Shared contact/social constants — single source of truth so the
// Instagram/WhatsApp URLs aren't duplicated across Footer and Booking.

export const INSTAGRAM_URL = "https://www.instagram.com/zenithnomads/";

// wa.me requires digits only (no "+", no spaces, no leading zeros) —
// +421917363444 becomes this.
const WHATSAPP_PHONE = "421917363444";
const WHATSAPP_MESSAGE =
  "Hi Zenith Nomads! I have a question about one of your Morocco weeks.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

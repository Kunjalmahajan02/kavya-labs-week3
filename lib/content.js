// All landing page copy in one place, so sections stay simple and easy to edit
export const COMPANY = {
  name: "Kavya Labs",
  product: "Kavya",
  tagline: "AI that speaks your customer's language",
  city: "Bengaluru",
  email: "hello@kavyalabs.in",
};

export const NAV_LINKS = [
  ["/#features", "Features"],
  ["/#how-it-works", "How it works"],
  ["/#pricing", "Pricing"],
  ["/#faq", "FAQ"],
];

export const STATS = [
  ["12", "Indian languages"],
  ["< 2s", "Average reply time"],
  ["24×7", "Always on"],
  ["5 min", "To go live"],
];

export const FEATURES = [
  {
    icon: "🗣️",
    title: "12 Indian languages",
    text: "Hindi, Tamil, Telugu, Kannada, Marathi, Bengali and more, including Hinglish. Kavya replies in whatever language the customer writes in.",
  },
  {
    icon: "💬",
    title: "WhatsApp, web and Instagram",
    text: "One assistant for every channel your customers already use. Conversations sync to a single inbox.",
  },
  {
    icon: "📚",
    title: "Trained on your business",
    text: "Upload menus, price lists, policies or FAQs. Kavya answers from your documents, not guesses.",
  },
  {
    icon: "🧾",
    title: "Orders and bookings",
    text: "Take orders, book appointments and send UPI payment links without leaving the chat.",
  },
  {
    icon: "🙋",
    title: "Smooth human handoff",
    text: "When a question needs a person, Kavya hands over the chat with a summary so nobody repeats themselves.",
  },
  {
    icon: "📊",
    title: "Insights dashboard",
    text: "See top questions, busy hours and customer sentiment, so you know what to fix next.",
  },
];

export const STEPS = [
  ["Connect", "Link your WhatsApp Business number or add one line of code to your website."],
  ["Teach", "Upload your documents and price lists. Kavya learns your business in minutes."],
  ["Go live", "Kavya starts answering customers 24×7, and you watch every chat from the dashboard."],
];

export const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    blurb: "For trying Kavya on a small shop.",
    features: ["100 conversations / month", "1 channel", "2 languages", "Email support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/month",
    blurb: "For growing businesses on WhatsApp and web.",
    features: ["5,000 conversations / month", "3 channels", "All 12 languages", "Orders and UPI payments", "Insights dashboard"],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "For chains, banks and large support teams.",
    features: ["Unlimited conversations", "Custom integrations", "Dedicated success manager", "On-premise option"],
    cta: "Talk to sales",
    highlight: false,
  },
];

export const FAQS = [
  ["Do my customers need to install anything?", "No. Kavya works inside WhatsApp, Instagram and your website, which your customers already use."],
  ["Which languages are supported?", "Hindi, English, Hinglish, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali, Punjabi and Odia."],
  ["Is my data safe?", "Your documents and chats are encrypted and stored in India. We never use your data to train models for other customers."],
  ["Can I take over a chat myself?", "Yes. You can jump into any conversation from the dashboard, and Kavya steps back automatically."],
];

export const FOOTER_LINKS = {
  Product: [
    ["/#features", "Features"],
    ["/#how-it-works", "How it works"],
    ["/#pricing", "Pricing"],
    ["/admin/demo", "Admin dashboard demo"],
  ],
  Company: [
    ["/#faq", "FAQ"],
    ["/#get-started", "Get early access"],
    [`mailto:${COMPANY.email}`, "Contact"],
  ],
};

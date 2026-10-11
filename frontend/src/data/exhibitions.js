import ancientImage from "../assets/images/exhibitions/ancient-civilisations.jpg";
import regionalImage from "../assets/images/exhibitions/regional-stories.jpg";
import artImage from "../assets/images/exhibitions/art-through-time.jpg";
const exhibitions = [
  {
    id: 1,
    title: "Ancient Civilisations",
    image: ancientImage,
    category: "History & Archaeology",
    date: "12 September – 15 December 2026",
    description:
      "Journey through remarkable objects, traditions and stories from ancient civilisations across the world.",
  },
  {
    id: 2,
    title: "Stories of the Region",
    category: "Local Heritage",
    image: regionalImage,
    date: "20 September 2026 – 18 January 2027",
    description:
      "Discover the people, places and objects that have shaped the identity and history of our region.",
  },
  {
    id: 3,
    title: "Art Through Time",
    category: "Art & Culture",
    image: artImage,
    date: "5 October 2026 – 28 February 2027",
    description:
      "Explore artistic expression across generations through a carefully selected collection of remarkable works.",
  },
];

export default exhibitions;
import vesselImage from "../assets/images/collections/ceremonial-vessel.jpg";
import landscapeImage from "../assets/images/collections/regional-landscape.jpg";
import wovenImage from "../assets/images/collections/woven-object.jpg";
const collections = [
  {
    id: 1,
    title: "Ceremonial Vessel",
    image: vesselImage,
    category: "Archaeology",
    period: "c. 1200–1000 BCE",
    origin: "Ancient Mediterranean",
    description:
      "A remarkable ceremonial object offering insight into ancient craftsmanship, ritual and community life.",
  },
  {
    id: 2,
    title: "Regional Landscape",
    category: "Fine Art",
    image: landscapeImage,
    period: "c. 1890",
    origin: "Regional Australia",
    description:
      "A historic landscape capturing the changing relationship between people, place and the regional environment.",
  },
  {
    id: 3,
    title: "Woven Cultural Object",
    category: "Cultural Heritage",
    image: wovenImage,
    period: "20th Century",
    origin: "Regional Collection",
    description:
      "A carefully preserved object demonstrating traditional materials, knowledge and skilled craftsmanship.",
  },
];

export default collections;
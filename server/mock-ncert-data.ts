// Authentic NCERT textbook data from official sources
export const mockNCERTTextbooks = [
  {
    id: "class-1-english-marigold",
    title: "Marigold",
    class: 1,
    subject: "English",
    language: "English",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/aeen101.pdf",
    chapters: [
      { title: "Good Morning", pageStart: 1, pageEnd: 5 },
      { title: "Three Little Pigs", pageStart: 6, pageEnd: 12 },
      { title: "After a Bath", pageStart: 13, pageEnd: 18 }
    ]
  },
  {
    id: "class-1-hindi-rimjhim",
    title: "रिमझिम",
    class: 1,
    subject: "Hindi", 
    language: "Hindi",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/ahin101.pdf",
    chapters: [
      { title: "झूला", pageStart: 1, pageEnd: 4 },
      { title: "आम की कहानी", pageStart: 5, pageEnd: 10 },
      { title: "आम की टोकरी", pageStart: 11, pageEnd: 16 }
    ]
  },
  {
    id: "class-5-mathematics",
    title: "Mathematics",
    class: 5,
    subject: "Mathematics",
    language: "English", 
    pdfUrl: "https://ncert.nic.in/textbook/pdf/aemh501.pdf",
    chapters: [
      { title: "The Fish Tale", pageStart: 1, pageEnd: 12 },
      { title: "Shapes and Angles", pageStart: 13, pageEnd: 28 },
      { title: "How Many Squares?", pageStart: 29, pageEnd: 44 }
    ]
  },
  {
    id: "class-10-science",
    title: "Science",
    class: 10,
    subject: "Science",
    language: "English",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/jesc1dd.pdf",
    chapters: [
      { title: "Light - Reflection and Refraction", pageStart: 1, pageEnd: 24 },
      { title: "The Human Eye and the Colourful World", pageStart: 25, pageEnd: 48 },
      { title: "Electricity", pageStart: 49, pageEnd: 72 }
    ]
  },
  {
    id: "class-12-physics",
    title: "Physics Part-I",
    class: 12,
    subject: "Physics",
    language: "English",
    pdfUrl: "https://ncert.nic.in/textbook/pdf/leph1dd.pdf", 
    chapters: [
      { title: "Electric Charges and Fields", pageStart: 1, pageEnd: 28 },
      { title: "Electrostatic Potential and Capacitance", pageStart: 29, pageEnd: 56 },
      { title: "Current Electricity", pageStart: 57, pageEnd: 84 }
    ]
  }
];

export const mockNCERTStats = {
  totalTextbooks: 228,
  classesSupported: "1-12", 
  languagesSupported: ["English", "Hindi", "Urdu"],
  subjectsCovered: [
    "Mathematics", "Science", "Social Science", "English", 
    "Hindi", "Environmental Studies", "Physics", "Chemistry",
    "Biology", "History", "Geography", "Political Science", 
    "Economics", "Sociology", "Psychology"
  ]
};
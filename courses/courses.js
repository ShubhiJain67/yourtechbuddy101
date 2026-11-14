/*
  YourTechBuddy courses — the ONLY file you edit to add/change courses.

  For each lesson, paste the YouTube video ID into `youtube`.
  The ID is the part after "v=" in a YouTube link:
    https://www.youtube.com/watch?v=dQw4w9WgXcQ   ->   youtube: "dQw4w9WgXcQ"
    https://youtu.be/dQw4w9WgXcQ                  ->   youtube: "dQw4w9WgXcQ"

  Lessons with an empty `youtube` show as "Coming soon".
  `duration` is optional ("12:34").
  `practice` is optional: a Playground language to open from that lesson (javascript, python, java, cpp, go...).
*/
window.COURSES = [
  {
    slug: 'lld',
    title: 'Low Level Design — Full Course',
    tagline: 'From OOP basics to cracking LLD interview rounds, with real case studies.',
    level: 'Beginner → Advanced',
    tags: ['LLD', 'OOP', 'Design Patterns', 'Interviews'],
    practice: 'java',
    sections: [
      {
        title: 'Foundations',
        lessons: [
          { title: 'What is LLD & how LLD interviews work', youtube: '', duration: '' },
          { title: 'OOP pillars: encapsulation, abstraction, inheritance, polymorphism', youtube: '', duration: '' },
          { title: 'Class relationships & UML diagrams', youtube: '', duration: '' },
          { title: 'SOLID principles', youtube: '', duration: '' },
        ],
      },
      {
        title: 'Design Patterns',
        lessons: [
          { title: 'Singleton', youtube: '', duration: '' },
          { title: 'Factory & Abstract Factory', youtube: '', duration: '' },
          { title: 'Builder', youtube: '', duration: '' },
          { title: 'Adapter & Facade', youtube: '', duration: '' },
          { title: 'Decorator', youtube: '', duration: '' },
          { title: 'Strategy', youtube: '', duration: '' },
          { title: 'Observer', youtube: '', duration: '' },
          { title: 'State', youtube: '', duration: '' },
        ],
      },
      {
        title: 'Case Studies',
        lessons: [
          { title: 'Design a Parking Lot', youtube: '', duration: '' },
          { title: 'Design Tic-Tac-Toe', youtube: '', duration: '' },
          { title: 'Design an Elevator System', youtube: '', duration: '' },
          { title: 'Design BookMyShow', youtube: '', duration: '' },
          { title: 'Design Splitwise', youtube: '', duration: '' },
          { title: 'Design a Rate Limiter', youtube: '', duration: '' },
        ],
      },
    ],
  },
];

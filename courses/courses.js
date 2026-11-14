/*
  YourTechBuddy courses — the ONLY file you edit to add/change courses.

  Two ways to define a course:

  1) PLAYLIST (easiest): set `playlist` to the YouTube playlist ID (the part after "list=").
     Lessons load live from YouTube, so new videos you add to the playlist appear automatically.

  2) MANUAL: leave `playlist` out and list lessons yourself in `sections`,
     with each lesson's video ID (the part after "v=") in `youtube`.
     Lessons with an empty `youtube` show as "Coming soon".

  `practice` (optional) = Playground language opened by the "Practise" button
  (javascript, python, java, cpp, c, go, rust).
*/
window.COURSES = [
  {
    slug: 'lld',
    title: 'Low Level Design 101',
    tagline: 'From OOP basics to cracking LLD interview rounds, with real case studies.',
    level: 'Beginner → Advanced',
    tags: ['LLD', 'OOP', 'Design Patterns', 'Interviews'],
    practice: 'java',
    playlist: 'PLBcZYF21PlE4',
    sections: [],
  },
];

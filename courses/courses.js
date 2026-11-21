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
    tagline: 'From OOP basics to real-world case studies.',
    level: 'Beginner → Advanced',
    tags: ['LLD', 'OOP', 'Design Patterns', 'Interviews'],
    practice: 'java',
    playlist: 'PLBcZYF21PlE4',
    sections: [],

    // Playlist videos are sorted into these sections by keywords in their titles (case-insensitive).
    // Playlist order is kept inside each section. Anything unmatched goes to `fallbackGroup`.
    groups: [
      {
        title: 'Foundations',
        match: ['intro', 'what is', 'roadmap', 'basics', 'oop', 'object oriented', 'object-oriented',
                'class diagram', 'uml', 'solid', 'single responsibility', 'open closed', 'open-closed',
                'liskov', 'interface segregation', 'dependency inversion', 'abstraction', 'inheritance',
                'polymorphism', 'encapsulation', 'composition', 'aggregation', 'association', 'relationship',
                'yagni'],
      },
      {
        title: 'Design Patterns',
        match: ['pattern', 'singleton', 'factory', 'builder', 'prototype', 'adapter', 'bridge', 'composite',
                'decorator', 'facade', 'flyweight', 'proxy', 'chain of responsibility', 'observer', 'strategy',
                'command', 'iterator', 'mediator', 'memento', 'visitor', 'template method', 'null object'],
      },
      {
        title: 'Case Studies',
        match: ['design a ', 'design an ', 'parking', 'elevator', 'tic tac', 'tic-tac', 'chess', 'snake',
                'ladder', 'splitwise', 'bookmyshow', 'book my show', 'movie', 'ticket', 'rate limiter', 'lru',
                'cache', 'atm machine', 'vending', 'library', 'hotel', 'cab booking', 'uber', 'zomato', 'swiggy', 'food',
                'amazon', 'flipkart', 'blinkit', 'logger', 'logging', 'notification', 'inventory', 'payment',
                'wallet', 'meeting', 'calendar', 'rating', 'machine coding', 'case study'],
      },
    ],
    // Check Case Studies first (so "Design Parking Lot using Strategy" lands there), then Patterns, then Foundations.
    groupPriority: [2, 1, 0],
    fallbackGroup: 'More lessons',
  },
];

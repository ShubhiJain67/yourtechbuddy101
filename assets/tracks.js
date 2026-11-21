/* Mock interview tracks: the ONE place that defines each track and its steps.
   Used by the API (bundled by wrangler), the interview page, the practice page, admin and home.
   To add a track or a step, edit only this file. Each step: id, name (UI), long (reports/AI), short, hint,
   template, expect (what the AI checks), kind ('diagram' | 'code' | 'twist' | text). */
(function (root) {
  const TRACKS = {
    lld: {
      key: 'lld', course: 'lld', label: 'LLD', tag: 'Low Level Design · classes & code', round: 'LLD round', icon: 'layers', time: '~45 min',
      title: 'LLD mock interviews',
      sub: 'Design the classes, draw the UML, write the code. An AI interviewer scores each step and asks a follow-up.',
      desc: 'Turn a vague problem like a parking lot or BookMyShow into clean classes: requirements, entities, a UML diagram with design patterns, working code, then a twist.',
      persona: 'You are a senior software engineer running a Low Level Design (LLD) interview for an SDE-2 role at an Indian product company.',
      twistRubric: 'code',
      twistJudge: 'Judge: does the change stay contained (good design) or force rewriting core classes (weak design)? Are concurrency/edge cases handled?',
      steps: [
        { id: 'requirements', name: 'Requirements', short: 'Scope & questions',
          expect: 'Clarifying questions, functional and non-functional requirements, and an explicit scope (what is in and out).',
          hint: 'Start like a real interview: ask clarifying questions, then list functional and non-functional requirements and say what you are keeping out of scope.',
          template: 'Clarifying questions:\n- \n\nFunctional requirements:\n- \n\nNon-functional requirements:\n- \n\nOut of scope:\n- ' },
        { id: 'entities', name: 'Entities', long: 'Entities & relationships', short: 'Classes & relationships',
          expect: 'Core classes/entities, their key attributes, and relationships between them (is-a / has-a, multiplicities).',
          hint: 'List the core classes with their key attributes, and how they relate (is-a / has-a, one-to-many).',
          template: 'Entities:\n- ClassName: attribute1, attribute2\n\nRelationships:\n- A has many B\n- C is a D' },
        { id: 'uml', kind: 'diagram', name: 'UML + patterns', long: 'UML + design patterns', short: 'Class diagram', mark: '%% ---- patterns ----',
          expect: 'A UML class diagram (Mermaid classDiagram syntax) and the design patterns used, each with a one-line reason.',
          diagramLabel: 'Class diagram (Mermaid)', notesLabel: 'Design patterns used, and why', notesPh: 'Strategy: lets the rule change without touching the main class&#10;Factory: …', emptyMsg: 'Write a classDiagram to see it here.',
          hint: 'Write a class diagram in Mermaid syntax (preview on the right), then name the design patterns you used and why.',
          template: 'classDiagram\n  class ClassA {\n    -field: Type\n    +method(arg) ReturnType\n  }\n  class ClassB\n  ClassA "1" *-- "many" ClassB : has' },
        { id: 'code', kind: 'code', name: 'Implementation', short: 'Core classes in code',
          expect: 'Code for the core classes and the key methods, consistent with the UML.',
          hint: 'Implement the core classes and the key methods. Focus on design (interfaces, responsibilities, thread safety), not boilerplate.' },
        { id: 'twist', kind: 'twist', name: 'The twist', short: 'Follow-up change',
          expect: "The candidate's answer to the interviewer's follow-up change: what changes in the design and code, and why the change stays contained.",
          hint: 'The interviewer changes the requirements based on your design. Explain what changes in your classes and code, and why the change stays small.',
          template: 'What changes:\n- \n\nNew/changed classes:\n- \n\nWhy the rest of the design stays the same:\n- ' },
      ],
    },
    hld: {
      key: 'hld', label: 'HLD', tag: 'High Level Design · system design', round: 'HLD round', icon: 'server', time: '~50 min',
      title: 'HLD mock interviews',
      sub: 'Design a system at scale: estimate, sketch the architecture, defend your trade-offs. Scored step by step by an AI interviewer.',
      desc: 'Design a system that serves millions, like WhatsApp or YouTube: requirements, capacity estimates, APIs and data model, architecture, scaling trade-offs, then a twist.',
      persona: 'You are a senior backend engineer running a High Level Design (system design) interview for an SDE-2/SDE-3 role at an Indian product company.',
      extraRules: '- Reward concrete numbers, named technologies with reasons, and explicit trade-offs. Penalise hand-waving like "we will scale it" without saying how.',
      twistRubric: 'deepdive',
      twistJudge: 'Judge: does the answer adapt the existing architecture sensibly, with concrete components and numbers, and discuss trade-offs and failure modes?',
      steps: [
        { id: 'requirements', name: 'Requirements', short: 'Scope & scale',
          expect: 'Clarifying questions, functional requirements, non-functional requirements (scale, latency, availability vs consistency, durability) and explicit scope.',
          hint: 'Ask clarifying questions, then list functional and non-functional requirements (scale, latency, availability vs consistency) and what is out of scope.',
          template: 'Clarifying questions:\n- \n\nFunctional requirements:\n- \n\nNon-functional requirements (scale, latency, availability, consistency):\n- \n\nOut of scope:\n- ' },
        { id: 'estimation', name: 'Estimation', long: 'Capacity estimation', short: 'Back-of-the-envelope',
          expect: 'Back-of-the-envelope numbers: users/DAU, read and write QPS (average and peak), storage over time, bandwidth, and what these numbers imply for the design.',
          hint: 'Rough numbers are fine. Show your working: users, read and write QPS (average and peak), storage over a few years, bandwidth, and what these numbers mean for the design.',
          template: 'Users / DAU:\n\nWrite QPS (avg, peak):\n\nRead QPS (avg, peak):\n\nStorage (per record x records x years):\n\nBandwidth:\n\nWhat this tells us:\n- ' },
        { id: 'api', name: 'APIs + data model', short: 'Endpoints, tables, DB',
          expect: 'The main API endpoints (method, path, request/response), the core tables/collections with keys, and the database choice (SQL/NoSQL/etc.) with a reason.',
          hint: 'List the main API endpoints, the core tables or collections with their keys, and which database you pick and why.',
          template: 'APIs:\n- POST /... \n- GET /... \n\nData model:\n- table_name(id PK, ...)\n\nDatabase choice and why:\n- ' },
        { id: 'architecture', kind: 'diagram', name: 'Architecture', long: 'High-level architecture', short: 'Component diagram', mark: '%% ---- walkthrough ----',
          expect: 'A component diagram (Mermaid flowchart syntax) of clients, load balancers, services, databases, caches, queues, CDN etc., plus a walkthrough of how the main request flows through it.',
          hint: 'Draw the high-level components as a Mermaid flowchart (preview on the right), then walk through how the main request flows through them.',
          diagramLabel: 'Architecture (Mermaid flowchart)', notesLabel: 'Walk through the main request', notesPh: '1. Client calls the load balancer…&#10;2. …', emptyMsg: 'Write a flowchart to see it here.',
          template: 'flowchart LR\n  C[Client] --> LB[Load balancer]\n  LB --> S[App service]\n  S --> Cache[(Cache)]\n  S --> DB[(Database)]' },
        { id: 'deepdive', name: 'Scale & trade-offs', short: 'Bottlenecks, CAP',
          expect: 'Bottlenecks and how to scale them: caching, sharding/partitioning keys, replication, queues/async processing, consistency choices (CAP/PACELC), failure handling and monitoring.',
          hint: 'Find the bottlenecks and fix them: caching, sharding keys, replication, queues, consistency choices (CAP / PACELC), what happens when a component fails.',
          template: 'Bottlenecks:\n- \n\nCaching:\n- \n\nSharding / partitioning:\n- \n\nReplication and consistency (CAP):\n- \n\nFailures and how we handle them:\n- ' },
        { id: 'twist', kind: 'twist', name: 'The twist', short: 'Follow-up change',
          expect: "The candidate's answer to the interviewer's follow-up: what changes in the architecture, which components are added or modified, and the trade-offs.",
          hint: 'The interviewer changes the requirements based on your design. Explain what changes in your architecture, which components you add or modify, and the trade-offs.',
          template: 'What changes:\n- \n\nNew / changed components:\n- \n\nTrade-offs:\n- ' },
      ],
    },
  };
  const KEYS = Object.keys(TRACKS);
  const get = (k) => TRACKS[k] || TRACKS[KEYS[0]];
  const valid = (k) => Object.prototype.hasOwnProperty.call(TRACKS, k);
  /* Label for each step's hidden checklist in Admin. */
  const rubricLabel = (t, s) => s.kind === 'twist' ? 'Follow-up ideas (the AI picks or adapts one for each candidate)'
    : `${s.long || s.name} checklist${s.id === t.twistRubric ? ' (also used to judge the twist answer)' : ''}`;
  const api = { TRACKS, KEYS, get, valid, rubricLabel };
  root.YTBTracks = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);

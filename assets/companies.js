/* Prepare by company: a DSA, LLD and HLD checklist per company. Used by companies/index.html and the search palette.
   Item strings: "*" prefix = must-do; "Name | hint" shows the hint under the item.
   lld/hld items can point at a mock interview on this site via `practice` (name -> problem slug). */
(function () {
  const LC = (s) => ['LeetCode', 'https://leetcode.com/problems/' + s + '/'];
  const GFG = (s) => ['GFG', 'https://www.geeksforgeeks.org/problems/' + s + '/1'];
  const NC = (s) => ['NeetCode (free)', 'https://neetcode.io/problems/' + s];
  const L = (label, url) => [label, url];

  const AMAZON = {
    key: 'amazon', name: 'Amazon',
    blurb: 'Graphs, trees and sliding window lead the DSA rounds. LLD expects clean classes, the right patterns and a concurrency trap handled. HLD leans on scale, queues and DynamoDB-style storage.',
    tips: [
      'Do every ⭐ before touching anything else. Non-⭐ items are a bonus, not a measure of whether you are on track.',
      'Stuck for more than 25 minutes? Read the solution, write a one-line note on the pattern, and move on.',
      'For LLD, say the concurrency trap out loud before the interviewer asks.',
    ],
    dsa: [
      { group: 'Most asked', sections: [
        { name: 'Asked again and again', items: ['*Number of Islands', '*Rotting Oranges', '*Course Schedule I', '*Course Schedule II', '*Pacific Atlantic Water Flow', '*Cycle detection – undirected (DFS + parent / DSU)', "*Cycle detection – directed (DFS rec stack / Kahn's)", '*Amount of Time for Binary Tree to Be Infected (LC 2385)', '*Diameter of Binary Tree', '*House Robber III'] },
      ] },
      { group: 'Graphs', sections: [
        { name: 'Templates (write from memory)', items: ['*BFS template', '*DFS template (recursive + iterative)', '*DSU (path compression + union by rank)', "*Topo sort (Kahn's + DFS)", '*Dijkstra'] },
        { name: 'Multi-source BFS', items: ['*01 Matrix', 'Walls and Gates', 'As Far from Land as Possible', 'Map of Highest Peak'] },
        { name: 'Grid DFS / BFS', items: ['Max Area of Island', '*Surrounded Regions', 'Number of Enclaves', 'Number of Distinct Islands', 'Word Search'] },
        { name: 'Topological sort', items: ['*Alien Dictionary', 'Find Eventual Safe States', 'Parallel Courses'] },
        { name: 'Shortest paths', items: ['*Shortest Path in Binary Matrix', '*Word Ladder', '*Network Delay Time', '*Path With Minimum Effort', 'Cheapest Flights Within K Stops', '0-1 BFS (concept)'] },
        { name: 'DSU', items: ['*Number of Provinces', '*Redundant Connection', '*Accounts Merge', 'Number of Operations to Make Network Connected', 'Most Stones Removed'] },
        { name: 'More graphs', items: ['Clone Graph', 'Is Graph Bipartite'] },
      ] },
      { group: 'Trees', sections: [
        { name: 'Traversals', items: ['*Inorder / Preorder / Postorder (recursive + iterative)', '*Level Order Traversal', '*Zigzag Level Order'] },
        { name: 'Views', items: ['*Right Side View', 'Left View', '*Top View', 'Bottom View', '*Vertical Order Traversal', 'Boundary Traversal'] },
        { name: 'Infection family (parent map + BFS)', items: ['*All Nodes Distance K', 'Burning Tree'] },
        { name: 'Tree DP', items: ['*Binary Tree Maximum Path Sum', 'Longest Univalue Path', 'Distribute Coins in Binary Tree', 'Binary Tree Cameras (optional)'] },
        { name: 'Tree classics', items: ['*Lowest Common Ancestor', 'Validate BST', '*Serialize / Deserialize Binary Tree', 'Construct Tree from Preorder + Inorder'] },
      ] },
      { group: 'Sliding window & two pointers', sections: [
        { name: 'Sliding window & two pointers', items: ['*Longest Substring Without Repeating Characters', '*Minimum Window Substring', '*Longest Repeating Character Replacement', 'Permutation in String', 'Max Consecutive Ones III', 'Fruit Into Baskets', '*Sliding Window Maximum', '*3Sum', 'Container With Most Water', '*Trapping Rain Water', 'Sort Colors'] },
      ] },
      { group: 'Binary search, heaps & DP', sections: [
        { name: 'Binary search', items: ['*Search in Rotated Sorted Array', 'Find Min in Rotated Sorted Array', '*First and Last Position', 'Find Peak Element', '*Koko Eating Bananas', '*Capacity to Ship Packages', 'Split Array Largest Sum', 'Min Days to Make Bouquets'] },
        { name: 'Priority queues', items: ['*Kth Largest Element', '*Top K Frequent Elements', '*K Closest Points to Origin', '*Merge K Sorted Lists', '*Find Median from Data Stream', 'Task Scheduler', 'Reorganize String', 'Meeting Rooms II'] },
        { name: '1D DP', items: ['Climbing Stairs', '*House Robber I', '*House Robber II', '*Coin Change', '*Word Break', '*Longest Increasing Subsequence', 'Decode Ways', 'Partition Equal Subset Sum'] },
        { name: '2D DP', items: ['*Unique Paths I / II', '*Minimum Path Sum', '*Longest Common Subsequence', '*Edit Distance', 'Longest Palindromic Subsequence', 'Maximal Square'] },
        { name: 'Final revision', items: ['*Re-solve your 5 weakest problems out loud, timed'] },
      ] },
    ],
    lld: [
      { group: 'Low level design', sections: [
        { name: 'Write full code: 45 min timed + 15 min review', items: [
          '*Parking Lot | ParkingLot → Floor → Spot, Vehicle, Ticket, Entry/Exit Gate · trap: two cars, one spot (lock / CAS on the spot)',
          '*Unix find / File Search | FileSearcher walks the tree with iterative DFS · point to make: new filter = new class, no edits (OCP)',
          '*Amazon Locker | LockerLocation → LockerSlot, Package, PickupCode · expiry job → return to sender · trap: two packages, same slot',
          '*Vending Machine | Inventory, Product, Coin enum · refund on cancel · point to make: why State beats if/else on a status field',
        ] },
        { name: 'Sketch only: 15 min each (entities, patterns, concurrency trap; no code)', items: [
          '*Book My Show | City → Theatre → Screen → Show → Seat · seat lock with 5–10 min TTL, confirm on payment · trap: two users, same seat',
          '*Rate Limiter | ConcurrentHashMap<userId, Bucket> · thread-safe refill · reject with 429',
          '*Customer Reviews for Amazon products | Product → Review, Rating, HelpfulVote · running average, no full recompute',
          'Splitwise | User, Group, Expense, BalanceSheet (userId → userId → amount) · simplify debts with min/max heap',
          'Quick Commerce | Cart, Inventory per dark store · reserve stock at checkout · trap: two carts, last unit',
          'Hotel Reservation System | Same core as Book My Show · Hotel → Room (type) · availability by date range · trap: overlapping bookings, same room',
          'IRCTC | Same core as Book My Show · Train → Coach → Seat, availability per route segment · trap: same seat on overlapping segments',
        ] },
      ] },
    ],
    hld: [
      { group: 'High level design', sections: [
        { name: 'Core designs: 45 min each, out loud', items: [
          '*Search Autocomplete | Amazon search box · trie with top-K per prefix, built offline from search logs, served from cache · trap: hot prefixes',
          '*Distributed Rate Limiter | Token bucket in Redis with atomic Lua / INCR + TTL · per user and per API tier · trap: race between nodes',
          '*Notification System | Order updates, OTP, delivery alerts · queue per channel (SQS/Kafka), retries + dead-letter queue · trap: sending twice (idempotency key)',
          '*Payment System | Order → Payment → Ledger · idempotent APIs, double-entry ledger, reconcile with the gateway · trap: retries charging twice',
          '*Distributed Cache / Key-Value Store | DynamoDB-style: consistent hashing, replication, quorum reads/writes · trap: hot keys',
          '*URL Shortener | Base62 IDs, read-heavy, cache in front of the DB · trap: ID collisions across servers',
        ] },
        { name: 'Amazon-flavoured', items: [
          'Real-time Leaderboard | Best-sellers per category · Redis sorted sets, sharded by category',
          'Distributed Job Scheduler | Order timeouts, return-window expiry · time-bucketed queue + workers, at-least-once with idempotent jobs',
          'Web Crawler | Price tracking across sellers · URL frontier, politeness per domain, dedupe with a bloom filter',
          'Metrics Monitoring & Alerting | CloudWatch-like · time-series store, downsampling, alert rules evaluated on a stream',
          'Video Streaming | Prime Video · upload → transcode pipeline, adaptive bitrate, CDN',
          'Cloud File Storage | S3 / Drive · chunked uploads, metadata DB separate from blob storage, dedupe by hash',
        ] },
        { name: 'Concepts to revise (no practice link)', items: [
          '*Consistent hashing + virtual nodes',
          '*CAP, quorum (R + W > N) and eventual consistency',
          '*Queues: SQS vs Kafka, at-least-once delivery, idempotent consumers',
          '*Caching: cache-aside, write-through, TTLs, stampede protection',
          'Sharding and hot partitions',
          'SQL vs NoSQL: when DynamoDB fits and when it doesn\'t',
        ] },
      ] },
    ],
    // mock interviews on this site (problem slugs), by item name. "~" = closest match, not the same problem.
    practice: {
      'Parking Lot': 'parking-lot', 'Vending Machine': 'vending-machine', 'Book My Show': 'bookmyshow', 'Rate Limiter': 'rate-limiter',
      'Splitwise': 'splitwise', 'Quick Commerce': '~shopping-cart', 'Hotel Reservation System': 'hotel-booking', 'IRCTC': '~bookmyshow',
      'Search Autocomplete': 'typeahead', 'Distributed Rate Limiter': 'distributed-rate-limiter', 'Notification System': 'notification-system',
      'Payment System': 'payment-system', 'Distributed Cache / Key-Value Store': 'distributed-cache', 'URL Shortener': 'url-shortener',
      'Real-time Leaderboard': 'leaderboard', 'Distributed Job Scheduler': 'job-scheduler', 'Web Crawler': 'web-crawler',
      'Metrics Monitoring & Alerting': 'metrics-monitoring', 'Video Streaming': 'video-streaming', 'Cloud File Storage': 'cloud-storage',
    },
    // pattern → where in the system → why
    patterns: {
      'Parking Lot': [['Singleton', 'ParkingLot', 'One lot instance shared by every gate (make getInstance thread-safe)'], ['Factory', 'VehicleFactory, ParkingSpotFactory', 'Create Car/Bike/Truck or Compact/Large/EV spot from a type, no scattered new'], ['Strategy', 'SpotAllocationStrategy (NearestFirst, ByFloor)', 'Swap how a spot is picked at entry'], ['Strategy', 'PricingStrategy (Hourly, Flat, Weekend)', 'Swap how the fee is calculated at exit']],
      'Unix find / File Search': [['Composite', 'FileSystemNode → File, Directory (holds children)', 'Treat a file and a folder the same while walking the tree'], ['Specification', 'Filter: SizeFilter, ExtensionFilter, NameFilter + AndFilter / OrFilter / NotFilter', 'Combine search rules; each rule is its own class'], ['Builder', 'SearchQuery.builder().minSize(..).ext(..).build()', 'Build a query with many optional filters cleanly']],
      'Amazon Locker': [['Factory', 'LockerSlotFactory', 'Create Small / Medium / Large slots'], ['Strategy', 'SlotAssignmentStrategy (SmallestFit, NearestLocation)', 'Swap which slot a package gets'], ['State', 'LockerSlot: AVAILABLE → RESERVED → OCCUPIED', 'Block wrong actions, e.g. dropping into an occupied slot'], ['Observer', 'NotificationService subscribed to package events', 'Send OTP on drop-off, reminder before expiry']],
      'Vending Machine': [['Singleton', 'VendingMachine', 'One machine owning inventory and cash'], ['State', 'VendingState: IdleState, HasMoneyState, DispensingState, OutOfStockState', 'Each state decides what insertCoin / select / cancel do'], ['Strategy', 'ChangeStrategy (Greedy)', 'Swap how change is returned']],
      'Book My Show': [['Singleton', 'SeatLockManager', 'One place holding all seat locks'], ['State', 'Booking: PENDING → CONFIRMED / CANCELLED / EXPIRED', 'Only valid lifecycle transitions'], ['Strategy', 'PricingStrategy (weekday, weekend, seat type), PaymentStrategy (UPI, card)', 'Swap pricing and payment method'], ['Observer', 'NotificationService on booking events', 'Ticket confirmation by SMS / email']],
      'Rate Limiter': [['Strategy', 'RateLimitAlgorithm: TokenBucket, SlidingWindowLog, FixedWindow', 'Swap algorithm without touching callers'], ['Factory', 'RateLimiterFactory.create(config)', 'Pick algorithm per API or user tier from config'], ['Singleton', 'RateLimiterRegistry', 'One shared map of per-user buckets']],
      'Customer Reviews for Amazon products': [['Observer', 'RatingAggregator listens to ReviewPublished', 'Update average + count without ReviewService knowing about it'], ['Strategy', 'ReviewSortStrategy (MostHelpful, MostRecent, Rating)', 'Swap sort order on the product page'], ['Chain of Responsibility', 'ModerationHandler: Profanity → Spam → VerifiedPurchase', 'Each check passes or rejects; add checks without edits'], ['State', 'Review: PENDING → APPROVED / REJECTED', 'Controls what is shown or editable']],
      'Splitwise': [['Factory', 'ExpenseFactory.create(type, ..)', 'Build EqualExpense / ExactExpense / PercentExpense'], ['Strategy', 'SplitStrategy: Equal, Exact, Percent', 'How the amount is split + validation that it sums up'], ['Observer', 'Group members on new expense', 'Notify everyone involved']],
      'Quick Commerce': [['Factory', 'PaymentFactory', 'Create UPI / card / COD payment objects'], ['State', 'Order: PLACED → PACKED → OUT_FOR_DELIVERY → DELIVERED / CANCELLED', 'Only valid status transitions'], ['Strategy', 'DarkStoreSelectionStrategy, RiderAssignmentStrategy', 'Swap nearest vs least-loaded logic'], ['Observer', 'Customer app + rider app on order status', 'Live order tracking']],
      'Hotel Reservation System': [['Builder', 'Booking.builder().guest(..).room(..).dates(..).build()', 'Booking has many optional fields'], ['State', 'Booking: RESERVED → CHECKED_IN → CHECKED_OUT / CANCELLED', 'Lifecycle rules'], ['Strategy', 'PricingStrategy (seasonal, weekend), CancellationPolicy (free, partial, none)', 'Swap pricing and refund rules'], ['Observer', 'NotificationService on booking / cancel', 'Confirmation and reminders']],
      'IRCTC': [['Builder', 'Ticket builder with passenger list', 'Many passengers + optional fields per PNR'], ['State', 'Passenger status: WL → RAC → CNF / CANCELLED', 'Valid status moves'], ['Strategy', 'QuotaStrategy (General, Tatkal, Ladies), FareStrategy', 'Swap quota and fare rules'], ['Observer', 'WaitlistManager listens to cancellations', 'Promote the next WL/RAC passenger automatically']],
    },
    premium: ['Walls and Gates', 'Number of Distinct Islands', 'Alien Dictionary', 'Parallel Courses', 'Boundary Traversal', 'Meeting Rooms II'],
    links: {
      'Number of Islands': [LC('number-of-islands')], 'Rotting Oranges': [LC('rotting-oranges')], 'Course Schedule I': [LC('course-schedule')], 'Course Schedule II': [LC('course-schedule-ii')],
      'Pacific Atlantic Water Flow': [LC('pacific-atlantic-water-flow')],
      'Cycle detection – undirected (DFS + parent / DSU)': [GFG('detect-cycle-in-an-undirected-graph')], "Cycle detection – directed (DFS rec stack / Kahn's)": [GFG('detect-cycle-in-a-directed-graph')],
      'Amount of Time for Binary Tree to Be Infected (LC 2385)': [LC('amount-of-time-for-binary-tree-to-be-infected')], 'Diameter of Binary Tree': [LC('diameter-of-binary-tree')], 'House Robber III': [LC('house-robber-iii')],
      '01 Matrix': [LC('01-matrix')], 'Walls and Gates': [LC('walls-and-gates'), NC('islands-and-treasure')], 'As Far from Land as Possible': [LC('as-far-from-land-as-possible')], 'Map of Highest Peak': [LC('map-of-highest-peak')],
      'Max Area of Island': [LC('max-area-of-island')], 'Surrounded Regions': [LC('surrounded-regions')], 'Number of Enclaves': [LC('number-of-enclaves')],
      'Number of Distinct Islands': [LC('number-of-distinct-islands'), GFG('number-of-distinct-islands')], 'Word Search': [LC('word-search')],
      'Alien Dictionary': [LC('alien-dictionary'), NC('foreign-dictionary')], 'Find Eventual Safe States': [LC('find-eventual-safe-states')], 'Parallel Courses': [LC('parallel-courses')],
      'Shortest Path in Binary Matrix': [LC('shortest-path-in-binary-matrix')], 'Word Ladder': [LC('word-ladder')], 'Network Delay Time': [LC('network-delay-time')], 'Path With Minimum Effort': [LC('path-with-minimum-effort')],
      'Cheapest Flights Within K Stops': [LC('cheapest-flights-within-k-stops')], 'Number of Provinces': [LC('number-of-provinces')], 'Redundant Connection': [LC('redundant-connection')], 'Accounts Merge': [LC('accounts-merge')],
      'Number of Operations to Make Network Connected': [LC('number-of-operations-to-make-network-connected')], 'Most Stones Removed': [LC('most-stones-removed-with-same-row-or-column')],
      'Clone Graph': [LC('clone-graph')], 'Is Graph Bipartite': [LC('is-graph-bipartite')],
      'Inorder / Preorder / Postorder (recursive + iterative)': [L('In', 'https://leetcode.com/problems/binary-tree-inorder-traversal/'), L('Pre', 'https://leetcode.com/problems/binary-tree-preorder-traversal/'), L('Post', 'https://leetcode.com/problems/binary-tree-postorder-traversal/')],
      'Level Order Traversal': [LC('binary-tree-level-order-traversal')], 'Zigzag Level Order': [LC('binary-tree-zigzag-level-order-traversal')], 'Right Side View': [LC('binary-tree-right-side-view')],
      'Left View': [GFG('left-view-of-binary-tree')], 'Top View': [GFG('top-view-of-binary-tree')], 'Bottom View': [GFG('bottom-view-of-binary-tree')],
      'Vertical Order Traversal': [LC('vertical-order-traversal-of-a-binary-tree')], 'Boundary Traversal': [LC('boundary-of-binary-tree'), GFG('boundary-traversal-of-binary-tree')],
      'All Nodes Distance K': [LC('all-nodes-distance-k-in-binary-tree')], 'Burning Tree': [GFG('burning-tree')], 'Binary Tree Maximum Path Sum': [LC('binary-tree-maximum-path-sum')],
      'Longest Univalue Path': [LC('longest-univalue-path')], 'Distribute Coins in Binary Tree': [LC('distribute-coins-in-binary-tree')], 'Binary Tree Cameras (optional)': [LC('binary-tree-cameras')],
      'Lowest Common Ancestor': [LC('lowest-common-ancestor-of-a-binary-tree')], 'Validate BST': [LC('validate-binary-search-tree')], 'Serialize / Deserialize Binary Tree': [LC('serialize-and-deserialize-binary-tree')],
      'Construct Tree from Preorder + Inorder': [LC('construct-binary-tree-from-preorder-and-inorder-traversal')],
      'Longest Substring Without Repeating Characters': [LC('longest-substring-without-repeating-characters')], 'Minimum Window Substring': [LC('minimum-window-substring')],
      'Longest Repeating Character Replacement': [LC('longest-repeating-character-replacement')], 'Permutation in String': [LC('permutation-in-string')], 'Max Consecutive Ones III': [LC('max-consecutive-ones-iii')],
      'Fruit Into Baskets': [LC('fruit-into-baskets')], 'Sliding Window Maximum': [LC('sliding-window-maximum')], '3Sum': [LC('3sum')], 'Container With Most Water': [LC('container-with-most-water')],
      'Trapping Rain Water': [LC('trapping-rain-water')], 'Sort Colors': [LC('sort-colors')],
      'Search in Rotated Sorted Array': [LC('search-in-rotated-sorted-array')], 'Find Min in Rotated Sorted Array': [LC('find-minimum-in-rotated-sorted-array')],
      'First and Last Position': [LC('find-first-and-last-position-of-element-in-sorted-array')], 'Find Peak Element': [LC('find-peak-element')], 'Koko Eating Bananas': [LC('koko-eating-bananas')],
      'Capacity to Ship Packages': [LC('capacity-to-ship-packages-within-d-days')], 'Split Array Largest Sum': [LC('split-array-largest-sum')], 'Min Days to Make Bouquets': [LC('minimum-number-of-days-to-make-m-bouquets')],
      'Kth Largest Element': [LC('kth-largest-element-in-an-array')], 'Top K Frequent Elements': [LC('top-k-frequent-elements')], 'K Closest Points to Origin': [LC('k-closest-points-to-origin')],
      'Merge K Sorted Lists': [LC('merge-k-sorted-lists')], 'Find Median from Data Stream': [LC('find-median-from-data-stream')], 'Task Scheduler': [LC('task-scheduler')], 'Reorganize String': [LC('reorganize-string')],
      'Meeting Rooms II': [LC('meeting-rooms-ii'), NC('meeting-schedule-ii')],
      'Climbing Stairs': [LC('climbing-stairs')], 'House Robber I': [LC('house-robber')], 'House Robber II': [LC('house-robber-ii')], 'Coin Change': [LC('coin-change')], 'Word Break': [LC('word-break')],
      'Longest Increasing Subsequence': [LC('longest-increasing-subsequence')], 'Decode Ways': [LC('decode-ways')], 'Partition Equal Subset Sum': [LC('partition-equal-subset-sum')],
      'Unique Paths I / II': [L('I', 'https://leetcode.com/problems/unique-paths/'), L('II', 'https://leetcode.com/problems/unique-paths-ii/')], 'Minimum Path Sum': [LC('minimum-path-sum')],
      'Longest Common Subsequence': [LC('longest-common-subsequence')], 'Edit Distance': [LC('edit-distance')], 'Longest Palindromic Subsequence': [LC('longest-palindromic-subsequence')], 'Maximal Square': [LC('maximal-square')],
    },
    // this site's own pages for some DSA items
    site: { 'Sort Colors': 'dsa/?t=sort-012', 'Merge K Sorted Lists': 'dsa/?t=merge-two-sorted-lists', 'Kth Largest Element': 'dsa/?t=quick-sort' },
  };

  const LIST = [AMAZON];
  const TRACKS = [['dsa', 'DSA'], ['lld', 'LLD'], ['hld', 'HLD']];

  /* Flatten one company's track into groups → sections → items with stable ids. */
  function items(co, track) {
    return (co[track] || []).map((g) => ({
      group: g.group,
      sections: g.sections.map((s) => ({
        name: s.name,
        items: s.items.map((raw) => {
          const star = raw.startsWith('*'), body = star ? raw.slice(1) : raw;
          const [name, hint] = body.split(' | ');
          const p = (co.practice || {})[name];
          return {
            id: `${track}:${name}`, name, hint: hint || '', star,
            links: (co.links || {})[name] || [], premium: (co.premium || []).includes(name), site: (co.site || {})[name] || null,
            practice: p ? { slug: p.replace(/^~/, ''), closest: p.startsWith('~') } : null,
            patterns: (co.patterns || {})[name] || [],
          };
        }),
      })),
    }));
  }

  window.YTBCompanies = { list: LIST, tracks: TRACKS, get: (k) => LIST.find((c) => c.key === k) || null, items };
})();

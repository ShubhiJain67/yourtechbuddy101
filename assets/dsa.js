/* DSA topics: data + step-by-step visualizers. Used by dsa/index.html and the search palette.
   Each visualizer is a generator over an array that yields frames { a, mark: {index: class}, note }. */
(function () {
  const O = (best, avg, worst, space, stable, inPlace) => ({ best, avg, worst, space, stable, inPlace });

  const T = [
    /* ---------- Sorting ---------- */
    { key: 'bubble-sort', name: 'Bubble Sort', cat: 'Sorting', viz: 'bubble', videos: { hi: 'LqCjI9_Uc3w', en: 'euL-Dk2PPgw' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Sorting/BubbleSort.java',
      intent: 'Walk the array again and again, swapping neighbours that are out of order, until a pass makes no swaps.',
      when: 'Teaching, tiny arrays, or data that is already almost sorted (with the early-exit check it finishes in one pass).',
      cx: O('O(n)', 'O(n²)', 'O(n²)', 'O(1)', true, true),
      practice: { title: 'Bubble sort with early exit', ask: 'Sort {5, 2, 9, 1, 5, 6} with bubble sort, but stop as soon as a full pass makes no swaps. Print the sorted array and how many passes ran.', expect: ['sorted: [1, 2, 5, 5, 6, 9]', 'passes: 4'] } },
    { key: 'selection-sort', name: 'Selection Sort', cat: 'Sorting', viz: 'selection', videos: { hi: 'dT-ewRrj3yc', en: 'f1VldLH6lsg' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Sorting/SelectionSort.java',
      intent: 'Find the smallest element in the unsorted part and swap it to the front. Repeat for the rest.',
      when: 'When writes are expensive: it does at most n − 1 swaps, fewer than any other simple sort.',
      cx: O('O(n²)', 'O(n²)', 'O(n²)', 'O(1)', false, true),
      practice: { title: 'Selection sort, descending', ask: 'Change selection sort so it sorts {5, 2, 9, 1, 5, 6} from largest to smallest by selecting the maximum each round.', expect: ['[9, 6, 5, 5, 2, 1]'] } },
    { key: 'insertion-sort', name: 'Insertion Sort', cat: 'Sorting', viz: 'insertion', videos: { hi: 'beTywE4oUvc', en: '4154gxLtGtA' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Sorting/InsertionSort.java',
      intent: 'Take the next element and shift it left into its place among the already-sorted elements, like sorting cards in your hand.',
      when: 'Small or nearly sorted arrays. Real libraries use it for short runs inside merge sort and quick sort.',
      cx: O('O(n)', 'O(n²)', 'O(n²)', 'O(1)', true, true),
      practice: { title: 'Count the shifts', ask: 'Run insertion sort on {5, 2, 9, 1, 5, 6} and count how many times an element is shifted one place to the right.', expect: ['sorted: [1, 2, 5, 5, 6, 9]', 'shifts: 6'] } },
    { key: 'merge-sort', name: 'Merge Sort', cat: 'Sorting', viz: 'mergeSort', videos: { hi: 'nqmMbnexrNA', en: 'K82waOHhZpk' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Sorting/MergeSort.java',
      intent: 'Split the array in half, sort each half, then merge the two sorted halves. Divide and conquer.',
      when: 'You need guaranteed O(n log n) and a stable sort, or you are sorting linked lists or data too big for memory.',
      cx: O('O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', true, false),
      practice: { title: 'Count inversions', ask: 'An inversion is a pair i < j with a[i] > a[j]. Use merge sort to count the inversions in {5, 2, 9, 1, 5, 6} in O(n log n).', expect: ['inversions: 6'] } },
    { key: 'quick-sort', name: 'Quick Sort', cat: 'Sorting', viz: 'quick', videos: { hi: 'SDTCghBEBTM', en: 'DSPWt95Lri8' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Sorting/QuickSort.java',
      intent: 'Pick a pivot, partition so smaller elements go left and larger go right, then sort both sides the same way.',
      when: 'General-purpose in-memory sorting. Fast in practice; pick a random pivot to avoid the O(n²) worst case.',
      cx: O('O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', false, true),
      practice: { title: 'Kth smallest with quickselect', ask: 'Find the 3rd smallest element of {5, 2, 9, 1, 5, 6} without fully sorting: partition, then recurse only into the side that holds index k − 1.', expect: ['3rd smallest: 5'] } },
    { key: 'heap-sort', name: 'Heap Sort', cat: 'Sorting', viz: 'heap', videos: { hi: 'ituRbhZb0wc', en: 'OHM6H1P5pAQ' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Sorting/HeapSort.java',
      intent: 'Build a max-heap, then repeatedly swap the root (the largest) to the end and fix the heap for the rest.',
      when: 'You need O(n log n) worst case with O(1) extra space. Heaps also power priority queues and top-K problems.',
      cx: O('O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', false, true),
      practice: { title: 'Top 3 largest', ask: 'Print the 3 largest numbers of {5, 2, 9, 1, 5, 6} in descending order using a min-heap of size 3 (PriorityQueue).', expect: ['[9, 6, 5]'] } },
    { key: 'counting-sort', name: 'Counting Sort', cat: 'Sorting', viz: 'counting', videos: { hi: 'fO9Hi6AtpjQ', en: '49ijczGRR2Y' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Sorting/CountingSort.java',
      intent: 'Count how many times each value appears, then write the values back in order. No comparisons at all.',
      when: 'Integers or keys in a small known range, like ages, grades or characters.',
      cx: O('O(n + k)', 'O(n + k)', 'O(n + k)', 'O(n + k)', true, false),
      practice: { title: 'Sort the letters of a word', ask: 'Use counting sort over the 26 lowercase letters to sort the characters of "banana".', expect: ['aaabnn'] } },
    { key: 'sorting-compared', name: 'All Sorts Compared', cat: 'Sorting', viz: null, videos: { hi: 'oxAYBeLG51I', en: 'zzSiKWvXi8A' },
      code: 'https://github.com/ShubhiJain67/YouTube/',
      intent: 'Every sort side by side: time, space, stability and when to reach for each one.',
      when: 'Interviews love "which sort would you use and why". Stability, memory and the shape of the data decide it.',
      cx: null,
      practice: { title: 'Stable sort by age', ask: 'Sort (Asha,25), (Bob,22), (Chen,25), (Dev,22) by age so people with the same age keep their original order. Which of the sorts on this page could you use?', expect: ['Bob 22', 'Dev 22', 'Asha 25', 'Chen 25'] } },

    /* ---------- Building blocks ---------- */
    { key: 'merge-algorithm', name: 'Merge Algorithm', cat: 'Building blocks', viz: 'merge', videos: { hi: '1esTEh7ZN74', en: 'UbDFG7IDWAY' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Algorithms/Merge.java',
      intent: 'Combine two sorted arrays into one sorted array by repeatedly taking the smaller front element.',
      when: 'The heart of merge sort, and of problems like merging sorted lists, intervals or log files.',
      cx: O('O(n + m)', 'O(n + m)', 'O(n + m)', 'O(n + m)', true, false),
      practice: { title: 'Merge three sorted arrays', ask: 'Merge {1, 4, 7}, {2, 5, 8} and {3, 6, 9} into one sorted array in a single pass with three pointers.', expect: ['[1, 2, 3, 4, 5, 6, 7, 8, 9]'] } },
    { key: 'partition', name: 'Partition Algorithm', cat: 'Building blocks', viz: 'partition', videos: { hi: 'lRv4MTkBx6A', en: 'e8X8jYxZxSw' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/Algorithms/Partition.java',
      intent: 'Rearrange around a pivot so everything smaller sits on its left and everything larger on its right, in one pass.',
      when: 'The heart of quick sort and quickselect, and of "move all X to one side" problems.',
      cx: O('O(n)', 'O(n)', 'O(n)', 'O(1)', false, true),
      practice: { title: 'Negatives to the left', ask: 'Rearrange {3, -1, 4, -5, 9, -2} in place so every negative number comes before every positive one, in one pass.', expect: ['first 3 are negative: true'] } },

    /* ---------- Problems ---------- */
    { key: 'sort-012', name: "Sort 0s, 1s and 2s", cat: 'Problems', viz: 'dutch', videos: { en: 'd50nGwy_WCc' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/GeeksForGeeks/SortArrayOf0s1s2s.java',
      intent: 'Sort an array of only 0s, 1s and 2s in one pass with three pointers (the Dutch national flag algorithm).',
      when: 'Any three-way split: low / middle / high, or partitioning around a pivot that appears many times.',
      cx: O('O(n)', 'O(n)', 'O(n)', 'O(1)', false, true),
      practice: { title: 'Evens before odds', ask: 'Rearrange {12, 7, 4, 9, 10, 3} in place so all even numbers come first, using two pointers in one pass.', expect: ['evens then odds: true'] } },
    { key: 'merge-without-extra-space', name: 'Merge Without Extra Space', cat: 'Problems', viz: 'gap', videos: { en: 'HjoA15ocpT4' },
      code: 'https://github.com/ShubhiJain67/YouTube/blob/master/GeeksForGeeks/MergeWithoutExtraSpace.java',
      intent: 'Merge two sorted arrays in place so the first holds the smallest values, using the shrinking-gap method.',
      when: 'Memory is tight and you must merge without a third array.',
      cx: O('O((n+m) log(n+m))', 'O((n+m) log(n+m))', 'O((n+m) log(n+m))', 'O(1)', false, true),
      practice: { title: 'Merge in place', ask: 'Given a = {1, 4, 7, 8, 10} and b = {2, 3, 9}, rearrange without a third array so a holds the 5 smallest and b the rest, both sorted.', expect: ['a: [1, 2, 3, 4, 7]', 'b: [8, 9, 10]'] } },
    { key: 'merge-two-sorted-lists', name: 'Merge Two Sorted Lists', cat: 'Problems', viz: 'merge', videos: { en: 'g05Kn8FxVGc' },
      code: 'https://github.com/ShubhiJain67/LeetCode/blob/master/Easy/251_MergeTwoSortedLists.java',
      intent: 'Splice two sorted linked lists into one by always linking the smaller head next (LeetCode 21).',
      when: 'Linked-list merging, and the building block of merge K sorted lists.',
      cx: O('O(n + m)', 'O(n + m)', 'O(n + m)', 'O(1)', true, true),
      practice: { title: 'Merge K sorted lists', ask: 'Merge the lists [1, 4, 5], [1, 3, 4] and [2, 6] into one sorted list. Try a min-heap of the current heads.', expect: ['[1, 1, 2, 3, 4, 4, 5, 6]'] } },

    /* ---------- Graphs (interactive + code; no videos yet) ---------- */
    { key: 'bfs', name: "Breadth-First Search (BFS)", cat: 'Graphs', viz: 'bfs', graph: true, weighted: false, videos: {}, code: null,
      intent: "Explore level by level from a start node using a queue. In an unweighted graph it finds the fewest hops to every node.",
      when: "Shortest path when every edge costs the same: grids, word ladders, \u201cminimum moves\u201d, rotting oranges, multi-source spread.",
      cx: { time: 'O(V + E)', space: 'O(V)', graph: 'Any, unweighted' }, java: "import java.util.*;\n\n// Breadth-first search: visit nodes level by level from a start node.\n// Also gives the shortest number of edges (hops) to every node in an unweighted graph.\nclass Main {\n    static List<List<Integer>> graph(int n, int[][] edges) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); } // undirected\n        return adj;\n    }\n\n    static int[] bfs(List<List<Integer>> adj, int start) {\n        int[] dist = new int[adj.size()];\n        Arrays.fill(dist, -1);                 // -1 = not visited yet\n        Deque<Integer> queue = new ArrayDeque<>();\n        dist[start] = 0;\n        queue.add(start);\n        while (!queue.isEmpty()) {\n            int u = queue.poll();\n            System.out.print((char) ('A' + u) + \" \");\n            for (int v : adj.get(u)) {\n                if (dist[v] == -1) {           // mark when queued, not when popped\n                    dist[v] = dist[u] + 1;\n                    queue.add(v);\n                }\n            }\n        }\n        System.out.println();\n        return dist;\n    }\n\n    public static void main(String[] args) {\n        // A=0 B=1 C=2 D=3 E=4 F=5 G=6\n        int[][] edges = {{0,1},{0,2},{1,2},{1,3},{2,4},{3,4},{3,5},{4,5},{5,6}};\n        System.out.print(\"Visit order: \");\n        int[] dist = bfs(graph(7, edges), 0);\n        System.out.println(\"Hops from A: \" + Arrays.toString(dist));\n    }\n}\n",
      practice: { title: "Count connected components", ask: "Given n = 7 and edges 0-1, 1-2, 3-4, count how many separate groups of nodes there are using BFS (start a new BFS from every unvisited node).", expect: ["components: 4"] } },
    { key: 'dfs', name: "Depth-First Search (DFS)", cat: 'Graphs', viz: 'dfs', graph: true, weighted: false, videos: {}, code: null,
      intent: "Go as deep as possible along one path, then backtrack. Recursion or an explicit stack does the bookkeeping.",
      when: "Exploring every path or region: islands, flood fill, cycle checks, topological order, connected components, backtracking.",
      cx: { time: 'O(V + E)', space: 'O(V)', graph: 'Any' }, java: "import java.util.*;\n\n// Depth-first search: go as deep as possible along one path, then backtrack.\n// Shown both recursively and with an explicit stack.\nclass Main {\n    static List<List<Integer>> adj = new ArrayList<>();\n    static boolean[] seen;\n\n    static void dfs(int u) {\n        seen[u] = true;\n        System.out.print((char) ('A' + u) + \" \");\n        for (int v : adj.get(u)) if (!seen[v]) dfs(v);\n    }\n\n    static void dfsIterative(int start) {\n        boolean[] visited = new boolean[adj.size()];\n        Deque<Integer> stack = new ArrayDeque<>();\n        stack.push(start);\n        while (!stack.isEmpty()) {\n            int u = stack.pop();\n            if (visited[u]) continue;\n            visited[u] = true;\n            System.out.print((char) ('A' + u) + \" \");\n            List<Integer> next = adj.get(u);\n            for (int i = next.size() - 1; i >= 0; i--) if (!visited[next.get(i)]) stack.push(next.get(i)); // keep the same order as recursion\n        }\n    }\n\n    public static void main(String[] args) {\n        int n = 7; // A..G\n        int[][] edges = {{0,1},{0,2},{1,2},{1,3},{2,4},{3,4},{3,5},{4,5},{5,6}};\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }\n        seen = new boolean[n];\n        System.out.print(\"Recursive: \");\n        dfs(0);\n        System.out.print(\"\\nIterative: \");\n        dfsIterative(0);\n        System.out.println();\n    }\n}\n",
      practice: { title: "Does a path exist?", ask: "n = 6, edges 0-1, 0-2, 3-5, 5-4, 4-3. Use DFS to check whether you can reach 5 from 0, and 2 from 0.", expect: ["0 -> 5: false", "0 -> 2: true"] } },
    { key: 'topological-sort', name: "Topological Sort (Kahn's)", cat: 'Graphs', viz: 'topo', graph: true, weighted: false, videos: {}, code: null,
      intent: "Order the nodes of a directed acyclic graph so every edge points forward. Repeatedly take a node with no incoming edges.",
      when: "Ordering with prerequisites: course schedules, build steps, task pipelines. If not every node comes out, there is a cycle.",
      cx: { time: 'O(V + E)', space: 'O(V)', graph: 'Directed, acyclic' }, java: "import java.util.*;\n\n// Topological sort (Kahn's algorithm): repeatedly take a node with no incoming edges.\n// Works only on a directed acyclic graph; if not every node comes out, there is a cycle.\nclass Main {\n    static List<Integer> topoSort(int n, int[][] edges) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        int[] indegree = new int[n];\n        for (int[] e : edges) { adj.get(e[0]).add(e[1]); indegree[e[1]]++; }\n\n        Deque<Integer> queue = new ArrayDeque<>();\n        for (int i = 0; i < n; i++) if (indegree[i] == 0) queue.add(i);\n\n        List<Integer> order = new ArrayList<>();\n        while (!queue.isEmpty()) {\n            int u = queue.poll();\n            order.add(u);\n            for (int v : adj.get(u)) if (--indegree[v] == 0) queue.add(v);\n        }\n        return order.size() == n ? order : null; // null = the graph has a cycle\n    }\n\n    public static void main(String[] args) {\n        // A->B, A->C, B->D, C->D, C->E, D->F, E->F, F->G\n        int[][] edges = {{0,1},{0,2},{1,3},{2,3},{2,4},{3,5},{4,5},{5,6}};\n        StringBuilder sb = new StringBuilder(\"Order: \");\n        for (int u : topoSort(7, edges)) sb.append((char) ('A' + u)).append(' ');\n        System.out.println(sb.toString().trim());\n        int[][] withCycle = {{0,1},{1,2},{2,0}};\n        System.out.println(\"With a cycle: \" + topoSort(3, withCycle));\n    }\n}\n",
      practice: { title: "Course Schedule II", ask: "4 courses; to take 1 you need 0, for 2 you need 0, for 3 you need 1 and 2. Print one valid order to take all courses.", expect: ["[0, 1, 2, 3]"] } },
    { key: 'cycle-detection', name: "Cycle Detection (Directed)", cat: 'Graphs', viz: 'cycle', graph: true, weighted: false, videos: {}, code: null,
      intent: "DFS with three colours: white (new), gray (on the current path), black (finished). Meeting a gray node again is a back edge, which means a cycle.",
      when: "Deadlock and dependency checks, \u201ccan all courses be finished\u201d, validating that a graph is a DAG.",
      cx: { time: 'O(V + E)', space: 'O(V)', graph: 'Directed' }, java: "import java.util.*;\n\n// Cycle detection in a directed graph with DFS and three colours:\n// WHITE = not visited, GRAY = on the current DFS path, BLACK = finished.\n// Reaching a GRAY node again means we found a back edge, so there is a cycle.\nclass Main {\n    static final int WHITE = 0, GRAY = 1, BLACK = 2;\n    static List<List<Integer>> adj = new ArrayList<>();\n    static int[] color;\n\n    static boolean dfs(int u) {\n        color[u] = GRAY;\n        for (int v : adj.get(u)) {\n            if (color[v] == GRAY) {\n                System.out.println(\"Back edge \" + (char) ('A' + u) + \" -> \" + (char) ('A' + v));\n                return true;\n            }\n            if (color[v] == WHITE && dfs(v)) return true;\n        }\n        color[u] = BLACK;\n        return false;\n    }\n\n    static boolean hasCycle(int n, int[][] edges) {\n        adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) adj.get(e[0]).add(e[1]);\n        color = new int[n];\n        for (int i = 0; i < n; i++) if (color[i] == WHITE && dfs(i)) return true;\n        return false;\n    }\n\n    public static void main(String[] args) {\n        int[][] dag = {{0,1},{0,2},{1,3},{2,3},{2,4},{3,5},{4,5},{5,6}};\n        System.out.println(\"DAG has cycle: \" + hasCycle(7, dag));\n        int[][] withBackEdge = {{0,1},{0,2},{1,3},{2,3},{2,4},{3,5},{4,5},{5,6},{6,3}}; // G -> D\n        System.out.println(\"With G -> D has cycle: \" + hasCycle(7, withBackEdge));\n    }\n}\n",
      practice: { title: "Can you finish all courses?", ask: "2 courses. Case 1: course 1 needs course 0. Case 2: course 1 needs 0 and course 0 needs 1. Print whether each is possible.", expect: ["case 1: true", "case 2: false"] } },
    { key: 'union-find', name: "Union-Find (DSU)", cat: 'Graphs', viz: 'dsu', graph: true, weighted: false, videos: {}, code: null,
      intent: "Keep disjoint sets with a parent array. find() returns a set\u2019s root; union() joins two roots. Path compression and union by rank make both nearly O(1).",
      when: "Dynamic connectivity: number of provinces, redundant connection, accounts merge, and the cycle check inside Kruskal\u2019s.",
      cx: { time: '≈ O(1) per operation', space: 'O(V)', graph: 'Undirected' }, java: "import java.util.*;\n\n// Union-Find (Disjoint Set Union) with path compression and union by rank.\n// find() and union() are almost O(1) each. Used for connected components and cycle checks.\nclass Main {\n    static class DSU {\n        int[] parent, rank;\n        DSU(int n) {\n            parent = new int[n];\n            rank = new int[n];\n            for (int i = 0; i < n; i++) parent[i] = i;\n        }\n        int find(int x) {\n            if (parent[x] != x) parent[x] = find(parent[x]); // path compression\n            return parent[x];\n        }\n        boolean union(int a, int b) {\n            int ra = find(a), rb = find(b);\n            if (ra == rb) return false;                      // already connected\n            if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }\n            parent[rb] = ra;                                 // attach the shorter tree under the taller one\n            if (rank[ra] == rank[rb]) rank[ra]++;\n            return true;\n        }\n    }\n\n    public static void main(String[] args) {\n        int n = 7; // A..G\n        int[][] edges = {{0,1},{0,2},{1,2},{1,3},{2,4},{3,4},{3,5},{4,5},{5,6}};\n        DSU dsu = new DSU(n);\n        int components = n;\n        for (int[] e : edges) {\n            if (dsu.union(e[0], e[1])) components--;\n            else System.out.println(\"Edge \" + (char) ('A' + e[0]) + \"-\" + (char) ('A' + e[1]) + \" closes a cycle\");\n        }\n        System.out.println(\"Components: \" + components);\n        System.out.println(\"A and G connected: \" + (dsu.find(0) == dsu.find(6)));\n    }\n}\n",
      practice: { title: "Number of Provinces", ask: "Cities as a matrix: [[1,1,0],[1,1,0],[0,0,1]] where 1 means directly connected. Count the provinces (connected groups) with Union-Find.", expect: ["provinces: 2"] } },
    { key: 'kruskal', name: "Kruskal's MST", cat: 'Graphs', viz: 'kruskal', graph: true, weighted: true, videos: {}, code: null,
      intent: "Build a minimum spanning tree by taking edges from cheapest to costliest, skipping any edge whose ends are already connected (checked with Union-Find).",
      when: "Cheapest way to connect everything: networks, cables, clustering. Natural when you already have an edge list.",
      cx: { time: 'O(E log E)', space: 'O(V)', graph: 'Undirected, weighted' }, java: "import java.util.*;\n\n// Kruskal's minimum spanning tree: sort edges by weight and add each one\n// unless it would join two nodes that are already connected (checked with Union-Find).\nclass Main {\n    static int[] parent;\n    static int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }\n\n    public static void main(String[] args) {\n        int n = 7; // A..G\n        int[][] edges = { // {u, v, weight}\n            {0,1,4},{0,2,2},{1,2,1},{1,3,5},{2,4,8},{3,4,2},{3,5,6},{4,5,3},{5,6,1}\n        };\n        Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));\n        parent = new int[n];\n        for (int i = 0; i < n; i++) parent[i] = i;\n\n        int total = 0, used = 0;\n        for (int[] e : edges) {\n            int ru = find(e[0]), rv = find(e[1]);\n            if (ru == rv) continue;            // would make a cycle\n            parent[ru] = rv;\n            total += e[2];\n            System.out.println(\"Take \" + (char) ('A' + e[0]) + \"-\" + (char) ('A' + e[1]) + \" (\" + e[2] + \")\");\n            if (++used == n - 1) break;        // a tree on n nodes has n-1 edges\n        }\n        System.out.println(\"MST weight: \" + total);\n    }\n}\n",
      practice: { title: "Min cost to connect all points", ask: "Points (0,0), (2,2), (3,10), (5,2), (7,0). The cost between two points is their Manhattan distance. Find the minimum total cost to connect all points.", expect: ["20"] } },
    { key: 'prim', name: "Prim's MST", cat: 'Graphs', viz: 'prim', graph: true, weighted: true, videos: {}, code: null,
      intent: "Grow one tree from a start node, always adding the cheapest edge that reaches a node not yet in the tree. A priority queue picks that edge.",
      when: "Minimum spanning tree on dense graphs or adjacency lists. Same answer as Kruskal\u2019s, built outward from one node.",
      cx: { time: 'O(E log V)', space: 'O(V + E)', graph: 'Undirected, weighted' }, java: "import java.util.*;\n\n// Prim's minimum spanning tree: grow one tree from a start node,\n// always adding the cheapest edge that reaches a node not in the tree yet.\nclass Main {\n    public static void main(String[] args) {\n        int n = 7; // A..G\n        int[][] edges = {{0,1,4},{0,2,2},{1,2,1},{1,3,5},{2,4,8},{3,4,2},{3,5,6},{4,5,3},{5,6,1}};\n        List<List<int[]>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) { adj.get(e[0]).add(new int[]{e[1], e[2]}); adj.get(e[1]).add(new int[]{e[0], e[2]}); }\n\n        boolean[] inTree = new boolean[n];\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1])); // {node, weight, from}\n        pq.add(new int[]{0, 0, -1});\n        int total = 0;\n        while (!pq.isEmpty()) {\n            int[] cur = pq.poll();\n            int u = cur[0];\n            if (inTree[u]) continue;           // a cheaper edge already reached u\n            inTree[u] = true;\n            total += cur[1];\n            if (cur[2] >= 0) System.out.println(\"Take \" + (char) ('A' + cur[2]) + \"-\" + (char) ('A' + u) + \" (\" + cur[1] + \")\");\n            for (int[] e : adj.get(u)) if (!inTree[e[0]]) pq.add(new int[]{e[0], e[1], u});\n        }\n        System.out.println(\"MST weight: \" + total);\n    }\n}\n",
      practice: { title: "Min cost to connect all points (Prim)", ask: "Points (3,12), (-2,5), (-4,1), Manhattan distance as cost. Solve it with Prim\u2019s this time.", expect: ["18"] } },
    { key: 'dijkstra', name: "Dijkstra's Shortest Path", cat: 'Graphs', viz: 'dijkstra', graph: true, weighted: true, videos: {}, code: null,
      intent: "Shortest distances from one source when weights are not negative. Always settle the closest unsettled node, then relax its edges.",
      when: "Maps and routing, network delay, cheapest path problems with non-negative costs.",
      cx: { time: 'O((V + E) log V)', space: 'O(V)', graph: 'Weighted, no negative edges' }, java: "import java.util.*;\n\n// Dijkstra's shortest paths from one source, for non-negative edge weights.\n// Always settle the closest unsettled node next, then relax its edges.\nclass Main {\n    public static void main(String[] args) {\n        int n = 7; // A..G\n        int[][] edges = {{0,1,4},{0,2,2},{1,2,1},{1,3,5},{2,4,8},{3,4,2},{3,5,6},{4,5,3},{5,6,1}};\n        List<List<int[]>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) { adj.get(e[0]).add(new int[]{e[1], e[2]}); adj.get(e[1]).add(new int[]{e[0], e[2]}); }\n\n        int[] dist = new int[n];\n        Arrays.fill(dist, Integer.MAX_VALUE);\n        dist[0] = 0;\n        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1])); // {node, distance}\n        pq.add(new int[]{0, 0});\n        while (!pq.isEmpty()) {\n            int[] cur = pq.poll();\n            int u = cur[0];\n            if (cur[1] > dist[u]) continue;    // stale entry, u was settled with a shorter distance\n            for (int[] e : adj.get(u)) {\n                int v = e[0], nd = dist[u] + e[1];\n                if (nd < dist[v]) { dist[v] = nd; pq.add(new int[]{v, nd}); }\n            }\n        }\n        for (int i = 0; i < n; i++) System.out.println(\"A -> \" + (char) ('A' + i) + \": \" + dist[i]);\n    }\n}\n",
      practice: { title: "Network Delay Time", ask: "n = 4, directed edges with times 2\u21921 (1), 2\u21923 (1), 3\u21924 (1). A signal starts at node 2. How long until every node gets it?", expect: ["2"] } },
    { key: 'bellman-ford', name: "Bellman-Ford", cat: 'Graphs', viz: 'bellman', graph: true, weighted: true, videos: {}, code: null,
      intent: "Relax every edge V \u2212 1 times. Slower than Dijkstra but works with negative weights, and one extra pass that still improves something proves a negative cycle.",
      when: "Graphs with negative edges, detecting negative cycles (arbitrage), and \u201cat most K stops\u201d style limits.",
      cx: { time: 'O(V · E)', space: 'O(V)', graph: 'Directed, weights may be negative' }, java: "import java.util.*;\n\n// Bellman-Ford shortest paths: relax every edge V-1 times.\n// Slower than Dijkstra but handles negative weights, and a V-th pass that still\n// improves something proves there is a negative cycle.\nclass Main {\n    public static void main(String[] args) {\n        int n = 7; // A..G, directed edges {from, to, weight}\n        int[][] edges = {{0,1,4},{0,2,2},{2,1,-1},{1,3,5},{2,4,8},{3,4,-2},{3,5,6},{4,5,3},{5,6,1}};\n        final int INF = Integer.MAX_VALUE;\n        int[] dist = new int[n];\n        Arrays.fill(dist, INF);\n        dist[0] = 0;\n        for (int pass = 1; pass < n; pass++) {\n            boolean changed = false;\n            for (int[] e : edges) {\n                if (dist[e[0]] != INF && dist[e[0]] + e[2] < dist[e[1]]) { dist[e[1]] = dist[e[0]] + e[2]; changed = true; }\n            }\n            if (!changed) break;               // nothing improved, we are done early\n        }\n        boolean negativeCycle = false;\n        for (int[] e : edges) if (dist[e[0]] != INF && dist[e[0]] + e[2] < dist[e[1]]) negativeCycle = true;\n        for (int i = 0; i < n; i++) System.out.println(\"A -> \" + (char) ('A' + i) + \": \" + dist[i]);\n        System.out.println(\"Negative cycle: \" + negativeCycle);\n    }\n}\n",
      practice: { title: "Cheapest flights within K stops", ask: "n = 4, flights 0\u21921 (100), 1\u21922 (100), 2\u21920 (100), 1\u21923 (600), 2\u21923 (200). Cheapest price from 0 to 3 with at most 1 stop? Run Bellman-Ford for K + 1 rounds.", expect: ["700"] } },
    { key: 'bipartite', name: "Bipartite Check", cat: 'Graphs', viz: 'bipartite', graph: true, weighted: false, videos: {}, code: null,
      intent: "Try to colour the graph with two colours so every edge joins different colours. BFS does the colouring; a same-colour edge means an odd cycle.",
      when: "Splitting into two groups with no conflicts: teams, matching problems, \u201cis graph bipartite\u201d, possible bipartition.",
      cx: { time: 'O(V + E)', space: 'O(V)', graph: 'Undirected' }, java: "import java.util.*;\n\n// Bipartite check: colour nodes with two colours using BFS so every edge joins different colours.\n// If an edge joins two nodes of the same colour, there is an odd cycle and the graph is not bipartite.\nclass Main {\n    static boolean isBipartite(int n, int[][] edges) {\n        List<List<Integer>> adj = new ArrayList<>();\n        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());\n        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }\n        int[] color = new int[n];\n        Arrays.fill(color, -1);\n        for (int s = 0; s < n; s++) {          // the graph may have several components\n            if (color[s] != -1) continue;\n            color[s] = 0;\n            Deque<Integer> queue = new ArrayDeque<>(List.of(s));\n            while (!queue.isEmpty()) {\n                int u = queue.poll();\n                for (int v : adj.get(u)) {\n                    if (color[v] == -1) { color[v] = 1 - color[u]; queue.add(v); }\n                    else if (color[v] == color[u]) return false;\n                }\n            }\n        }\n        return true;\n    }\n\n    public static void main(String[] args) {\n        int[][] evenCycles = {{0,1},{0,2},{1,3},{2,4},{3,5},{4,5},{5,6}};\n        System.out.println(\"Bipartite: \" + isBipartite(7, evenCycles));\n        int[][] triangle = {{0,1},{1,2},{2,0}};\n        System.out.println(\"Triangle bipartite: \" + isBipartite(3, triangle));\n    }\n}\n",
      practice: { title: "Is Graph Bipartite?", ask: "Adjacency lists. Graph 1: [[1,2,3],[0,2],[0,1,3],[0,2]]. Graph 2: [[1,3],[0,2],[1,3],[0,2]]. Print whether each is bipartite.", expect: ["graph 1: false", "graph 2: true"] } },
  ];

  /* ---------------- visualizers ---------------- */
  const sorted = (n, from = 0) => Object.fromEntries(Array.from({ length: n - from }, (_, k) => [from + k, 'done']));
  const V = {
    *bubble(a) {
      const n = a.length;
      for (let end = n - 1; end > 0; end--) {
        let swapped = false;
        for (let i = 0; i < end; i++) {
          yield { a, mark: { [i]: 'cmp', [i + 1]: 'cmp', ...sorted(n, end + 1) }, note: `Compare ${a[i]} and ${a[i + 1]}` };
          if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; swapped = true; yield { a, mark: { [i]: 'swap', [i + 1]: 'swap', ...sorted(n, end + 1) }, note: `Swap: ${a[i + 1]} moves right` }; }
        }
        if (!swapped) { yield { a, mark: sorted(n), note: 'No swaps in this pass, so the array is sorted' }; return; }
      }
      yield { a, mark: sorted(n), note: 'Sorted' };
    },
    *selection(a) {
      const n = a.length;
      for (let i = 0; i < n - 1; i++) {
        let m = i;
        for (let j = i + 1; j < n; j++) {
          yield { a, mark: { ...sorted(i, 0), [m]: 'pivot', [j]: 'cmp' }, note: `Smallest so far: ${a[m]}. Check ${a[j]}` };
          if (a[j] < a[m]) m = j;
        }
        if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; yield { a, mark: { ...sorted(i, 0), [i]: 'swap', [m]: 'swap' }, note: `Swap ${a[i]} to position ${i}` }; }
      }
      yield { a, mark: sorted(n), note: 'Sorted' };
    },
    *insertion(a) {
      const n = a.length;
      for (let i = 1; i < n; i++) {
        const key = a[i]; let j = i - 1;
        yield { a, mark: { [i]: 'pivot' }, note: `Insert ${key} into the sorted part on its left` };
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; a[j] = key; yield { a, mark: { [j]: 'pivot', [j + 1]: 'swap' }, note: `${a[j + 1]} > ${key}, shift it right` }; j--; }
      }
      yield { a, mark: sorted(n), note: 'Sorted' };
    },
    *mergeSort(a) {
      const n = a.length;
      for (let w = 1; w < n; w *= 2) {
        for (let lo = 0; lo < n - w; lo += 2 * w) {
          const mid = lo + w, hi = Math.min(lo + 2 * w, n), L = a.slice(lo, mid), R = a.slice(mid, hi);
          let i = 0, j = 0, k = lo;
          while (i < L.length || j < R.length) {
            const takeL = j >= R.length || (i < L.length && L[i] <= R[j]);
            a[k] = takeL ? L[i++] : R[j++];
            const mark = {}; for (let x = lo; x < hi; x++) mark[x] = 'range'; mark[k] = 'swap';
            yield { a, mark, note: `Merge [${lo}..${mid - 1}] with [${mid}..${hi - 1}]: place ${a[k]}` };
            k++;
          }
        }
      }
      yield { a, mark: sorted(n), note: 'Sorted' };
    },
    *quick(a) {
      const n = a.length, done = {};
      function* qs(lo, hi) {
        if (lo > hi) return;
        if (lo === hi) { done[lo] = 'done'; return; }
        const p = a[hi]; let i = lo;
        for (let j = lo; j < hi; j++) {
          yield { a, mark: { ...done, [hi]: 'pivot', [i]: 'range', [j]: 'cmp' }, note: `Pivot ${p}. Is ${a[j]} smaller?` };
          if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; if (i !== j) yield { a, mark: { ...done, [hi]: 'pivot', [i]: 'swap', [j]: 'swap' }, note: `Yes, swap ${a[i]} to the left side` }; i++; }
        }
        [a[i], a[hi]] = [a[hi], a[i]]; done[i] = 'done';
        yield { a, mark: { ...done }, note: `Pivot ${p} lands at index ${i}` };
        yield* qs(lo, i - 1); yield* qs(i + 1, hi);
      }
      yield* qs(0, n - 1);
      yield { a, mark: sorted(n), note: 'Sorted' };
    },
    *heap(a) {
      const n = a.length;
      function* sift(i, size) {
        while (true) {
          const l = 2 * i + 1, r = l + 1; let m = i;
          if (l < size && a[l] > a[m]) m = l;
          if (r < size && a[r] > a[m]) m = r;
          if (m === i) return;
          [a[i], a[m]] = [a[m], a[i]];
          yield { a, mark: { ...sorted(n, size), [i]: 'swap', [m]: 'swap' }, note: `Sift down: ${a[m]} goes below its child ${a[i]}` };
          i = m;
        }
      }
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) yield* sift(i, n);
      yield { a, mark: { 0: 'pivot' }, note: `Max-heap built. The largest, ${a[0]}, is at the root` };
      for (let end = n - 1; end > 0; end--) {
        [a[0], a[end]] = [a[end], a[0]];
        yield { a, mark: { ...sorted(n, end), 0: 'swap' }, note: `Move ${a[end]} to the end, then fix the heap` };
        yield* sift(0, end);
      }
      yield { a, mark: sorted(n), note: 'Sorted' };
    },
    *counting(a) {
      const n = a.length, max = Math.max(...a), c = new Array(max + 1).fill(0);
      for (let i = 0; i < n; i++) { c[a[i]]++; yield { a, mark: { [i]: 'cmp' }, note: `Count ${a[i]}: seen ${c[a[i]]} time${c[a[i]] > 1 ? 's' : ''}` }; }
      let k = 0;
      for (let v = 0; v <= max; v++) while (c[v]-- > 0) { a[k] = v; yield { a, mark: { ...sorted(k, 0), [k]: 'swap' }, note: `Write ${v} back at index ${k}` }; k++; }
      yield { a, mark: sorted(n), note: 'Sorted' };
    },
    *merge(a) {
      const n = a.length, h = Math.ceil(n / 2), L = a.slice(0, h).sort((x, y) => x - y), R = a.slice(h).sort((x, y) => x - y);
      a.splice(0, n, ...L, ...R);
      yield { a, mark: Object.fromEntries(a.map((_, k) => [k, k < h ? 'range' : 'pivot'])), note: 'Two sorted halves. Merge them by taking the smaller front each time' };
      let i = 0, j = 0; const out = [];
      while (i < L.length || j < R.length) {
        const takeL = j >= R.length || (i < L.length && L[i] <= R[j]);
        out.push(takeL ? L[i++] : R[j++]);
        a.splice(0, n, ...out, ...L.slice(i), ...R.slice(j));
        const mark = sorted(out.length, 0); for (let x = out.length; x < out.length + L.length - i; x++) mark[x] = 'range'; for (let x = out.length + L.length - i; x < n; x++) mark[x] = 'pivot'; mark[out.length - 1] = 'swap';
        yield { a, mark, note: `Take ${out[out.length - 1]} from the ${takeL ? 'left' : 'right'} array` };
      }
      yield { a, mark: sorted(n), note: 'Merged' };
    },
    *partition(a) {
      const n = a.length, hi = n - 1, p = a[hi]; let i = 0;
      for (let j = 0; j < hi; j++) {
        yield { a, mark: { [hi]: 'pivot', [i]: 'range', [j]: 'cmp' }, note: `Pivot ${p}. Is ${a[j]} smaller?` };
        if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; if (i !== j) yield { a, mark: { [hi]: 'pivot', [i]: 'swap', [j]: 'swap' }, note: `Yes, swap ${a[i]} into the smaller side` }; i++; }
      }
      [a[i], a[hi]] = [a[hi], a[i]];
      const mark = {}; for (let x = 0; x < n; x++) mark[x] = x < i ? 'range' : x === i ? 'done' : 'pivot';
      yield { a, mark, note: `Done: smaller on the left, ${p} at index ${i}, larger on the right` };
    },
    *dutch(a) {
      const n = a.length; for (let k = 0; k < n; k++) a[k] = a[k] % 3; // only 0, 1, 2
      let lo = 0, mid = 0, hi = n - 1;
      while (mid <= hi) {
        yield { a, mark: { [lo]: 'range', [mid]: 'cmp', [hi]: 'pivot' }, note: `low=${lo}, mid=${mid}, high=${hi}. Look at ${a[mid]}` };
        if (a[mid] === 0) { [a[lo], a[mid]] = [a[mid], a[lo]]; lo++; mid++; }
        else if (a[mid] === 1) mid++;
        else { [a[mid], a[hi]] = [a[hi], a[mid]]; hi--; }
      }
      yield { a, mark: sorted(n), note: 'Sorted in one pass' };
    },
    *gap(a) {
      const n = a.length, h = Math.ceil(n / 2), A = a.slice(0, h).sort((x, y) => x - y), B = a.slice(h).sort((x, y) => x - y);
      a.splice(0, n, ...A, ...B);
      const base = () => Object.fromEntries(a.map((_, k) => [k, k < h ? 'range' : 'pivot']));
      yield { a, mark: base(), note: `Array 1 is [0..${h - 1}], array 2 is the rest. Both sorted` };
      for (let gap = Math.ceil(n / 2); gap > 0; gap = gap === 1 ? 0 : Math.ceil(gap / 2)) {
        for (let i = 0; i + gap < n; i++) {
          yield { a, mark: { ...base(), [i]: 'cmp', [i + gap]: 'cmp' }, note: `Gap ${gap}: compare ${a[i]} and ${a[i + gap]}` };
          if (a[i] > a[i + gap]) { [a[i], a[i + gap]] = [a[i + gap], a[i]]; yield { a, mark: { ...base(), [i]: 'swap', [i + gap]: 'swap' }, note: 'Out of order, swap' }; }
        }
      }
      yield { a, mark: sorted(n), note: 'Merged in place' };
    },
  };

  /* ---------------- graphs: one sample graph (A–G), drawn as SVG ---------------- */
  const GN = [['A', 60, 150], ['B', 185, 62], ['C', 185, 240], ['D', 335, 62], ['E', 335, 240], ['F', 465, 150], ['G', 575, 150]];
  const GE = {
    und: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5], [5, 6]],
    bip: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6]],
    dag: [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6]],
    cyc: [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6], [6, 3]],
  };
  const W_DEFAULT = [4, 2, 1, 5, 8, 2, 6, 3, 1];          // weights for GE.und (Dijkstra, Prim, Kruskal)
  const BF_EDGES = [[0, 1], [0, 2], [2, 1], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5], [5, 6]]; // directed, for Bellman-Ford
  const BF_DEFAULT = [4, 2, -1, 5, 8, -2, 6, 3, 1];
  const N = (i) => GN[i][0];
  const INF = '∞';

  /* a tiny frame recorder shared by the graph visualizers */
  function rec(edges, directed, w) {
    const nm = {}, em = {}, lab = {};
    const adj = GN.map(() => []);
    edges.forEach(([u, v], k) => { adj[u].push([v, k]); if (!directed) adj[v].push([u, k]); });
    const snap = (note, info = '') => ({ graph: { edges, directed, w }, nm: { ...nm }, em: { ...em }, lab: { ...lab }, note, info });
    return { nm, em, lab, adj, snap };
  }

  Object.assign(V, {
    *bfs() {
      const g = rec(GE.und, false), seen = new Set([0]), q = [0];
      g.nm[0] = 'q'; g.lab[0] = 'd=0';
      yield g.snap('Start at A: distance 0, put it in the queue.', 'Queue: A');
      while (q.length) {
        const u = q.shift(); g.nm[u] = 'cur';
        yield g.snap(`Take ${N(u)} from the front of the queue.`, 'Queue: ' + (q.map(N).join(' ') || 'empty'));
        for (const [v, k] of g.adj[u]) {
          if (seen.has(v)) continue;
          seen.add(v); q.push(v); g.nm[v] = 'q'; g.em[k] = 'tree'; g.lab[v] = 'd=' + (+g.lab[u].slice(2) + 1);
          yield g.snap(`${N(v)} is new: mark it seen and queue it (one hop further than ${N(u)}).`, 'Queue: ' + q.map(N).join(' '));
        }
        g.nm[u] = 'done';
      }
      yield g.snap('Done. Green edges form the BFS tree; d = fewest hops from A.', '');
    },
    *dfs() {
      const g = rec(GE.und, false), seen = new Set(), path = [];
      function* go(u, via) {
        seen.add(u); path.push(u); g.nm[u] = 'path'; if (via != null) g.em[via] = 'tree';
        yield g.snap(`Visit ${N(u)} and go deeper.`, 'Path: ' + path.map(N).join(' → '));
        for (const [v, k] of g.adj[u]) {
          if (seen.has(v)) continue;
          yield* go(v, k);
          g.nm[u] = 'cur';
          yield g.snap(`Back at ${N(u)}: try its next neighbour.`, 'Path: ' + path.map(N).join(' → '));
          g.nm[u] = 'path';
        }
        g.nm[u] = 'done'; path.pop();
        yield g.snap(`${N(u)} has no unvisited neighbours left: backtrack.`, 'Path: ' + (path.map(N).join(' → ') || '—'));
      }
      yield* go(0, null);
      yield g.snap('Done. Green edges form the DFS tree.', '');
    },
    *topo() {
      const g = rec(GE.dag, true), indeg = GN.map(() => 0), out = [];
      GE.dag.forEach(([, v]) => indeg[v]++);
      GN.forEach((_, i) => (g.lab[i] = 'in=' + indeg[i]));
      const q = GN.map((_, i) => i).filter((i) => !indeg[i]);
      q.forEach((i) => (g.nm[i] = 'q'));
      yield g.snap('Count incoming edges. Nodes with in=0 can go first.', 'Queue: ' + q.map(N).join(' '));
      while (q.length) {
        const u = q.shift(); out.push(u); g.nm[u] = 'done';
        yield g.snap(`Output ${N(u)} and remove its outgoing edges.`, 'Order: ' + out.map(N).join(' '));
        for (const [v, k] of g.adj[u]) {
          indeg[v]--; g.lab[v] = 'in=' + indeg[v]; g.em[k] = 'tree';
          if (!indeg[v]) { q.push(v); g.nm[v] = 'q'; }
          yield g.snap(indeg[v] ? `${N(v)} still waits on ${indeg[v]} more.` : `${N(v)} has no more incoming edges: queue it.`, 'Order: ' + out.map(N).join(' ') + ' · Queue: ' + (q.map(N).join(' ') || 'empty'));
        }
      }
      yield g.snap(`Topological order: ${out.map(N).join(' → ')}`, '');
    },
    *cycle() {
      const g = rec(GE.cyc, true), color = GN.map(() => 0);
      function* go(u) {
        color[u] = 1; g.nm[u] = 'path';
        yield g.snap(`${N(u)} is on the current path (gray).`, '');
        for (const [v, k] of g.adj[u]) {
          g.em[k] = 'cmp';
          yield g.snap(`Follow ${N(u)} → ${N(v)}.`, '');
          if (color[v] === 1) { g.em[k] = 'bad'; g.nm[v] = 'bad'; yield g.snap(`${N(v)} is already on the path: back edge ${N(u)} → ${N(v)}. Cycle found!`, ''); return true; }
          g.em[k] = 'tree';
          if (!color[v] && (yield* go(v))) return true;
        }
        color[u] = 2; g.nm[u] = 'done';
        yield g.snap(`${N(u)} finished (black): no cycle through it.`, '');
        return false;
      }
      for (let i = 0; i < GN.length; i++) if (!color[i] && (yield* go(i))) return;
      yield g.snap('No back edge anywhere: the graph has no cycle.', '');
    },
    *dsu() {
      const g = rec(GE.und, false), parent = GN.map((_, i) => i), rank = GN.map(() => 0);
      const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
      GN.forEach((_, i) => (g.lab[i] = 'p=' + N(i)));
      yield g.snap('Every node starts as its own set (its own parent).', '');
      for (let k = 0; k < GE.und.length; k++) {
        const [a, b] = GE.und[k]; g.em[k] = 'cmp';
        const ra = find(a), rb = find(b);
        GN.forEach((_, i) => (g.lab[i] = 'p=' + N(parent[i])));
        yield g.snap(`Edge ${N(a)}-${N(b)}: find(${N(a)}) = ${N(ra)}, find(${N(b)}) = ${N(rb)}.`, '');
        if (ra === rb) { g.em[k] = 'bad'; yield g.snap(`Same root ${N(ra)}: already connected, so this edge closes a cycle.`, ''); continue; }
        let [hi, lo] = rank[ra] >= rank[rb] ? [ra, rb] : [rb, ra];
        parent[lo] = hi; if (rank[ra] === rank[rb]) rank[hi]++;
        g.em[k] = 'tree'; GN.forEach((_, i) => (g.lab[i] = 'p=' + N(parent[i])));
        yield g.snap(`Union: attach root ${N(lo)} under ${N(hi)} (union by rank).`, '');
      }
      GN.forEach((_, i) => { find(i); g.lab[i] = 'p=' + N(parent[i]); g.nm[i] = 'done'; });
      yield g.snap('One set left: everything is connected. Red edges were the cycle-closing ones.', '');
    },
    *kruskal(w) {
      const g = rec(GE.und, false, w), parent = GN.map((_, i) => i);
      const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
      const order = GE.und.map((e, k) => k).sort((a, b) => w[a] - w[b]);
      const list = () => 'Sorted: ' + order.map((k) => `${N(GE.und[k][0])}${N(GE.und[k][1])}=${w[k]}`).join(', ');
      yield g.snap('Sort all edges by weight, cheapest first.', list());
      let total = 0, used = 0;
      for (const k of order) {
        const [a, b] = GE.und[k]; g.em[k] = 'cmp';
        yield g.snap(`Next cheapest: ${N(a)}-${N(b)} (${w[k]}).`, `MST weight so far: ${total}`);
        const ra = find(a), rb = find(b);
        if (ra === rb) { g.em[k] = 'bad'; yield g.snap(`${N(a)} and ${N(b)} are already connected: skip it, it would make a cycle.`, `MST weight so far: ${total}`); continue; }
        parent[ra] = rb; total += w[k]; used++; g.em[k] = 'tree'; g.nm[a] = g.nm[b] = 'done';
        yield g.snap(`Take it.`, `MST weight so far: ${total}`);
        if (used === GN.length - 1) break;
      }
      yield g.snap(`Done: ${GN.length - 1} edges, total weight ${total}.`, '');
    },
    *prim(w) {
      const g = rec(GE.und, false, w), inTree = new Set([0]);
      g.nm[0] = 'done';
      yield g.snap('Start the tree at A.', 'MST weight so far: 0');
      let total = 0;
      while (inTree.size < GN.length) {
        let best = null;
        GE.und.forEach(([a, b], k) => {
          if (inTree.has(a) !== inTree.has(b)) { if (g.em[k] !== 'tree') g.em[k] = 'cmp'; if (best == null || w[k] < w[best]) best = k; }
          else if (g.em[k] === 'cmp') delete g.em[k];
        });
        yield g.snap('Blue edges cross from the tree to the rest. Pick the cheapest.', `MST weight so far: ${total}`);
        const [a, b] = GE.und[best], v = inTree.has(a) ? b : a;
        inTree.add(v); total += w[best]; g.em[best] = 'tree'; g.nm[v] = 'done';
        GE.und.forEach((_, k) => { if (g.em[k] === 'cmp') delete g.em[k]; });
        yield g.snap(`Add ${N(v)} via ${N(a)}-${N(b)} (${w[best]}).`, `MST weight so far: ${total}`);
      }
      yield g.snap(`Done: total weight ${total}.`, '');
    },
    *dijkstra(w) {
      const g = rec(GE.und, false, w), dist = GN.map(() => Infinity), via = GN.map(() => null), done = new Set();
      dist[0] = 0; GN.forEach((_, i) => (g.lab[i] = i ? INF : '0'));
      yield g.snap('Distance to A is 0, everything else is ∞.', '');
      while (done.size < GN.length) {
        let u = -1; GN.forEach((_, i) => { if (!done.has(i) && (u < 0 || dist[i] < dist[u])) u = i; });
        if (dist[u] === Infinity) break;
        g.nm[u] = 'cur';
        yield g.snap(`Closest unsettled node is ${N(u)} (${dist[u]}). Settle it.`, '');
        for (const [v, k] of g.adj[u]) {
          if (done.has(v)) continue;
          const prev = g.em[k]; g.em[k] = 'cmp';
          const nd = dist[u] + w[k];
          if (nd < dist[v]) {
            if (via[v] != null) delete g.em[via[v]];
            dist[v] = nd; via[v] = k; g.lab[v] = String(nd);
            yield g.snap(`${N(u)} → ${N(v)}: ${dist[u]} + ${w[k]} = ${nd}, shorter. Update ${N(v)}.`, '');
          } else yield g.snap(`${N(u)} → ${N(v)}: ${dist[u]} + ${w[k]} = ${nd}, not shorter than ${dist[v]}.`, '');
          g.em[k] = via[v] === k ? 'tree' : prev; if (!g.em[k]) delete g.em[k];
        }
        done.add(u); g.nm[u] = 'done';
      }
      yield g.snap('Done. Labels are the shortest distances from A; green edges are the shortest-path tree.', '');
    },
    *bellman(w) {
      const g = rec(BF_EDGES, true, w), dist = GN.map(() => Infinity), via = GN.map(() => null);
      dist[0] = 0; GN.forEach((_, i) => (g.lab[i] = i ? INF : '0'));
      yield g.snap('Distance to A is 0, everything else is ∞. Some edges are negative.', '');
      for (let pass = 1; pass < GN.length; pass++) {
        let changed = false;
        for (let k = 0; k < BF_EDGES.length; k++) {
          const [u, v] = BF_EDGES[k];
          if (dist[u] === Infinity) continue;
          const prev = g.em[k]; g.em[k] = 'cmp';
          if (dist[u] + w[k] < dist[v]) {
            if (via[v] != null && via[v] !== k) delete g.em[via[v]];
            dist[v] = dist[u] + w[k]; via[v] = k; g.lab[v] = String(dist[v]); changed = true;
            yield g.snap(`Pass ${pass}: ${N(u)} → ${N(v)} gives ${dist[v]}. Update.`, `Pass ${pass} of ${GN.length - 1}`);
            g.em[k] = 'tree';
          } else { yield g.snap(`Pass ${pass}: ${N(u)} → ${N(v)} doesn't improve ${N(v)}.`, `Pass ${pass} of ${GN.length - 1}`); g.em[k] = prev; if (!g.em[k]) delete g.em[k]; }
        }
        if (!changed) { yield g.snap(`Pass ${pass} changed nothing, so we can stop early.`, ''); break; }
      }
      GN.forEach((_, i) => (g.nm[i] = 'done'));
      yield g.snap('Done. One more pass that still improved something would mean a negative cycle.', '');
    },
    *bipartite() {
      const g = rec(GE.bip, false), color = GN.map(() => -1), q = [0];
      color[0] = 0; g.nm[0] = 'c0';
      yield g.snap('Colour A blue. Every neighbour must get the other colour.', 'Queue: A');
      while (q.length) {
        const u = q.shift();
        for (const [v, k] of g.adj[u]) {
          g.em[k] = 'cmp';
          if (color[v] === -1) { color[v] = 1 - color[u]; g.nm[v] = 'c' + color[v]; q.push(v); g.em[k] = 'tree'; yield g.snap(`${N(v)} gets the opposite colour of ${N(u)}.`, 'Queue: ' + q.map(N).join(' ')); }
          else if (color[v] === color[u]) { g.em[k] = 'bad'; yield g.snap(`${N(u)} and ${N(v)} have the same colour: not bipartite.`, ''); return; }
          else { g.em[k] = 'tree'; yield g.snap(`${N(u)}-${N(v)} already has different colours. Fine.`, 'Queue: ' + (q.map(N).join(' ') || 'empty')); }
        }
      }
      yield g.snap('Every edge joins two different colours: the graph is bipartite.', '');
    },
  });

  /* draw one graph frame as SVG */
  function drawGraph(f) {
    const { edges, directed, w } = f.graph, R = 21;
    const line = ([u, v], k) => {
      const [, x1, y1] = GN[u], [, x2, y2] = GN[v], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const sx = x1 + ux * R, sy = y1 + uy * R, ex = x2 - ux * (R + (directed ? 6 : 0)), ey = y2 - uy * (R + (directed ? 6 : 0));
      const cls = f.em[k] || '', mx = (x1 + x2) / 2 - uy * 13, my = (y1 + y2) / 2 + ux * 13;
      return `<g class="ge ${cls}"><line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" ${directed ? `marker-end="url(#ga-${cls || 'n'})"` : ''}/>${w ? `<text x="${mx}" y="${my}">${w[k]}</text>` : ''}</g>`;
    };
    const marker = (c) => `<marker id="ga-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="gm ${c}"/></marker>`;
    return `<svg class="gsvg" viewBox="0 0 640 300" role="img" aria-label="Graph"><defs>${['n', 'cmp', 'tree', 'bad'].map(marker).join('')}</defs>
      ${edges.map(line).join('')}
      ${GN.map(([n, x, y], i) => `<g class="gn ${f.nm[i] || ''}"><circle cx="${x}" cy="${y}" r="${R}"/><text class="n" x="${x}" y="${y}">${n}</text>${f.lab[i] != null ? `<text class="lab" x="${x}" y="${y < 120 ? y - 36 : y + 37}">${f.lab[i]}</text>` : ''}</g>`).join('')}</svg>`;
  }

  /* A bar-chart player for any topic's visualizer. els: { bars, note, play, step, shuffle, speed } (speed optional). */
  function player(els, { size = () => (innerWidth < 640 ? 9 : 12) } = {}) {
    let topic = null, frames = null, timer = null, base = [];
    const fresh = () => topic && topic.graph
      ? (topic.viz === 'bellman' ? BF_DEFAULT.map((d) => (d < 0 ? -1 - Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 9))) : W_DEFAULT.map(() => 1 + Math.floor(Math.random() * 9)))
      : Array.from({ length: size() }, () => 1 + Math.floor(Math.random() * 30));
    const draw = (f) => {
      els.bars.classList.toggle('is-graph', !!f.graph);
      if (f.graph) { els.bars.innerHTML = drawGraph(f); els.note.innerHTML = `${YTB.esc(f.note || '')}${f.info ? `<small>${YTB.esc(f.info)}</small>` : ''}`; return; }
      const max = Math.max(...f.a, 1);
      els.bars.innerHTML = f.a.map((v, i) => `<div class="sbar ${f.mark?.[i] || ''}" style="height:${Math.max(8, v / max * 100)}%"><span>${v}</span></div>`).join('');
      els.note.textContent = f.note || '';
    };
    const stop = () => { clearTimeout(timer); timer = null; els.play.textContent = '▶ Play'; };
    function reset(newArr) {
      stop();
      if (!topic || !topic.viz) return;
      if (topic.graph) base = newArr ? fresh() : (topic.viz === 'bellman' ? BF_DEFAULT.slice() : W_DEFAULT.slice());
      else if (newArr || !base.length || base.length !== size()) base = fresh();
      frames = V[topic.viz](base.slice());
      const first = frames.next();
      draw(first.done ? { a: base } : first.value);
      if (first.done) frames = null;
      els.note.textContent = 'Press Play to watch it run, or Step through it.';
    }
    function step() {
      if (!frames) reset();
      const r = frames.next();
      if (r.done) { frames = null; stop(); els.play.textContent = '↺ Replay'; return false; }
      draw(r.value); return true;
    }
    const delay = () => [900, 600, 380, 200, 80][(els.speed ? +els.speed.value : 3) - 1];
    function play() {
      if (timer) return stop();
      if (!frames) reset();
      els.play.textContent = '❚❚ Pause';
      const tick = () => { if (step()) timer = setTimeout(tick, delay()); };
      tick();
    }
    els.play.addEventListener('click', play);
    els.step.addEventListener('click', () => { stop(); step(); });
    els.shuffle.addEventListener('click', () => reset(true));
    return {
      load(t) {
        const wasGraph = topic && topic.graph; topic = t;
        if (wasGraph && !t.graph) base = [];
        els.shuffle.hidden = !!(t.graph && !t.weighted);
        els.shuffle.textContent = t.graph ? 'New weights' : 'New array';
        reset();
      }, play, stop,
    };
  }

  window.YTBDSA = { list: T, cats: ['Sorting', 'Building blocks', 'Problems', 'Graphs'], viz: V, player, get: (k) => T.find((t) => t.key === k) };
})();

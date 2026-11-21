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

  /* A bar-chart player for any topic's visualizer. els: { bars, note, play, step, shuffle, speed } (speed optional). */
  function player(els, { size = () => (innerWidth < 640 ? 9 : 12) } = {}) {
    let topic = null, frames = null, timer = null, base = [];
    const fresh = () => Array.from({ length: size() }, () => 1 + Math.floor(Math.random() * 30));
    const draw = (f) => {
      const max = Math.max(...f.a, 1);
      els.bars.innerHTML = f.a.map((v, i) => `<div class="sbar ${f.mark?.[i] || ''}" style="height:${Math.max(8, v / max * 100)}%"><span>${v}</span></div>`).join('');
      els.note.textContent = f.note || '';
    };
    const stop = () => { clearTimeout(timer); timer = null; els.play.textContent = '▶ Play'; };
    function reset(newArr) {
      stop();
      if (newArr || !base.length) base = fresh();
      if (!topic || !topic.viz) return;
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
    return { load(t) { topic = t; reset(); }, play, stop };
  }

  window.YTBDSA = { list: T, cats: ['Sorting', 'Building blocks', 'Problems'], viz: V, player, get: (k) => T.find((t) => t.key === k) };
})();

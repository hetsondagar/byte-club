export interface Mission {
  id: string;
  title: string;
  description: string;
  challenge: string;
  tags: string[];
  xp: number;
  difficulty: string;
  hint: string;
  successText: string;
  correctAnswer: string;
}

export interface Quest {
  id: string;
  title: string;
  tagline: string;
  story: string;
  difficulty: string;
  xp: number;
  color: string;
  missions: Mission[];
}

export const questsData: Quest[] = [
  {
    id: "quest-1",
    title: "The Lost Server",
    tagline: "A rogue AI has hidden the master key inside the corrupted archives.",
    story: `
      The ByteNet's central AI—CORA—went rogue during an update. 
      She encrypted the core access key and scattered it across abandoned data nodes. 
      Your task: traverse the data void, decode fragments, and restore the system before it collapses.
    `,
    difficulty: "Medium",
    xp: 900,
    color: "from-cyan-400 to-blue-600",
    missions: [
      {
        id: "mission-1a",
        title: "Fragment Finder",
        description: `
          You've breached the Archive Node. Data fragments flicker across corrupted memory sectors.
          The AI left clues in scattered logs: "Map the chaos... Hash the fragments... Find the pattern."
          The system demands the NAME of the ancient structure that maps keys to their secrets.
        `,
        challenge: `
          >> SYSTEM QUERY: The data structure that MAPS fragmented keys to their hidden values?
          >> WARNING: One word. Case-sensitive. Choose wisely.
        `,
        tags: ["strings", "pattern", "logic"],
        xp: 300,
        difficulty: "Medium",
        hint: "The clue said 'HASH the fragments' and 'MAP the chaos' - combine these operations.",
        successText: "Fragment secured. Access node stabilized.",
        correctAnswer: "HashMap",
      },
      {
        id: "mission-1b",
        title: "The Memory Leak",
        description: `
          ALERT: Memory cells are hemorrhaging data. The allocator's registry is corrupted.
          You intercept a transmission: "ALLOC_0x4F2A... FREE_0x3C1D... ALLOC_0x7E9B..."
          But some blocks never received their FREE command. The leak tracker needs a STRUCTURE
          that operates in O(1) time for lookups. The mainframe is bleeding out—WHAT STRUCTURE?
        `,
        challenge: `
          >> CRITICAL: Structure for constant-time memory block tracking?
          >> HINT: Not a list. Not a tree. Think instant access.
        `,
        tags: ["simulation", "hashmap"],
        xp: 300,
        difficulty: "Medium",
        hint: "O(1) lookup time. Perfect for checking if a memory block ID exists. Rhymes with 'flashmap'.",
        successText: "Leak patched. Memory reclaimed.",
        correctAnswer: "HashTable",
      },
      {
        id: "mission-1c",
        title: "Decrypt the Core",
        description: `
          The encrypted core key pulses with binary rhythms: 1010 ⊕ 1100 = 0110.
          CORA's encryption log reads: "The gate that negates sameness, preserves difference.
          Apply me once to hide. Apply me TWICE to reveal. I am my own inverse."
          The self-destructing key needs the NAME of this bitwise paradox. What gate reveals truth?
        `,
        challenge: `
          >> DECRYPT PROTOCOL: The bitwise operator that reverses itself?
          >> CIPHER CLUE: 1⊕1=0, 1⊕0=1, 0⊕0=0. Which gate am I?
        `,
        tags: ["bit-manipulation", "crypto"],
        xp: 300,
        difficulty: "Hard",
        hint: "Exclusive OR. The symbol is ⊕. It's written as three letters.",
        successText: "Core key decrypted. CORA's firewall breached.",
        correctAnswer: "XOR",
      },
    ],
  },
  {
    id: "quest-2",
    title: "Ghost in the Compiler",
    tagline: "Your code compiles… but something else runs.",
    story: `
      The Byte Compiler is haunted. Developers report seeing phantom errors,
      log distortions, and infinite loops running nowhere. Find the ghost process.
    `,
    difficulty: "Hard",
    xp: 1200,
    color: "from-violet-500 to-fuchsia-600",
    missions: [
      {
        id: "mission-2a",
        title: "Phantom Logs",
        description: `
          Ghost errors flicker in the log stream: "ERR404", "ERR301", "ERRXXX"...
          The compiler whispers: "Match my patterns. Express my rules. Use the language
          of patterns itself—not parsing, not scanning, but the EXPRESSION that describes patterns."
          What's the cryptic pattern-matching language used to hunt these phantom codes?
        `,
        challenge: `
          >> LOG ANALYZER: The expression language for pattern matching?
          >> SAMPLE: [A-Z]{3}[0-9]{3} ← What language is this?
        `,
        tags: ["regex", "maps", "strings"],
        xp: 300,
        difficulty: "Medium",
        hint: "Regular Expression. Shortened to 5 letters. Starts with 'Reg'.",
        successText: "Ghost signal identified in log sequence.",
        correctAnswer: "Regex",
      },
      {
        id: "mission-2b",
        title: "Haunted Loop",
        description: `
          The call stack spirals infinitely: main() → ghost() → haunt() → ghost()...
          You trace the recursion tree. The ghost hides in a BACK EDGE—a path that loops to an ancestor.
          Two searchers exist: one goes DEEP first, one goes BROAD first.
          Only ONE naturally detects back edges during traversal. Which searcher finds the phantom?
        `,
        challenge: `
          >> CYCLE DETECTOR: DFS or BFS? Which finds back edges during traversal?
          >> CLUE: Think about the DEPTH of recursion, not breadth.
        `,
        tags: ["graph", "cycle-detection"],
        xp: 400,
        difficulty: "Hard",
        hint: "Depth-First. The one that goes deep before wide. Three letters.",
        successText: "Phantom loop exorcised from compiler core.",
        correctAnswer: "DFS",
      },
      {
        id: "mission-2c",
        title: "Syntax of Shadows",
        description: `
          Invisible code blocks haunt the binary. Statements that NEVER execute, paths that NEVER run.
          The ghost wrote: "if(false) { /* I am dead */ }  goto label_X; label_Y: /* forever alone */"
          You need the TYPE of analysis that traces execution paths through branches and jumps.
          Not what data flows WHERE, not how syntax is STRUCTURED—but how CONTROL transfers. What analysis?
        `,
        challenge: `
          >> CODE ANALYZER: Analysis type that tracks execution path transfer?
          >> FOCUS: Branches, jumps, loops—how the program FLOWS.
        `,
        tags: ["control-flow", "optimization"],
        xp: 500,
        difficulty: "Hard",
        hint: "Two words combined: Control + Flow. Write as one word or hyphenated.",
        successText: "Code purified. Ghost signature vanished.",
        correctAnswer: "ControlFlow",
      },
    ],
  },
  {
    id: "quest-3",
    title: "Firewall Protocol: Zero Day",
    tagline: "An exploit spreads across the ByteNet. You are the last line of defense.",
    story: `
      A zero-day worm, nicknamed "Erebus," is infiltrating network nodes.
      Your mission: detect, sanitize, and patch vulnerabilities before it rewrites reality.
    `,
    difficulty: "Hard",
    xp: 1500,
    color: "from-orange-400 to-red-500",
    missions: [
      {
        id: "mission-3a",
        title: "Code Injection",
        description: `
          Erebus left a payload in the input field: "admin' OR '1'='1'; DROP TABLE users;--"
          The database screams. The worm exploited the Structured Query Language itself.
          Security logs flash: "ATTACK VECTOR: Database manipulation via untrusted input."
          What's the ABBREVIATED name of this attack that weaponizes SQL? (Hint: It's 4 letters)
        `,
        challenge: `
          >> THREAT CLASSIFICATION: SQL manipulation attack abbreviation?
          >> PAYLOAD TYPE: Injected query fragments. Four letters.
        `,
        tags: ["regex", "security"],
        xp: 400,
        difficulty: "Medium",
        hint: "SQL Injection. Take the first letters: S-Q-L-I. Capitalize it.",
        successText: "Threat contained. SQL shield activated.",
        correctAnswer: "SQLi",
      },
      {
        id: "mission-3b",
        title: "Data Sanitizer",
        description: `
          Erebus embedded poison in the HTML: "<script>steal(document.cookie)</script>"
          The browser executes it blindly. JavaScript code runs where it shouldn't.
          Security manual: "Attack crosses site boundaries. Scripts injected into trusted pages."
          The attack's name contains THREE letters. It's about CROSSING sites and SCRIPTING. What is it?
        `,
        challenge: `
          >> EXPLOIT TYPE: Three-letter attack using <script> tags?
          >> KEYWORDS: Cross, Site, Scripting. First letters.
        `,
        tags: ["regex", "html", "sanitization"],
        xp: 400,
        difficulty: "Medium",
        hint: "Cross-Site Scripting. X-S-S. Capitalize it.",
        successText: "Payload purified. Firewall stable.",
        correctAnswer: "XSS",
      },
      {
        id: "mission-3c",
        title: "Patch Transmission",
        description: `
          Erebus shattered the patch into 1,000 fragments: {id:732, data:"x7f"}, {id:12, data:"0x4a"}...
          They arrived CHAOTIC. The system demands ORDER. Packet IDs must be ARRANGED by value.
          The ancient algorithm that compares and SWAPS elements until they obey sequence.
          What's the fundamental operation called that puts chaos into order? (One word)
        `,
        challenge: `
          >> REASSEMBLY PROTOCOL: Algorithm that arranges elements by comparison?
          >> OPERATION: Compare, swap, repeat until ordered.
        `,
        tags: ["sorting", "data-assembly"],
        xp: 500,
        difficulty: "Hard",
        hint: "The -ing form of 'sort'. Ends with 'ing'.",
        successText: "Patch deployed. Infection neutralized.",
        correctAnswer: "Sorting",
      },
    ],
  },
  {
    id: "quest-4",
    title: "Echoes of the Terminal",
    tagline: "Whispers from an ancient hacker echo through the void.",
    story: `
      You discover terminal logs from a lost era—commands written by a legendary hacker named 'Zero'.
      Decode their final transmissions and learn the secret of the Byte Origin.
    `,
    difficulty: "Very Hard",
    xp: 1800,
    color: "from-blue-500 to-teal-500",
    missions: [
      {
        id: "mission-4a",
        title: "The Encoded Message",
        description: `
          Zero's final message is locked in Base64: "VGhlIGNvZGUgbGl2ZXMgb24="
          It's ENCODED—transformed into safe characters for transmission.
          To read Zero's words, you must REVERSE the encoding process.
          The opposite of ENCODE. The act of unwrapping the cipher. What's it called? (One word)
        `,
        challenge: `
          >> CIPHER REVERSAL: What's the inverse operation of encoding?
          >> TRANSFORMATION: Encoded → ??? → Original Message
        `,
        tags: ["string-manipulation", "crypto"],
        xp: 400,
        difficulty: "Hard",
        hint: "Starts with 'De-'. The opposite of 'encoding'.",
        successText: "Message decrypted: 'Zero was here.'",
        correctAnswer: "Decoding",
      },
      {
        id: "mission-4b",
        title: "Crash Trace",
        description: `
          Zero's crash log shows: "CALL main() → CALL process() → CALL fatal() → NO RETURN"
          Functions pile up. The LAST function called must FINISH FIRST.
          Like plates stacked high—you can only remove from the TOP.
          What's the LIFO data structure that tracks this call-and-return tower? (One word)
        `,
        challenge: `
          >> MEMORY MODEL: LIFO structure for function call tracking?
          >> BEHAVIOR: Last In, First Out. Like stacking plates.
        `,
        tags: ["stack", "simulation"],
        xp: 400,
        difficulty: "Hard",
        hint: "Think of a stack of books. The data structure has the same name.",
        successText: "Culprit located: fatal()",
        correctAnswer: "Stack",
      },
      {
        id: "mission-4c",
        title: "Reconstruct Timeline",
        description: `
          Zero's logs are scrambled. Two entries share timestamp 14:32:00.
          Command A appeared BEFORE Command B in the original sequence.
          You need a sort that PRESERVES their order when timestamps are equal.
          Some sorts scramble equal elements. Others STABILIZE them. Which property do you need?
        `,
        challenge: `
          >> SORT REQUIREMENT: Property that preserves equal element order?
          >> CHOICE: Stable or Unstable? (One word answer)
        `,
        tags: ["sorting", "data-merging"],
        xp: 500,
        difficulty: "Hard",
        hint: "Opposite of 'unstable'. Keeps things in their relative positions.",
        successText: "Timeline rebuilt. The legend lives on.",
        correctAnswer: "Stable",
      },
    ],
  },
];


export const cseFacts = [
  // Programming Wisdom
  "The best error message is the one that never shows up.",
  "Code never lies, comments sometimes do.",
  "First, solve the problem. Then, write the code.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "Programming isn't about what you know; it's about what you can figure out.",
  "The most disastrous thing that you can ever learn is your first programming language.",
  "Debugging is twice as hard as writing the code in the first place.",
  "Code is like humor. When you have to explain it, it's bad.",
  "Walking on water and developing software from a specification are easy if both are frozen.",
  "The cheapest, fastest, and most reliable components are those that aren't there.",
  
  // Algorithm Facts
  "Quicksort was invented by Tony Hoare in 1960 while he was a visiting student at Moscow State University.",
  "The word 'algorithm' comes from the name of the 9th-century Persian mathematician Al-Khwarizmi.",
  "Binary search can find an element in a billion items with just 30 comparisons.",
  "The traveling salesman problem has no known polynomial-time solution. It's NP-hard!",
  "Dijkstra's shortest path algorithm was conceived in 20 minutes without pen and paper.",
  "The Fast Fourier Transform (FFT) is one of the most important algorithms ever discovered.",
  "Bubble sort is almost never the right choice, yet it's taught in every CS course.",
  "Merge sort was invented by John von Neumann in 1945.",
  "The A* algorithm is used in everything from GPS navigation to video game AI.",
  "Dynamic programming: solve each subproblem once, remember it forever.",
  
  // Data Structure Facts
  "A hash table can achieve O(1) lookup time in the best case scenario.",
  "The stack data structure follows the Last-In-First-Out (LIFO) principle.",
  "Trees have nodes, but binary trees have exactly two children (or fewer).",
  "A perfect hash function has zero collisions. They're extremely rare.",
  "The height of a balanced binary search tree is O(log n).",
  "Linked lists don't need contiguous memory, unlike arrays.",
  "Graphs can represent social networks, maps, circuits, and even the web itself.",
  "A circular queue wraps around when it reaches the end.",
  "Red-black trees are used in the Linux kernel's process scheduler.",
  "Skip lists are a probabilistic alternative to balanced trees.",
  
  // Computer Science History
  "The first computer bug was an actual moth found in a Harvard Mark II computer in 1947.",
  "Ada Lovelace wrote the first computer algorithm in 1843, before computers even existed!",
  "The term 'bit' is a contraction of 'binary digit' coined by John Tukey in 1946.",
  "COBOL code from the 1960s is still running in banks today.",
  "The first computer mouse was made of wood and had only one button.",
  "UNIX was written in just three weeks by Ken Thompson while his wife was on vacation.",
  "The '@' symbol in email was chosen by Ray Tomlinson in 1971 because it was unlikely to appear in names.",
  "The first domain name ever registered was Symbolics.com on March 15, 1985.",
  "Python was named after Monty Python's Flying Circus, not the snake.",
  "The first 1GB hard drive weighed over 500 pounds and cost $40,000 in 1980.",
  
  // Fun CS Facts
  "There are only 10 types of people: those who understand binary and those who don't.",
  "The average programmer googles their own code at least once a day.",
  "Rubber duck debugging is a real technique: explain your code to a rubber duck!",
  "The first computer programmer was a woman: Ada Lovelace.",
  "Steve Wozniak built the first Apple computer without a monitor or keyboard.",
  "The original name for Windows was 'Interface Manager'.",
  "Google's first office was a garage in Menlo Park, California.",
  "The first programmer to use the term 'bug' was Grace Hopper.",
  "Linux is named after Linus Torvalds, who created it as a hobby project.",
  "The first tweet was sent by Jack Dorsey: 'just setting up my twttr'.",
  
  // Programming Languages
  "JavaScript was created in just 10 days by Brendan Eich in 1995.",
  "C++ was originally called 'C with Classes'.",
  "Java was originally designed for interactive television.",
  "PHP originally stood for 'Personal Home Page', now it's 'Hypertext Preprocessor'.",
  "Rust guarantees memory safety without garbage collection.",
  "Go was created at Google to improve programming productivity.",
  "Kotlin is named after an island near St. Petersburg, Russia.",
  "Swift was designed to be 'Objective-C without the C'.",
  "FORTRAN (1957) is the oldest programming language still in use.",
  "Lua means 'moon' in Portuguese.",
  
  // Complexity & Performance
  "O(n²) is acceptable for small inputs, catastrophic for large ones.",
  "Premature optimization is the root of all evil in programming.",
  "A well-designed cache can make software 100x faster.",
  "The difference between O(log n) and O(n) becomes massive after 10,000 items.",
  "Space complexity matters just as much as time complexity.",
  "Amortized analysis: sometimes slow operations are okay if they're rare.",
  "Tail recursion can be optimized to iteration by smart compilers.",
  "Memoization turns exponential algorithms into polynomial ones.",
  "The best algorithm depends on your data. Know your input!",
  "Big-O notation hides constants, but constants matter in real code.",
  
  // Security & Hacking
  "SQL injection remains the #1 web application security risk.",
  "The average data breach costs $4.24 million globally.",
  "Cross-Site Scripting (XSS) affects 53% of web applications.",
  "Two-factor authentication blocks 99.9% of automated attacks.",
  "The longest password ever cracked was 55 characters long.",
  "Buffer overflow attacks have existed since the 1970s.",
  "Rainbow tables can crack unsalted password hashes instantly.",
  "The Heartbleed bug affected 17% of all secure web servers.",
  "Social engineering causes 98% of cyber attacks.",
  "Encryption is math. Good encryption is really hard math.",
  
  // Boolean Logic & Bitwise
  "XOR is its own inverse: A XOR B XOR B = A",
  "Every boolean expression can be reduced to NAND gates only.",
  "De Morgan's laws: NOT (A AND B) = (NOT A) OR (NOT B)",
  "Left shift by n is the same as multiplying by 2^n.",
  "Bitwise operations are 10-100x faster than arithmetic operations.",
  "Two's complement lets computers subtract by adding negative numbers.",
  "A single bit flip can crash a program or compromise security.",
  "Brian Kernighan's algorithm counts set bits in O(number of set bits).",
  "The Hamming distance measures how many bits differ between two values.",
  "Bit masking is used in graphics, networking, and permissions.",
  
  // Networking & Web
  "The internet and the web are not the same thing.",
  "HTTP is stateless, but cookies make it seem stateful.",
  "DNS translates over 100 billion queries per day.",
  "The average webpage makes 74 HTTP requests.",
  "IPv6 has 340 undecillion possible addresses (340 trillion trillion trillion).",
  "TCP guarantees delivery, UDP doesn't—but UDP is faster.",
  "A CDN can reduce website load time by 50% or more.",
  "The first website ever created is still online: info.cern.ch",
  "WebSockets enable real-time bidirectional communication.",
  "HTTPS encrypts your data, HTTP sends it in plain text.",
  
  // Databases
  "NoSQL doesn't mean 'No SQL', it means 'Not Only SQL'.",
  "Database indexes speed up reads but slow down writes.",
  "ACID properties ensure database reliability: Atomicity, Consistency, Isolation, Durability.",
  "Normalization reduces redundancy, denormalization improves performance.",
  "MongoDB stores data in JSON-like documents called BSON.",
  "PostgreSQL is more compliant with SQL standards than MySQL.",
  "Eventual consistency: data will be consistent... eventually.",
  "Sharding distributes data across multiple machines for scalability.",
  "A database index is basically a hash table or B-tree.",
  "The CAP theorem: you can only have 2 of Consistency, Availability, Partition tolerance.",
  
  // AI & Machine Learning
  "Neural networks are inspired by the human brain's structure.",
  "Deep learning requires massive amounts of data and computing power.",
  "The perceptron algorithm was invented in 1958 by Frank Rosenblatt.",
  "Backpropagation is how neural networks learn from their mistakes.",
  "Overfitting is when your model memorizes instead of learning.",
  "GPT models have billions of parameters—GPT-3 has 175 billion!",
  "Reinforcement learning is how AlphaGo beat the world champion.",
  "Computer vision can now identify objects better than humans.",
  "Natural language processing makes Siri and Alexa possible.",
  "The Turing Test asks: can a machine convince you it's human?",
  
  // Operating Systems
  "Linux runs 96.3% of the world's top 1 million web servers.",
  "The Linux kernel has over 27 million lines of code.",
  "Windows 10 contains about 50 million lines of code.",
  "Context switching between processes takes microseconds but feels instant.",
  "Deadlock happens when processes wait for each other forever.",
  "Virtual memory lets programs use more RAM than physically available.",
  "The scheduler decides which process runs next—in nanoseconds.",
  "File systems organize data, but lost+found recovers orphaned files.",
  "Kernel mode has unlimited power, user mode is restricted for safety.",
  "The first Unix system ran on a PDP-7 with 8KB of RAM.",
  
  // Compilers & Languages
  "Compilers translate code to machine language, interpreters execute it directly.",
  "Lexical analysis is the first step in compilation: breaking code into tokens.",
  "Parse trees represent the grammatical structure of your code.",
  "Optimization can make code 10x faster without changing its behavior.",
  "Just-In-Time (JIT) compilation combines compilation and interpretation.",
  "Type inference lets compilers figure out types without explicit declarations.",
  "Garbage collection automatically frees unused memory.",
  "Assembly language is one step above machine code.",
  "High-level languages sacrifice control for productivity.",
  "Compiler errors are your friends—they catch bugs before runtime.",
  
  // Quirky & Funny
  "There are two hard things in CS: cache invalidation, naming things, and off-by-one errors.",
  "Hofstadter's Law: It always takes longer than you expect, even when accounting for Hofstadter's Law.",
  "99 little bugs in the code, 99 bugs to fix. Take one down, patch it around, 117 bugs in the code.",
  "Real programmers count from 0.",
  "HTML is not a programming language—don't @ me.",
  "The best comment is a well-written function name.",
  "Copy-paste programming is a valid strategy (sometimes).",
  "Tabs vs spaces: the eternal war with no winner.",
  "Semicolons in JavaScript: optional but controversial.",
  "The most dangerous phrase: 'It works on my machine.'",
  
  // Software Engineering
  "Code reviews catch 60% of bugs before they reach production.",
  "The DRY principle: Don't Repeat Yourself.",
  "KISS: Keep It Simple, Stupid.",
  "YAGNI: You Aren't Gonna Need It (don't over-engineer).",
  "Technical debt compounds like financial debt—with interest.",
  "Refactoring is cleaning your code without changing behavior.",
  "Unit tests are your safety net when refactoring.",
  "Continuous integration catches bugs within minutes of writing them.",
  "Documentation is a love letter to your future self.",
  "The best code is no code. The second best is less code.",
  
  // Graphics & Games
  "60 FPS means rendering a frame every 16.67 milliseconds.",
  "Ray tracing simulates how light actually behaves in the real world.",
  "Game loops run physics, rendering, and input every frame.",
  "Anti-aliasing smooths jagged edges by blending pixel colors.",
  "Texture mapping wraps 2D images around 3D objects.",
  "Collision detection uses bounding boxes before checking exact geometry.",
  "The Z-buffer solves the hidden surface problem in 3D graphics.",
  "Shaders are programs that run on your GPU.",
  "Procedural generation creates infinite content from algorithms.",
  "LOD (Level of Detail) shows simpler models when objects are far away.",
  
  // Cryptography
  "RSA encryption uses the fact that factoring large primes is hard.",
  "AES-256 encryption would take billions of years to brute force.",
  "Public key cryptography: encrypt with one key, decrypt with another.",
  "Hashing is one-way: you can't reverse SHA-256.",
  "Salt makes identical passwords hash to different values.",
  "End-to-end encryption means even the server can't read your messages.",
  "Diffie-Hellman key exchange happens over insecure channels safely.",
  "Blockchain is an immutable distributed ledger secured by cryptography.",
  "Quantum computers could break current encryption methods.",
  "Zero-knowledge proofs let you prove something without revealing it.",
  
  // Theoretical CS
  "P vs NP is the million-dollar question: can every verifiable problem be solved quickly?",
  "The halting problem is undecidable—no algorithm can solve it for all programs.",
  "Turing machines are theoretical computers that can compute anything computable.",
  "Church-Turing thesis: any computable function can be computed by a Turing machine.",
  "NP-complete problems are the hardest problems in NP.",
  "Gödel's incompleteness theorems show math has inherent limits.",
  "Lambda calculus is a minimal programming language with just functions.",
  "Finite automata recognize regular languages.",
  "Context-free grammars generate programming language syntax.",
  "The pumping lemma proves certain languages are not regular.",
  
  // Modern Tech
  "Moore's Law predicted transistor doubling every 2 years—it held for 50 years!",
  "Edge computing brings computation closer to data sources.",
  "Serverless doesn't mean no servers—it means you don't manage them.",
  "Containers isolate applications without full virtualization overhead.",
  "Kubernetes orchestrates thousands of containers across clusters.",
  "GraphQL lets clients request exactly the data they need.",
  "WebAssembly runs near-native speed in the browser.",
  "Service meshes manage microservice communication.",
  "Progressive Web Apps blur the line between web and native apps.",
  "JAMstack architecture: JavaScript, APIs, and Markup.",
  
  // Hacker Culture
  "The term 'hacker' originally meant someone who explores systems creatively.",
  "White hat hackers are the good guys; black hats are the villains.",
  "Bug bounty programs pay hackers to find vulnerabilities.",
  "The Morris worm (1988) was the first major internet worm.",
  "Kevin Mitnick was once the FBI's most wanted hacker.",
  "Anonymous uses Guy Fawkes masks as their symbol.",
  "DEF CON is the world's largest hacker conference.",
  "Capture The Flag (CTF) competitions test hacking skills.",
  "Social engineering exploits humans, not computers.",
  "Zero-day exploits are vulnerabilities unknown to the vendor.",
  
  // Boolean & Logic
  "Boolean algebra has only two values: true and false, 1 and 0.",
  "George Boole invented Boolean algebra in 1847—before computers!",
  "Short-circuit evaluation stops checking once the result is known.",
  "XOR is true when inputs differ: 1⊕0=1, 1⊕1=0.",
  "Karnaugh maps simplify boolean expressions visually.",
  "Every logic gate can be built from NAND gates alone.",
  "Three-valued logic includes true, false, and unknown (SQL uses this).",
  "Fuzzy logic allows partial truth: something can be 70% true.",
  "Propositional logic uses AND, OR, NOT. Predicate logic adds quantifiers.",
  "The pigeonhole principle: n+1 pigeons in n holes means one hole has 2+ pigeons.",
  
  // Inspirational Quotes
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "The only way to learn a new programming language is by writing programs in it. — Dennis Ritchie",
  "Simplicity is prerequisite for reliability. — Edsger Dijkstra",
  "Make it work, make it right, make it fast. — Kent Beck",
  "Programs must be written for people to read, and only incidentally for machines to execute. — Abelson & Sussman",
  "The function of good software is to make the complex appear simple. — Grady Booch",
  "Every great developer you know got there by solving problems they were unqualified to solve. — Patrick McKenzie",
  "Programming is the art of telling another human what one wants the computer to do. — Donald Knuth",
  "Software is a gas; it expands to fill its container. — Nathan Myhrvold",
  "The best performance improvement is the transition from the nonworking state to the working state. — John Ousterhout",
  
  // Mind-Blowing Facts
  "The first 1GB storage device was announced by IBM in 1980 and cost $40,000.",
  "NASA's Apollo 11 guidance computer had less processing power than a modern calculator.",
  "The first hard drive could store 5MB and weighed over a ton.",
  "Google processes over 8.5 billion searches per day.",
  "There are more possible chess games than atoms in the observable universe.",
  "A quantum computer can theoretically test all possibilities simultaneously.",
  "The Library of Babel contains every possible 410-page book—it's a real website!",
  "Folding@home, a distributed computing project, is more powerful than the world's top supercomputers combined.",
  "The RSA-2048 encryption key would take current computers trillions of years to crack.",
  "There are approximately 26.9 million software developers in the world.",
  
  // Recursion Jokes & Facts
  "To understand recursion, you must first understand recursion.",
  "Recursion: see Recursion.",
  "Every recursive function needs a base case, or it recurses forever.",
  "Recursion is elegant but can overflow the stack.",
  "The Fibonacci sequence is naturally recursive: fib(n) = fib(n-1) + fib(n-2).",
  "Tail-call optimization converts recursion to iteration automatically.",
  "Mutual recursion: function A calls B, B calls A.",
  "Recursive descent parsing reads code from top to bottom.",
  "Fractals are infinitely recursive patterns found in nature.",
  "Divide and conquer algorithms are inherently recursive.",
  
  // Data & Information
  "1 byte = 8 bits. 1 kilobyte = 1024 bytes (not 1000!).",
  "UTF-8 can encode over 1 million different characters.",
  "ASCII uses 7 bits, Extended ASCII uses 8.",
  "Big Endian vs Little Endian: how bytes are ordered in memory.",
  "A petabyte is 1024 terabytes. Google stores exabytes of data.",
  "Lossless compression (ZIP) preserves data. Lossy (JPEG) doesn't.",
  "Huffman coding compresses data by using shorter codes for frequent characters.",
  "Error-correcting codes can detect and fix bit flips automatically.",
  "Parity bits detect single-bit errors in data transmission.",
  "The Shannon entropy measures information content.",
  
  // Software Development
  "The mythical man-month: adding developers to a late project makes it later.",
  "Conway's Law: systems mirror the communication structure of the organization.",
  "The bus factor: how many developers can get hit by a bus before the project dies?",
  "Code coverage above 80% is good, but 100% coverage doesn't mean bug-free.",
  "Pair programming: two developers, one keyboard, better code.",
  "Agile development favors working software over comprehensive documentation.",
  "Git was created by Linus Torvalds in 2005 to manage Linux development.",
  "Semantic versioning: MAJOR.MINOR.PATCH (e.g., 2.4.1).",
  "The Pareto principle: 80% of bugs come from 20% of code.",
  "Feature flags let you deploy code without activating features.",
  
  // Famous Bugs & Hacks
  "The Y2K bug cost an estimated $300 billion to fix worldwide.",
  "The Therac-25 radiation machine killed 3 patients due to software bugs.",
  "The first buffer overflow exploit was documented in 1972.",
  "The Ariane 5 rocket exploded due to an integer overflow in 1996.",
  "The Mars Climate Orbiter crashed because one team used metric, another imperial.",
  "Heartbleed exposed private keys of 17% of secure servers in 2014.",
  "WannaCry ransomware infected 230,000 computers in 150 countries in 2017.",
  "The Stuxnet worm sabotaged Iranian nuclear centrifuges.",
  "Stack Overflow has over 50 million registered users.",
  "The goto statement is considered harmful. — Dijkstra's famous paper.",
  
  // Productivity & Best Practices
  "The average developer is productive for 2-4 hours a day.",
  "Code written at 2 AM is rarely good code.",
  "Version control saves careers. Commit often.",
  "Read code more than you write it—understanding matters.",
  "Naming is hard. Good names make code self-documenting.",
  "Functions should do one thing and do it well.",
  "Fewer dependencies mean fewer security vulnerabilities.",
  "Automated tests let you refactor fearlessly.",
  "Code that's easy to delete is better than code that's easy to extend.",
  "The rule of three: refactor when you've duplicated something three times.",
  
  // Future of CS
  "Quantum supremacy: quantum computers solving problems classical computers can't.",
  "AI alignment: ensuring AI goals match human values.",
  "Neuromorphic computing mimics brain architecture in hardware.",
  "DNA storage could fit all world's data in a few kilograms.",
  "Photonic computing uses light instead of electricity.",
  "Brain-computer interfaces could let us code with thoughts.",
  "AGI (Artificial General Intelligence) remains decades away.",
  "6G networks will be 100x faster than 5G.",
  "Protein folding solved by AI (AlphaFold) won a Nobel Prize concept.",
  "The singularity: the hypothetical point when AI surpasses human intelligence.",
];

// Get daily fact based on day of year
export function getDailyFact(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use day of year to pick a fact (cycles through all 150)
  const index = dayOfYear % cseFacts.length;
  return cseFacts[index];
}


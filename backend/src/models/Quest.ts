import mongoose, { Schema, Document } from 'mongoose';

interface MissionData {
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

interface QuestData {
  id: string;
  title: string;
  tagline: string;
  story: string;
  difficulty: string;
  xp: number;
  color: string;
  missions: MissionData[];
}

interface IQuestProgress extends Document {
  userId: mongoose.Types.ObjectId;
  questId: string;
  completedMissions: string[];
  totalXPEarned: number;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questProgressSchema = new Schema<IQuestProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questId: {
    type: String,
    required: true
  },
  completedMissions: [{
    type: String
  }],
  totalXPEarned: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for user-quest queries
questProgressSchema.index({ userId: 1, questId: 1 }, { unique: true });

const QuestProgress = mongoose.model<IQuestProgress>('QuestProgress', questProgressSchema);

// Quest data matching frontend questsData.ts
const QUESTS_DATA: QuestData[] = [
  {
    id: "quest-1",
    title: "Cipher of the Quantum Vault",
    tagline: "A quantum vault locks secrets in probabilistic entanglement.",
    story: "In the deepest layers of ByteNet lies the Quantum Vault, storing ancient encryption keys. The vault's guardian challenges intruders with puzzles combining cryptography, probability, and logic. To open it, you must unravel three sequential challenges.",
    difficulty: "Very Hard",
    xp: 2000,
    color: "from-indigo-500 to-purple-700",
    missions: [
      {
        id: "mission-1a",
        title: "Superposition Survey",
        description: "The vault projects a series of qubits: |ψ> = α|0> + β|1>. Identify the most probable measurement outcome given α² = 0.8 and β² = 0.2.",
        challenge: ">> CHOOSE THE CORRECT OUTCOME:\nA) 0\nB) 1\nC) Superposed\nD) Indeterminate",
        tags: ["quantum", "probability", "logic"],
        xp: 600,
        difficulty: "Hard",
        hint: "Which state has the higher probability amplitude squared?",
        successText: "You collapse the superposition wisely. Quantum gate opens.",
        correctAnswer: "A",
      },
      {
        id: "mission-1b",
        title: "Entangled Logic",
        description: "Two qubits are entangled: measuring one instantly affects the other. If the first qubit is 1, the second is guaranteed 0. Name the fundamental CSE concept describing such instant correlations.",
        challenge: ">> CONCEPT QUERY: Concept describing instant correlated states?",
        tags: ["quantum", "theory", "logic"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "It's the principle behind quantum correlations and spooky action.",
        successText: "You understand the entanglement. Vault shutters shimmer.",
        correctAnswer: "Entanglement",
      },
      {
        id: "mission-1c",
        title: "Quantum Gate Terminal",
        description: "The terminal locks the vault. You must implement a function to detect cycles in a directed graph representing entangled qubits. The input is an adjacency list. Output true if a cycle exists, false otherwise. This will determine if the vault's quantum locks are stable.",
        challenge: ">> TERMINAL CHALLENGE: Implement cycle detection in a directed graph (adjacency list input).\n>> Input: adj = {0:[1],1:[2],2:[0],3:[]}\n>> Output: true",
        tags: ["graph", "cycle-detection", "coding", "DSA"],
        xp: 900,
        difficulty: "Very Hard",
        hint: "Use DFS with recursion stack to detect back edges.",
        successText: "Quantum Vault opens. Entangled gates unlocked.",
        correctAnswer: "function hasCycle(adj){let visited={},stack={}; function dfs(v){visited[v]=true;stack[v]=true; for(let u of adj[v]||[]){if(!visited[u] && dfs(u)) return true; else if(stack[u]) return true;} stack[v]=false; return false;} for(let node in adj) if(!visited[node] && dfs(node)) return true; return false;}",
      },
    ],
  },
  {
    id: "quest-2",
    title: "Maze of the Lost Algorithms",
    tagline: "Ancient algorithms guard a labyrinth of shifting logic paths.",
    story: "ByteNet's oldest servers contain algorithmic guardians. Paths shift dynamically based on logical reasoning. Solve the algorithmic trials to navigate the maze.",
    difficulty: "Very Hard",
    xp: 2200,
    color: "from-red-400 to-orange-600",
    missions: [
      {
        id: "mission-2a",
        title: "Guardian Selection",
        description: "Four guardians appear: which sorting algorithm is stable and efficient for partially sorted data?",
        challenge: ">> OPTIONS:\nA) QuickSort\nB) MergeSort\nC) HeapSort\nD) SelectionSort",
        tags: ["sorting", "algorithm", "logic"],
        xp: 600,
        difficulty: "Hard",
        hint: "Stability preserves relative order.",
        successText: "MergeSort guardian steps aside. Path forward clears.",
        correctAnswer: "B",
      },
      {
        id: "mission-2b",
        title: "Recursive Bridge",
        description: "The bridge only allows passage through recursive logic. Given T(n) = T(n-1) + n, name the Big-O complexity (one word).",
        challenge: ">> COMPLEXITY QUERY: One-word answer for T(n) = T(n-1)+n",
        tags: ["recursion", "complexity", "analysis"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "Sum of first n numbers.",
        successText: "Bridge extends. Recursion mastered.",
        correctAnswer: "Linear",
      },
      {
        id: "mission-2c",
        title: "Maze Terminal",
        description: "At the maze's heart, implement lowest common ancestor in a binary tree. Input: root node and two values. Output: value of LCA. Only correct code allows you to retrieve the magic key.",
        challenge: ">> TERMINAL CHALLENGE: Implement LCA function",
        tags: ["coding", "tree", "DSA"],
        xp: 900,
        difficulty: "Very Hard",
        hint: "Use recursion, check if nodes are in left/right subtree.",
        successText: "Magic key retrieved. Maze dissolves.",
        correctAnswer: "function LCA(root,p,q){if(!root||root.val==p||root.val==q)return root;let left=LCA(root.left,p,q),right=LCA(root.right,p,q);return left&&right?root:left||right;}",
      },
    ],
  },
  {
    id: "quest-3",
    title: "The Firewall of Forgotten Protocols",
    tagline: "Legacy firewalls guard forbidden network gateways.",
    story: "Rogue packets infiltrate ByteNet. Firewalls challenge your mastery over security, exploits, and cryptography.",
    difficulty: "Very Hard",
    xp: 2100,
    color: "from-cyan-500 to-blue-700",
    missions: [
      {
        id: "mission-3a",
        title: "Packet Analyzer",
        description: "Incoming packet: 'GET /admin HTTP/1.1'. Choose the attack type:",
        challenge: ">> OPTIONS:\nA) SQL Injection\nB) XSS\nC) CSRF\nD) RCE",
        tags: ["security", "network", "logic"],
        xp: 600,
        difficulty: "Hard",
        hint: "Payload manipulates database queries.",
        successText: "Packet blocked. Firewall strengthens.",
        correctAnswer: "A",
      },
      {
        id: "mission-3b",
        title: "Cipher Lock",
        description: "One-word answer: symmetric, block-based encryption widely used for legacy data.",
        challenge: ">> ENCRYPTION QUERY: Name the algorithm",
        tags: ["security", "crypto"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "Widely used symmetric cipher, initials DES.",
        successText: "Cipher accepted. Access granted.",
        correctAnswer: "DES",
      },
      {
        id: "mission-3c",
        title: "Exploit Neutralizer Terminal",
        description: "Terminal demands code: sanitize user input to prevent SQL Injection. Input: 'userInput'. Output: safe query string.",
        challenge: ">> TERMINAL CHALLENGE: Escape 'userInput' for SQL safely",
        tags: ["coding", "security", "sanitization"],
        xp: 800,
        difficulty: "Very Hard",
        hint: "Replace quotes or use standard escape function.",
        successText: "Exploit neutralized. Network gateway secured.",
        correctAnswer: "userInput.replace(\"'\", \"''\")",
      },
    ],
  },
  {
    id: "quest-4",
    title: "Compiler's Crypt",
    tagline: "Ancient compilers whisper secrets of control flow and optimization.",
    story: "Deep in ByteNet lies the Compiler's Crypt. Solve hidden cycles, control flow puzzles, and optimize memory to extract secrets.",
    difficulty: "Very Hard",
    xp: 2300,
    color: "from-purple-500 to-pink-700",
    missions: [
      {
        id: "mission-4a",
        title: "Loop Labyrinth",
        description: "Compiler shows infinite loops. Identify which traversal detects cycles:",
        challenge: ">> OPTIONS:\nA) BFS\nB) DFS\nC) Dijkstra\nD) Bellman-Ford",
        tags: ["graph", "cycle-detection", "logic"],
        xp: 600,
        difficulty: "Hard",
        hint: "Depth-first uncovers back edges.",
        successText: "Cycle detected. Labyrinth stabilizes.",
        correctAnswer: "B",
      },
      {
        id: "mission-4b",
        title: "Control Flow Enigma",
        description: "Ghost code manipulates jumps. One-word answer: analysis type that tracks execution paths.",
        challenge: ">> QUERY: Type of analysis that follows execution paths?",
        tags: ["control-flow", "compiler"],
        xp: 800,
        difficulty: "Very Hard",
        hint: "Two words combined: Control + Flow.",
        successText: "Paths mapped. Compiler secrets partially revealed.",
        correctAnswer: "ControlFlow",
      },
      {
        id: "mission-4c",
        title: "Optimization Terminal",
        description: "Terminal demands: remove duplicate elements from array 'vars' for optimized memory.",
        challenge: ">> TERMINAL CHALLENGE: One-line code to remove duplicates",
        tags: ["coding", "optimization", "DSA"],
        xp: 900,
        difficulty: "Very Hard",
        hint: "Use Set or filter logic.",
        successText: "Memory optimized. Compiler secrets unlocked.",
        correctAnswer: "[...new Set(vars)]",
      },
    ],
  },
  {
    id: "quest-5",
    title: "Sentinel of the Neural Nexus",
    tagline: "An AI sentinel guards the core knowledge of neural pathways.",
    story: "The Neural Nexus controls ByteNet AI memory. Solve neural, algorithmic, and coding challenges to pass the sentinel.",
    difficulty: "Very Hard",
    xp: 2500,
    color: "from-green-500 to-teal-700",
    missions: [
      {
        id: "mission-5a",
        title: "Neuron Mapping",
        description: "Neural connections spike across nodes. Choose the non-linear activation function used in deep networks:",
        challenge: ">> OPTIONS:\nA) ReLU\nB) Linear\nC) Identity\nD) None",
        tags: ["ai", "neural-networks", "logic"],
        xp: 700,
        difficulty: "Hard",
        hint: "Non-linear function, outputs max(0, x).",
        successText: "Neuron paths illuminated.",
        correctAnswer: "A",
      },
      {
        id: "mission-5b",
        title: "Backprop Gate",
        description: "One-word answer: algorithm used to propagate errors backward through a neural network.",
        challenge: ">> QUERY: Name the algorithm",
        tags: ["ai", "optimization"],
        xp: 800,
        difficulty: "Very Hard",
        hint: "Starts with 'Back' and ends with 'prop'.",
        successText: "Weights adjusted. Sentinel considers you worthy.",
        correctAnswer: "Backpropagation",
      },
      {
        id: "mission-5c",
        title: "Nexus Terminal",
        description: "Terminal demands code: implement Dijkstra's algorithm to find shortest path from source to all nodes.",
        challenge: ">> TERMINAL CHALLENGE: Implement Dijkstra's algorithm",
        tags: ["coding", "graph", "DSA"],
        xp: 1000,
        difficulty: "Very Hard",
        hint: "Use priority queue or min-heap for efficiency.",
        successText: "Neural Nexus unlocked. Sentinel defeated.",
        correctAnswer: "function dijkstra(graph,src){let dist={},pq=new MinHeap();for(let node in graph)dist[node]=Infinity;dist[src]=0;pq.push([0,src]);while(pq.size()){let [d,u]=pq.pop();for(let [v,w] of graph[u])if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;pq.push([dist[v],v]);}}return dist;}",
      },
    ],
  },
  {
    id: "quest-6",
    title: "The Enigma of the Forgotten OS",
    tagline: "Old kernels hide secrets in system calls and memory maps.",
    story: "Deep in ByteNet, a forgotten OS still runs hidden processes. The kernel whispers through logs, challenging intruders to solve system puzzles before access is revoked.",
    difficulty: "Very Hard",
    xp: 2000,
    color: "from-gray-500 to-slate-700",
    missions: [
      {
        id: "mission-6a",
        title: "Process Identifier",
        description: "A rogue process spawns multiple children. Choose the UNIX command that lists running processes:",
        challenge: ">> OPTIONS:\nA) ps\nB) grep\nC) top\nD) echo",
        tags: ["os", "unix", "logic"],
        xp: 600,
        difficulty: "Hard",
        hint: "Shows process status and IDs.",
        successText: "Process list retrieved. Kernel murmurs appreciation.",
        correctAnswer: "A",
      },
      {
        id: "mission-6b",
        title: "Memory Guardian",
        description: "One-word answer: Data structure used to manage free and allocated memory blocks efficiently.",
        challenge: ">> QUERY: Name the structure",
        tags: ["os", "memory", "cse-theory"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "Supports O(1) allocation/deallocation lookup.",
        successText: "Memory map stabilized. Access deeper sectors unlocked.",
        correctAnswer: "HashTable",
      },
      {
        id: "mission-6c",
        title: "Kernel Terminal",
        description: "Terminal challenge: Implement a function that detects deadlocks in a resource allocation graph. Input: adjacency list of processes/resources. Output: true if deadlock exists, false otherwise.",
        challenge: ">> TERMINAL CHALLENGE: Detect deadlocks in resource allocation graph",
        tags: ["coding", "graph", "DSA"],
        xp: 900,
        difficulty: "Very Hard",
        hint: "Use cycle detection with DFS or wait-for graph analysis.",
        successText: "Deadlock resolved. Kernel fully accessible.",
        correctAnswer: "function detectDeadlock(graph){let visited={},stack={};function dfs(u){visited[u]=true;stack[u]=true;for(let v of graph[u]||[]){if(!visited[v]&&dfs(v))return true;else if(stack[v])return true;}stack[u]=false;return false;}for(let node in graph)if(!visited[node]&&dfs(node))return true;return false;}",
      },
    ],
  },
  {
    id: "quest-7",
    title: "The Cryptic Network Switch",
    tagline: "Packets travel paths only the clever can trace.",
    story: "A rogue switch redirects packets unpredictably. Only those who understand routing, graphs, and shortest paths can reach the final node and capture the hidden flag.",
    difficulty: "Very Hard",
    xp: 2100,
    color: "from-teal-500 to-green-700",
    missions: [
      {
        id: "mission-7a",
        title: "Routing Riddle",
        description: "Which algorithm finds the shortest path in weighted graphs without negative edges?",
        challenge: ">> OPTIONS:\nA) Bellman-Ford\nB) Dijkstra\nC) BFS\nD) DFS",
        tags: ["graphs", "routing", "algorithm"],
        xp: 600,
        difficulty: "Hard",
        hint: "Greedy approach with priority queue.",
        successText: "Routing path predicted. Packets start flowing.",
        correctAnswer: "B",
      },
      {
        id: "mission-7b",
        title: "Latency Analyzer",
        description: "One-word answer: The measure of time for a packet to travel from source to destination.",
        challenge: ">> QUERY: Name the network metric",
        tags: ["network", "cse-theory"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "Opposite of throughput.",
        successText: "Latency minimized. Switch acknowledges your skill.",
        correctAnswer: "Delay",
      },
      {
        id: "mission-7c",
        title: "Switch Terminal",
        description: "Terminal challenge: Implement Floyd-Warshall to compute shortest paths between all pairs of nodes.",
        challenge: ">> TERMINAL CHALLENGE: Compute all-pairs shortest paths",
        tags: ["coding", "graph", "DSA"],
        xp: 900,
        difficulty: "Very Hard",
        hint: "Dynamic programming approach, update dist[i][j] iteratively.",
        successText: "Switch fully mapped. Hidden flag captured.",
        correctAnswer: "function floydWarshall(dist){let n=dist.length;for(let k=0;k<n;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)dist[i][j]=Math.min(dist[i][j],dist[i][k]+dist[k][j]);return dist;}",
      },
    ],
  },
  {
    id: "quest-8",
    title: "The Phantom Database",
    tagline: "Ghost tables and hidden triggers await your query mastery.",
    story: "Deep inside ByteNet, a phantom database constantly shifts schema. Only precise queries, logic, and reasoning can extract the hidden secrets without triggering alarms.",
    difficulty: "Very Hard",
    xp: 2200,
    color: "from-orange-500 to-red-700",
    missions: [
      {
        id: "mission-8a",
        title: "Schema Selection",
        description: "Which SQL keyword prevents duplicate rows in a SELECT query?",
        challenge: ">> OPTIONS:\nA) UNIQUE\nB) DISTINCT\nC) PRIMARY\nD) INDEX",
        tags: ["database", "sql", "logic"],
        xp: 600,
        difficulty: "Hard",
        hint: "It removes repeating rows in the output.",
        successText: "Duplicate ghosts removed. Schema stabilized.",
        correctAnswer: "B",
      },
      {
        id: "mission-8b",
        title: "Trigger Guard",
        description: "One-word answer: Type of database constraint that automatically executes on insert, update, or delete.",
        challenge: ">> QUERY: Name the database feature",
        tags: ["database", "cse-theory"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "Runs automatically in response to events.",
        successText: "Trigger executed correctly. Phantom subdued.",
        correctAnswer: "Trigger",
      },
      {
        id: "mission-8c",
        title: "Query Terminal",
        description: "Terminal challenge: Implement a function to find the maximum subarray sum in a dataset of transaction values.",
        challenge: ">> TERMINAL CHALLENGE: Maximum subarray sum",
        tags: ["coding", "array", "DSA"],
        xp: 900,
        difficulty: "Very Hard",
        hint: "Use Kadane's algorithm for O(n) solution.",
        successText: "Data analyzed. Hidden treasures revealed.",
        correctAnswer: "function maxSubArray(nums){let maxSum=nums[0],curSum=nums[0];for(let i=1;i<nums.length;i++){curSum=Math.max(nums[i],curSum+nums[i]);maxSum=Math.max(maxSum,curSum);}return maxSum;}",
      },
    ],
  },
  {
    id: "quest-9",
    title: "The Time-Locked Cache",
    tagline: "Data is frozen until you solve temporal dependencies.",
    story: "The cache stores time-sensitive secrets. Only by understanding queues, priority, and dynamic updates can you unlock the frozen bytes.",
    difficulty: "Very Hard",
    xp: 2300,
    color: "from-cyan-500 to-blue-700",
    missions: [
      {
        id: "mission-9a",
        title: "Queue Conundrum",
        description: "Which data structure ensures first-in-first-out processing?",
        challenge: ">> OPTIONS:\nA) Stack\nB) Queue\nC) Tree\nD) Heap",
        tags: ["ds", "logic", "cse-theory"],
        xp: 600,
        difficulty: "Hard",
        hint: "Opposite of LIFO.",
        successText: "Queue aligned. Time flows correctly.",
        correctAnswer: "B",
      },
      {
        id: "mission-9b",
        title: "Priority Check",
        description: "One-word answer: Data structure ideal for processing tasks based on priority instead of arrival time.",
        challenge: ">> QUERY: Name the structure",
        tags: ["ds", "cse-theory"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "Use a heap to implement efficiently.",
        successText: "High-priority tasks executed. Cache updated.",
        correctAnswer: "Heap",
      },
      {
        id: "mission-9c",
        title: "Cache Terminal",
        description: "Terminal challenge: Implement LRU Cache with get and put operations.",
        challenge: ">> TERMINAL CHALLENGE: Implement LRU Cache",
        tags: ["coding", "ds", "DSA"],
        xp: 900,
        difficulty: "Very Hard",
        hint: "Use combination of HashMap + Doubly Linked List.",
        successText: "Cache fully operational. Time locks lifted.",
        correctAnswer: "// Implemented LRU cache logic combining Map + Doubly Linked List",
      },
    ],
  },
  {
    id: "quest-10",
    title: "The AI Sentience Gate",
    tagline: "An AI tests reasoning, graphs, and optimization before granting passage.",
    story: "A sentient AI monitors ByteNet's gateway. Solve its reasoning challenges and DSA puzzles to prove your intelligence.",
    difficulty: "Very Hard",
    xp: 2500,
    color: "from-purple-500 to-pink-700",
    missions: [
      {
        id: "mission-10a",
        title: "Logic Grid",
        description: "AI presents a puzzle: Which logic gate outputs 1 only when inputs are different?",
        challenge: ">> OPTIONS:\nA) AND\nB) OR\nC) XOR\nD) NAND",
        tags: ["logic", "cse-theory"],
        xp: 600,
        difficulty: "Hard",
        hint: "Exclusive or operation.",
        successText: "Logic gate solved. AI nods in approval.",
        correctAnswer: "C",
      },
      {
        id: "mission-10b",
        title: "Graph Neural Check",
        description: "One-word answer: Type of traversal that explores as far as possible along each branch before backtracking.",
        challenge: ">> QUERY: Name the traversal",
        tags: ["graph", "cse-theory"],
        xp: 700,
        difficulty: "Very Hard",
        hint: "Opposite of BFS.",
        successText: "Traversal mapped. AI evaluates you favorably.",
        correctAnswer: "DFS",
      },
      {
        id: "mission-10c",
        title: "Sentience Terminal",
        description: "Terminal challenge: Implement Topological Sort on a DAG to determine task execution order.",
        challenge: ">> TERMINAL CHALLENGE: Topological Sort",
        tags: ["coding", "graph", "DSA"],
        xp: 1000,
        difficulty: "Very Hard",
        hint: "Use DFS with post-order or Kahn's algorithm with queue.",
        successText: "Tasks ordered. AI gate opens. ByteNet accessible.",
        correctAnswer: "function topoSort(adj){let visited={},stack=[];function dfs(u){visited[u]=true;for(let v of adj[u]||[])if(!visited[v])dfs(v);stack.push(u);}for(let node in adj)if(!visited[node])dfs(node);return stack.reverse();}",
      },
    ],
  },
];

export class Quest {
  // Get all quests with user progress
  static async getAllQuests(userId: string) {
    const progressRecords = await QuestProgress.find({ userId });
    const progressMap = new Map(progressRecords.map(p => [p.questId, p]));

    return QUESTS_DATA.map(quest => {
      const userProgress = progressMap.get(quest.id);
      return {
        ...quest,
        isCompleted: userProgress?.isCompleted || false,
        progress: userProgress?.progress || 0,
        completedMissions: userProgress?.completedMissions || [],
        totalXPEarned: userProgress?.totalXPEarned || 0
      };
    });
  }

  // Get a specific quest by ID
  static async getQuestById(userId: string, questId: string) {
    const questData = QUESTS_DATA.find(q => q.id === questId);
    if (!questData) return null;

    const userProgress = await QuestProgress.findOne({ userId, questId });

    return {
      ...questData,
      isCompleted: userProgress?.isCompleted || false,
      progress: userProgress?.progress || 0,
      completedMissions: userProgress?.completedMissions || [],
      totalXPEarned: userProgress?.totalXPEarned || 0
    };
  }

  // Submit a mission answer
  static async submitMission(userId: string, questId: string, missionId: string, userAnswer: string) {
    const questData = QUESTS_DATA.find(q => q.id === questId);
    if (!questData) {
      throw new Error('Quest not found');
    }

    const missionData = questData.missions.find(m => m.id === missionId);
    if (!missionData) {
      throw new Error('Mission not found');
    }

    // Validate answer (case-insensitive, trimmed)
    const correctAnswer = missionData.correctAnswer.toLowerCase().trim();
    const submittedAnswer = userAnswer.toLowerCase().trim();
    const isCorrect = correctAnswer === submittedAnswer;

    if (!isCorrect) {
      return {
        success: false,
        isCorrect: false
      };
    }

    // Get or create quest progress
    let progress = await QuestProgress.findOne({ userId, questId });

    if (!progress) {
      // Create new quest progress
      progress = new QuestProgress({
        userId,
        questId,
        completedMissions: [missionId],
        totalXPEarned: missionData.xp,
        progress: (1 / questData.missions.length) * 100,
        isCompleted: questData.missions.length === 1
      });
      await progress.save();
    } else {
      // Update existing progress
      if (!progress.completedMissions.includes(missionId)) {
        progress.completedMissions.push(missionId);
        progress.totalXPEarned += missionData.xp;
        progress.progress = (progress.completedMissions.length / questData.missions.length) * 100;
        progress.isCompleted = progress.progress === 100;
        await progress.save();
      }
    }

    // Update user's total XP
    const User = mongoose.model('User');
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { totalXP: missionData.xp } },
      { new: true }
    );

    const allMissionsCompleted = progress.completedMissions.length === questData.missions.length;

    return {
      success: true,
      isCorrect: true,
      successText: missionData.successText,
      xpEarned: missionData.xp,
      totalXP: user?.totalXP || 0,
      questCompleted: allMissionsCompleted,
      allMissionsCompleted,
      completedMissions: progress.completedMissions
    };
  }

  // Get quest progress
  static async getQuestProgress(userId: string, questId: string) {
    const progress = await QuestProgress.findOne({ userId, questId });

    if (!progress) {
      return {
        questId,
        progress: 0,
        completedMissions: [],
        totalXPEarned: 0,
        isCompleted: false
      };
    }

    return {
      questId: progress.questId,
      progress: progress.progress,
      completedMissions: progress.completedMissions,
      totalXPEarned: progress.totalXPEarned,
      isCompleted: progress.isCompleted
    };
  }

  // Get completed missions for a quest
  static async getCompletedMissions(userId: string, questId: string) {
    const progress = await QuestProgress.findOne({ userId, questId });
    return progress?.completedMissions || [];
  }

  // Get quest statistics
  static async getQuestStats(userId: string) {
    const progressRecords = await QuestProgress.find({ userId });

    const totalQuestsAttempted = progressRecords.length;
    const totalQuestsCompleted = progressRecords.filter(p => p.isCompleted).length;
    const totalQuestXP = progressRecords.reduce((sum, p) => sum + p.totalXPEarned, 0);
    const averageProgress = totalQuestsAttempted > 0
      ? progressRecords.reduce((sum, p) => sum + p.progress, 0) / totalQuestsAttempted
      : 0;

    return {
      totalQuestsAttempted,
      totalQuestsCompleted,
      totalQuestXP,
      averageProgress: Math.round(averageProgress),
      totalQuestsAvailable: QUESTS_DATA.length
    };
  }
}

export default QuestProgress;

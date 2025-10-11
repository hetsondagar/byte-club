// Adventure Map Positions - Optimized Spacing
// Creates a well-distributed, non-linear path with proper spacing
// 100 nodes spread across the entire canvas with minimum overlap

export const nodePositions = [
  // REGION 1: The Beginning (Bottom-Left)
  { x: 5, y: 90 },   // 1
  { x: 8, y: 85 },   // 2
  { x: 12, y: 80 },  // 3
  { x: 16, y: 75 },  // 4
  { x: 20, y: 70 },  // 5
  { x: 24, y: 65 },  // 6
  { x: 28, y: 60 },  // 7
  { x: 32, y: 55 },  // 8
  { x: 36, y: 50 },  // 9
  { x: 40, y: 45 },  // 10

  // REGION 2: The Ascent (Left Side)
  { x: 44, y: 40 },  // 11
  { x: 48, y: 35 },  // 12
  { x: 52, y: 30 },  // 13
  { x: 56, y: 25 },  // 14
  { x: 60, y: 20 },  // 15
  { x: 64, y: 15 },  // 16
  { x: 68, y: 10 },  // 17
  { x: 72, y: 8 },   // 18
  { x: 76, y: 12 },  // 19
  { x: 80, y: 16 },  // 20

  // REGION 3: The Summit Ridge (Top)
  { x: 84, y: 20 },  // 21
  { x: 88, y: 24 },  // 22
  { x: 92, y: 28 },  // 23
  { x: 95, y: 32 },  // 24
  { x: 93, y: 36 },  // 25
  { x: 90, y: 40 },  // 26
  { x: 86, y: 44 },  // 27
  { x: 82, y: 48 },  // 28
  { x: 78, y: 52 },  // 29
  { x: 74, y: 56 },  // 30

  // REGION 4: The Northern Descent (Top-Right)
  { x: 70, y: 60 },  // 31
  { x: 66, y: 64 },  // 32
  { x: 62, y: 68 },  // 33
  { x: 58, y: 72 },  // 34
  { x: 54, y: 76 },  // 35
  { x: 50, y: 80 },  // 36
  { x: 46, y: 84 },  // 37
  { x: 42, y: 88 },  // 38
  { x: 38, y: 92 },  // 39
  { x: 34, y: 95 },  // 40

  // REGION 5: The Eastern Path (Right Side)
  { x: 30, y: 90 },  // 41
  { x: 26, y: 85 },  // 42
  { x: 22, y: 80 },  // 43
  { x: 18, y: 75 },  // 44
  { x: 14, y: 70 },  // 45
  { x: 10, y: 65 },  // 46
  { x: 6, y: 60 },   // 47
  { x: 8, y: 55 },   // 48
  { x: 12, y: 50 },  // 49
  { x: 16, y: 45 },  // 50

  // REGION 6: The Central Plains (Center-Left)
  { x: 20, y: 40 },  // 51
  { x: 24, y: 35 },  // 52
  { x: 28, y: 30 },  // 53
  { x: 32, y: 25 },  // 54
  { x: 36, y: 20 },  // 55
  { x: 40, y: 15 },  // 56
  { x: 44, y: 12 },  // 57
  { x: 48, y: 16 },  // 58
  { x: 52, y: 20 },  // 59
  { x: 56, y: 24 },  // 60

  // REGION 7: The Mountain Pass (Center)
  { x: 60, y: 28 },  // 61
  { x: 64, y: 32 },  // 62
  { x: 68, y: 36 },  // 63
  { x: 72, y: 40 },  // 64
  { x: 76, y: 44 },  // 65
  { x: 80, y: 48 },  // 66
  { x: 84, y: 52 },  // 67
  { x: 88, y: 56 },  // 68
  { x: 92, y: 60 },  // 69
  { x: 95, y: 64 },  // 70

  // REGION 8: The Western Reach (Left-Center)
  { x: 90, y: 68 },  // 71
  { x: 85, y: 72 },  // 72
  { x: 80, y: 76 },  // 73
  { x: 75, y: 80 },  // 74
  { x: 70, y: 84 },  // 75
  { x: 65, y: 88 },  // 76
  { x: 60, y: 92 },  // 77
  { x: 55, y: 95 },  // 78
  { x: 50, y: 92 },  // 79
  { x: 45, y: 88 },  // 80

  // REGION 9: The Southern Path (Bottom-Center)
  { x: 40, y: 84 },  // 81
  { x: 35, y: 80 },  // 82
  { x: 30, y: 76 },  // 83
  { x: 25, y: 72 },  // 84
  { x: 20, y: 68 },  // 85
  { x: 15, y: 64 },  // 86
  { x: 10, y: 60 },  // 87
  { x: 8, y: 55 },   // 88
  { x: 12, y: 50 },  // 89
  { x: 16, y: 45 },  // 90

  // REGION 10: The Final Challenge (Bottom-Right)
  { x: 20, y: 40 },  // 91
  { x: 25, y: 35 },  // 92
  { x: 30, y: 30 },  // 93
  { x: 35, y: 25 },  // 94
  { x: 40, y: 20 },  // 95
  { x: 45, y: 15 },  // 96
  { x: 50, y: 10 },  // 97
  { x: 55, y: 8 },   // 98
  { x: 60, y: 12 },  // 99
  { x: 65, y: 16 }   // 100 - THE FINAL FORTRESS
];
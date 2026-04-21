// Random Draw
export const runRandomDraw = (): number[] => {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(n)) numbers.push(n)
  }
  return numbers.sort((a, b) => a - b)
}

// Algorithmic Draw (weighted by user score frequency)
export const runAlgorithmicDraw = (allScores: number[]): number[] => {
  // Build frequency map
  const freq: Record<number, number> = {}
  allScores.forEach(s => { freq[s] = (freq[s] || 0) + 1 })
  
  // Weight: least frequent scores get higher weight (more interesting draw)
  const maxFreq = Math.max(...Object.values(freq), 0)
  const weighted: number[] = []
  for (let n = 1; n <= 45; n++) {
    const weight = maxFreq - (freq[n] || 0) + 1
    for (let i = 0; i < weight; i++) weighted.push(n)
  }
  
  // Pick 5 unique from weighted pool
  const picked: number[] = []
  while (picked.length < 5) {
    const idx = Math.floor(Math.random() * weighted.length)
    const n = weighted[idx]
    if (!picked.includes(n)) picked.push(n)
  }
  return picked.sort((a, b) => a - b)
}

// Check match count between drawn numbers and user scores
export const checkMatch = (drawnNumbers: number[], userScores: number[]): number => {
  return drawnNumbers.filter(n => userScores.includes(n)).length
}

// Calculate prize pools
export const calculatePools = (
  totalPool: number,
  rolledOverJackpot: number = 0
) => ({
  jackpot: (totalPool * 0.40) + rolledOverJackpot,
  second: totalPool * 0.35,
  third: totalPool * 0.25,
})

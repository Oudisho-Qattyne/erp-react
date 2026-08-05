let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", gain = 0.3) {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gainNode.gain.setValueAtTime(gain, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available
  }
}

export function playSendSound() {
  playTone(800, 0.08, "sine", 0.15)
}

export function playReceiveSound() {
  playTone(523, 0.12, "sine", 0.2)
  setTimeout(() => playTone(659, 0.15, "sine", 0.2), 120)
}

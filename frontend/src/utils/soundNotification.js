/**
 * Utility function to play a notification sound
 * Uses Web Audio API to generate a pleasant notification sound
 */
export const playNotificationSound = () => {
  console.log('Playing notification sound...')
  
  try {
    // Create or get audio context
    let audioContext = window.audioContext
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      window.audioContext = audioContext // Store for reuse
    }
    
    // Resume audio context if it's suspended (browsers require user interaction first)
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('Audio context resumed')
        playSound(audioContext)
      }).catch((error) => {
        console.warn('Could not resume audio context:', error)
        // Try fallback
        playFallbackSound()
      })
    } else {
      playSound(audioContext)
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error)
    playFallbackSound()
  }
}

function playSound(audioContext) {
  try {
    // Create oscillator for the sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Set sound properties - pleasant notification chime (louder and more noticeable)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // Start at 800 Hz
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1) // Rise to 1000 Hz
    
    // Set volume envelope (louder - increased from 0.3 to 0.5)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05) // Fade in
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.2) // Hold longer
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4) // Fade out
    
    // Play the sound (longer duration)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.4)
    
    console.log('Notification sound played successfully')
    
    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  } catch (error) {
    console.warn('Error playing sound:', error)
    playFallbackSound()
  }
}

function playFallbackSound() {
  try {
    // Create a simple beep using Audio constructor
    const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURAJR6Hh8sBwJgUwgM3y2oY5CBxruO3mnlEQDE+n4fC2YxwGOJLX8sx5LAUkd8fw3ZBACxRetOnrqFUUCkaf4PK+bCEGMYfR89OCMwYebsDv45lREAlHoeHywHAmBTCAzfLahjkIHGu47eaeURAMT6fh8LZjHAY4ktfy')
    beep.volume = 0.5 // Louder fallback
    beep.play().then(() => {
      console.log('Fallback sound played successfully')
    }).catch((error) => {
      console.warn('Fallback sound failed:', error)
    })
  } catch (fallbackError) {
    console.warn('Fallback sound also failed:', fallbackError)
  }
}

/**
 * Play a more prominent notification sound for important events
 */
export const playImportantNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Play two tones for more attention
    for (let i = 0; i < 2; i++) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(600 + i * 200, audioContext.currentTime + i * 0.2)
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.2)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + i * 0.2 + 0.05)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + i * 0.2 + 0.15)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + i * 0.2 + 0.3)
      
      oscillator.start(audioContext.currentTime + i * 0.2)
      oscillator.stop(audioContext.currentTime + i * 0.2 + 0.3)
    }
  } catch (error) {
    console.warn('Could not play important notification sound:', error)
    // Fallback to regular sound
    playNotificationSound()
  }
}


export interface ToneResult {
  // Primary emotion analysis
  emotion: string
  confidence: number
  explanation: string

  // Enhanced analysis
  tone?: string
  intention?: string
  secondaryEmotions?: Array<{
    emotion: string
    confidence: number
  }>

  // Feedback tracking
  feedbackId?: string
}

export interface FeedbackData {
  feedbackId: string
  isAccurate: boolean
  userMessage: string
  result: ToneResult
  userComments?: string
}

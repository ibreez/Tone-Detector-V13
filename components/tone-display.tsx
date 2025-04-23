"use client"

import type { ToneResult } from "@/app/types"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitFeedback } from "@/app/actions/detect-tone"

// Expanded emotion to emoji mapping based on Plutchik's wheel and GoEmotions
const emotionEmojis: Record<string, string> = {
  // Plutchik's primary emotions
  joy: "😊",
  trust: "🤝",
  fear: "😨",
  surprise: "😲",
  sadness: "😢",
  disgust: "🤢",
  anger: "😠",
  anticipation: "🤩",

  // Additional emotions from GoEmotions
  admiration: "🥰",
  amusement: "😄",
  annoyance: "😒",
  approval: "👍",
  caring: "🤗",
  confusion: "😕",
  curiosity: "🧐",
  desire: "😍",
  disappointment: "😞",
  disapproval: "👎",
  embarrassment: "😳",
  excitement: "🤩",
  gratitude: "🙏",
  grief: "💔",
  love: "❤️",
  nervousness: "😰",
  optimism: "🌈",
  pride: "🦚",
  realization: "💡",
  relief: "😌",
  remorse: "😔",

  // Basic emotions (for backward compatibility)
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  fearful: "😨",
  disgusted: "🤢",
  neutral: "😐",
  excited: "🤩",
  anxious: "😰",
  confused: "😕",
  amused: "😄",
  loving: "❤️",
  proud: "🥲",
  grateful: "🙏",
  hopeful: "🤞",
  insult: "🤬",
  joking: "😜",

  // Default emoji for any other emotions
  default: "🤔",
}

// Expanded emotion to color mapping
const emotionColors: Record<string, string> = {
  // Plutchik's primary emotions
  joy: "bg-yellow-500",
  trust: "bg-green-600",
  fear: "bg-purple-500",
  surprise: "bg-blue-400",
  sadness: "bg-blue-600",
  disgust: "bg-green-800",
  anger: "bg-red-600",
  anticipation: "bg-orange-500",

  // Additional emotions
  admiration: "bg-pink-400",
  amusement: "bg-yellow-400",
  annoyance: "bg-red-400",
  approval: "bg-green-500",
  caring: "bg-pink-300",
  confusion: "bg-purple-400",
  curiosity: "bg-blue-300",
  desire: "bg-red-300",
  disappointment: "bg-blue-500",
  disapproval: "bg-red-500",
  embarrassment: "bg-pink-500",
  excitement: "bg-pink-600",
  gratitude: "bg-green-400",
  grief: "bg-blue-700",
  love: "bg-pink-600",
  nervousness: "bg-purple-300",
  optimism: "bg-yellow-600",
  pride: "bg-indigo-500",
  realization: "bg-blue-500",
  relief: "bg-green-300",
  remorse: "bg-blue-400",

  // Basic emotions (for backward compatibility)
  happy: "bg-green-500",
  sad: "bg-blue-500",
  angry: "bg-red-500",
  surprised: "bg-purple-500",
  fearful: "bg-yellow-500",
  disgusted: "bg-emerald-500",
  neutral: "bg-gray-500",
  excited: "bg-pink-500",
  anxious: "bg-amber-500",
  confused: "bg-indigo-500",
  amused: "bg-cyan-500",
  loving: "bg-rose-500",
  proud: "bg-teal-500",
  grateful: "bg-lime-500",
  hopeful: "bg-sky-500",
  insult: "bg-orange-500",
  joking: "bg-violet-500",

  // Default color for any other emotions
  default: "bg-slate-500",
}

// Intention to icon mapping
const intentionIcons: Record<string, string> = {
  inform: "📝",
  persuade: "🎯",
  request: "🙏",
  complain: "😤",
  praise: "👏",
  question: "❓",
  suggest: "💡",
  warn: "⚠️",
  express: "💬",
  default: "💭",
}

interface ToneDisplayProps {
  result: ToneResult
  message: string
}

export default function ToneDisplay({ result, message }: ToneDisplayProps) {
  const [progressValue, setProgressValue] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  // Animate the progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressValue(result.confidence * 100)
    }, 100)

    return () => clearTimeout(timer)
  }, [result.confidence])

  const emoji = emotionEmojis[result.emotion.toLowerCase()] || emotionEmojis.default
  const colorClass = emotionColors[result.emotion.toLowerCase()] || emotionColors.default
  const intentionIcon = result.intention
    ? intentionIcons[result.intention.toLowerCase()] || intentionIcons.default
    : null

  const handleFeedback = async (isAccurate: boolean) => {
    if (!result.feedbackId) return

    setFeedbackLoading(true)

    try {
      await submitFeedback({
        feedbackId: result.feedbackId,
        isAccurate,
        userMessage: message,
        result,
      })

      setFeedbackSubmitted(true)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Primary Emotion */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Primary Emotion:</h3>
        <Badge className={`text-white ${colorClass}`}>
          {result.emotion} {emoji}
        </Badge>
      </div>

      {/* Confidence */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Confidence</span>
          <span>{Math.round(result.confidence * 100)}%</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Tone and Intention (if available) */}
      {(result.tone || result.intention) && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          {result.tone && (
            <div>
              <h4 className="text-sm font-medium mb-1">Tone:</h4>
              <Badge variant="outline" className="capitalize">
                {result.tone}
              </Badge>
            </div>
          )}

          {result.intention && (
            <div>
              <h4 className="text-sm font-medium mb-1">Intention:</h4>
              <Badge variant="outline" className="capitalize">
                {intentionIcon} {result.intention}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Secondary Emotions (if available) */}
      {result.secondaryEmotions && result.secondaryEmotions.length > 0 && (
        <div className="pt-2">
          <h4 className="text-sm font-medium mb-1">Secondary Emotions:</h4>
          <div className="flex flex-wrap gap-2">
            {result.secondaryEmotions.map((secondaryEmotion, index) => {
              const secondaryEmoji = emotionEmojis[secondaryEmotion.emotion.toLowerCase()] || emotionEmojis.default
              const secondaryColorClass = emotionColors[secondaryEmotion.emotion.toLowerCase()] || emotionColors.default

              return (
                <Badge key={index} className={`text-white ${secondaryColorClass}`}>
                  {secondaryEmotion.emotion} {secondaryEmoji} {Math.round(secondaryEmotion.confidence * 100)}%
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="pt-2">
        <h4 className="text-sm font-medium mb-1">Explanation:</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{result.explanation}</p>
      </div>

      {/* Feedback Mechanism */}
      {result.feedbackId && (
        <div className="pt-4 border-t mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Was this analysis accurate?</span>

            {feedbackSubmitted ? (
              <span className="text-sm text-green-600">Thank you for your feedback!</span>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleFeedback(true)} disabled={feedbackLoading}>
                  <ThumbsUp className="h-4 w-4 mr-1" /> Yes
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleFeedback(false)} disabled={feedbackLoading}>
                  <ThumbsDown className="h-4 w-4 mr-1" /> No
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

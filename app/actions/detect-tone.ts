"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import type { ToneResult } from "@/app/types"
import { v4 as uuidv4 } from "uuid"

export async function detectTone(message: string): Promise<ToneResult> {
  try {
    // Create a unique ID for feedback tracking
    const feedbackId = uuidv4()

    // Use Chain of Thought (CoT) prompting with Plutchik's wheel of emotions
    const prompt = `
You are an expert in emotional analysis and linguistic psychology. Analyze the following message to determine its emotional tone, intention, and underlying emotions.

Message: "${message}"

Step 1: Is the message literal or does it contain non-literal elements (sarcasm, irony, hyperbole, etc.)?
Step 2: What primary emotion is being expressed? Use Plutchik's wheel of emotions (joy, trust, fear, surprise, sadness, disgust, anger, anticipation) or the GoEmotions taxonomy if more appropriate.
Step 3: Are there any secondary emotions present?
Step 4: What is the overall tone of the message (formal, casual, urgent, playful, serious, etc.)?
Step 5: What seems to be the intention behind the message (inform, persuade, request, complain, praise, etc.)?
Step 6: What specific words, phrases, or linguistic patterns support your analysis?

Based on the above analysis, provide a structured response in the following JSON format:
{
  "emotion": "primary emotion",
  "confidence": 0.0 to 1.0,
  "explanation": "detailed explanation referencing specific elements of the text",
  "tone": "overall tone",
  "intention": "likely intention",
  "secondaryEmotions": [
    {"emotion": "secondary emotion 1", "confidence": 0.0 to 1.0},
    {"emotion": "secondary emotion 2", "confidence": 0.0 to 1.0}
  ]
}
`

    // Generate the analysis using Groq
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.2, // Lower temperature for more consistent results
      maxTokens: 1024,
    })

    // Parse the JSON response
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response")
      }

      const jsonResponse = JSON.parse(jsonMatch[0])

      // Validate and ensure all required fields are present
      const result: ToneResult = {
        emotion: jsonResponse.emotion || "neutral",
        confidence: typeof jsonResponse.confidence === "number" ? jsonResponse.confidence : 0.7,
        explanation: jsonResponse.explanation || "Unable to provide a detailed explanation.",
        tone: jsonResponse.tone,
        intention: jsonResponse.intention,
        secondaryEmotions: jsonResponse.secondaryEmotions,
        feedbackId,
      }

      return result
    } catch (parseError) {
      console.error("Error parsing model response:", parseError)

      // Fallback to a simpler analysis if JSON parsing fails
      return {
        emotion: "neutral",
        confidence: 0.5,
        explanation:
          "The system encountered an issue while analyzing the emotional content. The message appears to be neutral in tone.",
        feedbackId,
      }
    }
  } catch (error) {
    console.error("Error in detectTone:", error)
    throw new Error("Failed to analyze tone. Please try again.")
  }
}

// Define the FeedbackData type
interface FeedbackData {
  feedbackId: string
  emotion: string
  confidence: number
  explanation: string
  tone: string
  intention: string
  secondaryEmotions: { emotion: string; confidence: number }[]
  helpful: boolean
  comments?: string
}

export async function submitFeedback(feedback: FeedbackData): Promise<{ success: boolean }> {
  try {
    // In a real application, you would store this feedback in a database
    // For now, we'll just log it to the console
    console.log("Feedback received:", feedback)

    // You could also use this feedback to improve the model over time

    return { success: true }
  } catch (error) {
    console.error("Error submitting feedback:", error)
    return { success: false }
  }
}

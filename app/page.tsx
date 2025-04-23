"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { detectTone } from "@/app/actions/detect-tone"
import type { ToneResult } from "@/app/types"
import ToneDisplay from "@/components/tone-display"
import { Loader2 } from "lucide-react"
import { PWARegister } from "@/components/pwa-register"

export default function ToneDetector() {
  const [message, setMessage] = useState("")
  const [result, setResult] = useState<ToneResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const toneResult = await detectTone(message)
      setResult(toneResult)
    } catch (err) {
      setError("Failed to analyze tone. Please try again.")
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <PWARegister />
      <h1 className="text-3xl font-bold text-center mb-8">Tone Detector</h1>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Message Tone Analyzer</CardTitle>
          <CardDescription>Enter a message to analyze its emotional tone</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              className="min-h-[120px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isAnalyzing}
            />

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" className="w-full" disabled={isAnalyzing || !message.trim()}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Tone"
              )}
            </Button>
          </form>
        </CardContent>

        {result && (
          <CardFooter className="flex flex-col items-center">
            <div className="w-full pt-4 border-t">
              <ToneDisplay result={result} message={message} />
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from "react"

import { pipeline } from "@huggingface/transformers"

export type UseSpeechToTextReturn = {
  isRecording: boolean
  isTranscribing: boolean
  isSupported: boolean
  error: string | null
  result: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearResult: () => void
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const transcriberRef = useRef<unknown>(null)

  useEffect(() => {
    const hasMediaRecorder = typeof MediaRecorder !== "undefined"
    const hasGetUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    setIsSupported(hasMediaRecorder && !!hasGetUserMedia)
  }, [])

  useEffect(() => {
    const initTranscriber = async () => {
      try {
        if (!transcriberRef.current) {
          transcriberRef.current = await pipeline(
            "automatic-speech-recognition",
            "Xenova/whisper-tiny.en"
          )
        }
      } catch (err) {
        setError("Failed to initialize speech recognition model")
        console.error("Transcriber initialization error:", err)
      }
    }

    initTranscriber()
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser")
      return
    }

    if (isRecording) return

    try {
      setError(null)
      setResult(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/wav")
        ? "audio/wav"
        : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm"

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })

      mediaRecorderRef.current = mediaRecorder

      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          setIsTranscribing(true)

          const audioBlob = new Blob(audioChunks, { type: mimeType })

          if (audioBlob.size < 1000) {
            setError("No audio detected. Please try again.")
            return
          }

          const audioUrl = URL.createObjectURL(audioBlob)

          if (!transcriberRef.current) {
            setError("Speech recognition model not ready. Please try again.")
            return
          }

          const output = await (
            transcriberRef.current as (
              audioUrl: string
            ) => Promise<{ text: string } | { text: string }[]>
          )(audioUrl)

          URL.revokeObjectURL(audioUrl)

          if (output) {
            const text = Array.isArray(output) ? output[0]?.text : output.text
            if (text) {
              const cleanedText = text
                .replace(/\[.*?\]/g, "")
                .trim()
                .replace(/\s+/g, " ")

              if (cleanedText.length > 0) {
                setResult(cleanedText)
              } else {
                setError("No clear speech detected. Please try speaking closer to the microphone.")
                setResult(null)
              }
            } else {
              setError("No speech detected in the audio.")
            }
          }
        } catch (err) {
          setError("Failed to transcribe audio. Please try again.")
          console.error("Transcription error:", err)
        } finally {
          setIsTranscribing(false)
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
          }
        }
      }

      mediaRecorder.onerror = (event) => {
        setError("Recording error occurred")
        console.error("MediaRecorder error:", event)
        setIsRecording(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      setError("Failed to start recording. Please check microphone permissions.")
      console.error("Recording start error:", err)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [isSupported, isRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return {
    isRecording,
    isTranscribing,
    isSupported,
    error,
    result,
    startRecording,
    stopRecording,
    clearResult
  }
}

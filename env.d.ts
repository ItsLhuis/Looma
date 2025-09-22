declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "test" | "production"
      NEXT_PUBLIC_APP_URL: string
      DATABASE_URL: string
      AUTH_SECRET: string
      AI_PROVIDER: "ollama" | "openrouter"
      OLLAMA_CHAT_MODEL: string
      OLLAMA_IMAGE_MODEL: string
      OPENROUTER_API_KEY: string
      OPENROUTER_CHAT_MODEL: string
      OPENROUTER_IMAGE_MODEL: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      GOOGLE_REDIRECT_URI: string
    }
  }
}

export {}

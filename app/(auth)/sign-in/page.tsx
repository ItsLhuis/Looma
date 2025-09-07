"use client"

import Image from "next/image"
import Link from "next/link"

import {
  AuroraText,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Fade,
  GoogleSignInButton,
  Typography
} from "@/components/ui"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      <Fade className="bg-background flex flex-[2] items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <Card className="bg-background border-none">
            <CardHeader className="pb-3 text-left">
              <Button asChild variant="link" className="mb-6 p-0">
                <Link href="/" className="flex w-fit items-center justify-start gap-3 font-bold">
                  <Image src="/icon.png" alt="Looma" width={48} height={48} />
                  <Typography variant="h1">
                    <AuroraText>Looma</AuroraText>
                  </Typography>
                </Link>
              </Button>
              <CardTitle>
                <Typography variant="h1">Welcome Back</Typography>
              </CardTitle>
              <CardDescription>
                <Typography variant="p">
                  Access your account and continue your journey with us
                </Typography>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <GoogleSignInButton />
            </CardContent>
          </Card>
        </div>
      </Fade>
      <Fade
        direction="left"
        className="relative m-3 mb-0 hidden flex-[1] overflow-hidden rounded-t-4xl lg:block"
      >
        <Image
          fill
          src="/abstract-waves.jpg"
          alt="Abstract flowing waves"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-8">
          <div className="space-y-3">
            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl">
                <Image src="/icon.png" alt="Brain AI" width={48} height={48} />
              </div>
              <div>
                <Typography variant="h3" className="leading-tight font-light tracking-wide">
                  <AuroraText className="font-bold">Intelligence</AuroraText>
                  <span className="ml-2 font-extralight text-gray-400">meets</span>
                  <AuroraText className="ml-2 font-bold">simplicity</AuroraText>
                </Typography>
              </div>
              <Typography variant="h1" className="text-white">
                Your world, organized by AI
              </Typography>
            </div>
          </div>
        </div>
      </Fade>
    </div>
  )
}

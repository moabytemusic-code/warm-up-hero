import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
            <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
                    </div>
                    <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Authentication Error</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        We couldn't sign you in. This usually happens if the login link has expired or has already been used.
                    </p>
                    <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-3 text-sm text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                        Tip: Try requesting a new magic link and click it immediately.
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center pt-2">
                    <Link href="/login">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

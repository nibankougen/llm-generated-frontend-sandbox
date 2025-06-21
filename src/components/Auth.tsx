import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { auth } from "../firebase"
import { Button } from "@/components/ui/button"
import type { User } from "firebase/auth"

export default function Auth({
    user,
    userName,
}: {
    user: User | null
    userName: string
}) {
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
    }

    const handleLogout = async () => {
        await signOut(auth)
    }

    return (
        <div className="text-center my-4">
            {user ? (
                <>
                    <p className="mb-2">
                        こんにちは、{userName || "ユーザー"} さん
                    </p>
                    <Button onClick={handleLogout}>ログアウト</Button>
                </>
            ) : (
                <Button onClick={handleLogin}>Googleでログイン</Button>
            )}
        </div>
    )
}

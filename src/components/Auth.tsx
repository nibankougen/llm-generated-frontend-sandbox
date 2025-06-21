// src/components/Auth.tsx
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { auth } from "../firebase"
import { Button } from "@/components/ui/button"

export default function Auth({ user }: { user: any }) {
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
                    <p className="mb-2">こんにちは、{user.displayName} さん</p>
                    <Button onClick={handleLogout}>ログアウト</Button>
                </>
            ) : (
                <Button onClick={handleLogin}>Googleでログイン</Button>
            )}
        </div>
    )
}

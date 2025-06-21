import { useEffect, useState } from "react"
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
} from "firebase/firestore"
import app from "../firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { User } from "firebase/auth"

const db = getFirestore(app)

export default function UserSettings({ user }: { user: User }) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(true)

    // 初回読み込みで Firestore からユーザー名を取得
    useEffect(() => {
        const fetchName = async () => {
            const docRef = doc(db, "users", user.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setName(docSnap.data().name || "")
            }
            setLoading(false)
        }
        fetchName()
    }, [user.uid])

    const handleSave = async () => {
        await setDoc(doc(db, "users", user.uid), {
            name,
        })
        alert("保存しました")
    }

    if (loading) return <p>読み込み中...</p>

    return (
        <div className="max-w-md mx-auto mt-6 space-y-2">
            <h2 className="font-bold text-lg">表示名の設定</h2>
            <Input
                placeholder="あなたの名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleSave}>保存</Button>
        </div>
    )
}

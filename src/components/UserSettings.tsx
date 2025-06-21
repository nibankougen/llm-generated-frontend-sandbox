// src/components/UserSettings.tsx
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
import { useNavigate } from "react-router-dom"

const db = getFirestore(app)

export default function UserSettings({ user }: { user: User }) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        const fetchName = async () => {
            try {
                const docRef = doc(db, "users", user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setName(docSnap.data().name || "")
                }
            } catch (error) {
                console.error("ユーザー情報の取得に失敗しました:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchName()
    }, [user.uid])

    const handleSave = async () => {
        if (name.trim() === "") {
            setError("名前を入力してください")
            return
        }

        try {
            await setDoc(doc(db, "users", user.uid), {
                name: name.trim(),
            })
            setError("")
            navigate("/")
        } catch (err) {
            console.error("保存に失敗:", err)
            setError("保存に失敗しました")
        }
    }

    if (loading) return <p>読み込み中...</p>

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-800">表示名の設定</h2>
            <Input
                className="border-blue-400 focus:ring-blue-500"
                placeholder="あなたの名前"
                value={name}
                onChange={(e) => {
                    setName(e.target.value)
                    setError("")
                }}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={name.trim() === ""}>
                保存
            </Button>
        </div>
    )
}

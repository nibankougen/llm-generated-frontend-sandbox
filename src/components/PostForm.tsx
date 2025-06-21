import { useEffect, useState } from "react"
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
} from "firebase/firestore"
import app from "../firebase"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { User } from "firebase/auth"

const db = getFirestore(app)

export default function PostForm({
    user,
    onPostCreated,
}: {
    user: User
    onPostCreated: () => void
}) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [userName, setUserName] = useState("")

    // ユーザー名の取得
    useEffect(() => {
        const fetchName = async () => {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            setUserName(userDoc.exists() ? userDoc.data().name : "")
        }
        fetchName()
    }, [user.uid])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await addDoc(collection(db, "posts"), {
            title,
            content,
            createdAt: new Date(),
            userId: user.uid,
            userName: userName || "匿名",
        })
        setTitle("")
        setContent("")
        onPostCreated()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-6">
            <Input
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <Textarea
                placeholder="内容"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
            />
            <Button type="submit">投稿</Button>
        </form>
    )
}

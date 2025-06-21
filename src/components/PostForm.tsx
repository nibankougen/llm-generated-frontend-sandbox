// src/components/PostForm.tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import app from "../firebase"
import type { User } from "firebase/auth"

const db = getFirestore(app)

export default function PostForm({ user }: { user: User }) {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await addDoc(collection(db, "posts"), {
            title,
            content,
            createdAt: new Date(),
            userId: user.uid,
            userName: user.displayName,
        })
        setTitle("")
        setContent("")
        alert("投稿しました")
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

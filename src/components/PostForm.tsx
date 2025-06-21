import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import app from "../firebase"

const db = getFirestore(app)

export default function PostForm() {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await addDoc(collection(db, "posts"), {
                title,
                content,
                createdAt: new Date(),
            })

            alert("投稿しました！")
            setTitle("")
            setContent("")
        } catch (error) {
            console.error("投稿エラー", error)
            alert("投稿に失敗しました")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10">
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

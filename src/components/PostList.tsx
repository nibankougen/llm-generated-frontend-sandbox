import { useEffect, useState } from "react"
import { getFirestore, collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore"
import app from "../firebase"
import type { User } from "firebase/auth"
import { Button } from "@/components/ui/button"

type Post = {
    id: string
    title: string
    content: string
    userName: string
    userId: string
    createdAt: Date
}

const db = getFirestore(app)

export default function PostList({ user }: { user: User | null }) {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
        const snapshot = await getDocs(q)
        const fetchedPosts = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
                id: doc.id,
                title: data.title,
                content: data.content,
                userName: data.userName ?? "匿名",
                userId: data.userId ?? "",
                createdAt: data.createdAt?.toDate?.() ?? new Date(),
            } as Post
        })
        setPosts(fetchedPosts)
        setLoading(false)
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("本当に削除しますか？")) return
        await deleteDoc(doc(db, "posts", id))
        fetchPosts() // 更新
    }

    if (loading) return <p className="text-center mt-4">読み込み中...</p>

    return (
        <div className="max-w-2xl mx-auto mt-10 space-y-4">
            {posts.map((post) => (
                <div key={post.id} className="border rounded-xl p-4 bg-white shadow-sm relative">
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p className="text-sm text-gray-500 mb-2">by {post.userName}</p>
                    <p>{post.content}</p>
                    {user?.uid === post.userId && (
                        <Button
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => handleDelete(post.id)}
                        >
                            削除
                        </Button>
                    )}
                </div>
            ))}
        </div>
    )
}

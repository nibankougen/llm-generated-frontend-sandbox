import { useEffect, useState } from "react"
import {
    getFirestore,
    collection,
    getDocs,
    orderBy,
    query,
    deleteDoc,
    doc,
    addDoc,
    where,
    serverTimestamp,
} from "firebase/firestore"
import app from "../firebase"
import { type User } from "firebase/auth"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"

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
    const [targetId, setTargetId] = useState<string | null>(null)
    const [likes, setLikes] = useState<{ [postId: string]: string[] }>({})
    const [likeLoading, setLikeLoading] = useState<string | null>(null)

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

    // いいね情報を取得
    const fetchLikes = async () => {
        const likesSnapshot = await getDocs(collection(db, "likes"))
        const likeMap: { [postId: string]: string[] } = {}
        likesSnapshot.forEach((doc) => {
            const data = doc.data()
            if (!likeMap[data.postId]) likeMap[data.postId] = []
            likeMap[data.postId].push(data.userId)
        })
        setLikes(likeMap)
    }

    useEffect(() => {
        fetchPosts()
        fetchLikes()
    }, [])

    const handleDelete = async () => {
        if (!targetId) return
        await deleteDoc(doc(db, "posts", targetId))
        setTargetId(null)
        fetchPosts()
    }

    // いいねする
    const handleLike = async (postId: string) => {
        if (!user) return
        setLikeLoading(postId)
        // 既にいいねしていないか確認
        const q = query(
            collection(db, "likes"),
            where("postId", "==", postId),
            where("userId", "==", user.uid)
        )
        const snap = await getDocs(q)
        if (snap.empty) {
            await addDoc(collection(db, "likes"), {
                postId,
                userId: user.uid,
                createdAt: serverTimestamp(),
            })
            // いいねユーザーステータスも重複がなければ保存
            const post = posts.find((p) => p.id === postId)
            if (post) {
                const statusQ = query(
                    collection(db, "likeUserStatus"),
                    where("fromUserId", "==", user.uid),
                    where("toUserId", "==", post.userId)
                )
                const statusSnap = await getDocs(statusQ)
                if (statusSnap.empty) {
                    await addDoc(collection(db, "likeUserStatus"), {
                        fromUserId: user.uid,
                        toUserId: post.userId,
                        createdAt: serverTimestamp(),
                    })
                }
            }
        }
        await fetchLikes()
        setLikeLoading(null)
    }

    // いいね解除
    const handleUnlike = async (postId: string) => {
        if (!user) return
        setLikeLoading(postId)
        const q = query(
            collection(db, "likes"),
            where("postId", "==", postId),
            where("userId", "==", user.uid)
        )
        const snap = await getDocs(q)
        snap.forEach(async (docu) => {
            await deleteDoc(doc(db, "likes", docu.id))
        })
        await fetchLikes()
        setLikeLoading(null)
    }

    if (loading) return <p className="text-center mt-4">読み込み中...</p>

    return (
        <div className="max-w-2xl mx-auto mt-10 space-y-4">
            {posts.map((post) => {
                const isMine = user?.uid === post.userId
                const likeUsers = likes[post.id] || []
                const liked = !!user && likeUsers.includes(user.uid)
                return (
                    <div
                        key={post.id}
                        className="border rounded-xl p-4 bg-white shadow-sm relative"
                    >
                        <h2 className="text-lg font-semibold">{post.title}</h2>
                        <p className="text-sm text-gray-500 mb-2">by {post.userName}</p>
                        <p>{post.content}</p>
                        {/* いいねボタン */}
                        {!isMine && user && (
                            <Button
                                variant={liked ? "secondary" : "outline"}
                                className="mt-2 mr-2"
                                onClick={() => (liked ? handleUnlike(post.id) : handleLike(post.id))}
                                disabled={likeLoading === post.id}
                            >
                                {liked ? "いいね解除" : "いいね"}（{likeUsers.length}）
                            </Button>
                        )}
                        {/* 削除ボタンとDialog */}
                        {isMine && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="absolute top-2 right-2"
                                        onClick={() => setTargetId(post.id)}
                                    >
                                        削除
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>本当に削除しますか？</DialogTitle>
                                    </DialogHeader>
                                    <p className="text-sm text-gray-500">
                                        この操作は取り消せません。
                                    </p>
                                    <DialogFooter>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setTargetId(null)}
                                        >
                                            キャンセル
                                        </Button>
                                        <Button variant="destructive" onClick={handleDelete}>
                                            削除する
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

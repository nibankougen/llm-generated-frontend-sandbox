// App.tsx
import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "./firebase"
import Auth from "./components/Auth"
import PostForm from "./components/PostForm"

function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">認証付き投稿アプリ</h1>
      <Auth user={user} />
      {user && <PostForm user={user} />}
    </div>
  )
}

export default App

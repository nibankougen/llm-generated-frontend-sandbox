import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { auth } from "./firebase"
import Auth from "./components/Auth"
import UserSettings from "./components/UserSettings"
import PostForm from "./components/PostForm"
import PostList from "./components/PostList"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [userDocReady, setUserDocReady] = useState(false)
  const [userName, setUserName] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const db = getFirestore()
        const userRef = doc(db, "users", user.uid)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          await setDoc(userRef, { name: "" })
          setUserName("")
        } else {
          setUserName(snap.data().name || "")
        }
        setUserDocReady(true)
      } else {
        setUserDocReady(false)
        setUserName("")
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">認証付き投稿アプリ</h1>
      <Auth user={user} userName={userName} />
      {user && userDocReady && (
        <>
          <UserSettings user={user} />
          <PostForm user={user} onPostCreated={() => setRefreshKey((prev) => prev + 1)} />
        </>
      )}
      <PostList user={user} key={refreshKey} />
    </div>
  )
}

export default App

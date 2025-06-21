import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom"

import { useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { auth } from "./firebase"

import Auth from "./components/Auth"
import PostForm from "./components/PostForm"
import PostList from "./components/PostList"
import UserSettingsPage from "./pages/UserSettingsPage"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [userDocReady, setUserDocReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const db = getFirestore()
        const userRef = doc(db, "users", user.uid)
        const snap = await getDoc(userRef)
        if (snap.exists()) {
          setUserName(snap.data().name || "")
          setUserDocReady(true)
        } else {
          setUserDocReady(false)
        }
      } else {
        setUserName("")
        setUserDocReady(false)
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">
            認証付き投稿アプリ
          </h1>
          <Auth user={user} userName={userName} />
          <nav className="flex justify-center mb-4 gap-4 text-blue-700">
            <Link to="/" className="hover:underline">投稿一覧</Link>
            {user && <Link to="/settings" className="hover:underline">ユーザー設定</Link>}
          </nav>
          <div className="bg-white shadow-md rounded-xl p-6">

            <Routes>
              <Route
                path="/"
                element={
                  user && userDocReady ? (
                    userName === "" ? (
                      <Navigate to="/settings" replace />
                    ) : (
                      <>
                        <PostForm user={user} onPostCreated={() => setRefreshKey((k) => k + 1)} />
                        <PostList user={user} key={refreshKey} />
                      </>
                    )
                  ) : (
                    <PostList user={user} key={refreshKey} />
                  )
                }
              />
              <Route
                path="/settings"
                element={
                  user && userDocReady ? (
                    <UserSettingsPage user={user} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App

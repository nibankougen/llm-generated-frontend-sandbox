import UserSettings from "../components/UserSettings"
import type { User } from "firebase/auth"

export default function UserSettingsPage({ user }: { user: User }) {
    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">ユーザー設定</h2>
            <UserSettings user={user} />
        </div>
    )
}

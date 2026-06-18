// src/components/users/UserList.jsx
import { getPlanLimits } from "../../utils/planLimits";
import { UpgradeBanner, FeatureLock } from "../plan/PlanGate";

export default function UserList() {
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const limits    = getPlanLimits(user?.plan);
  const userCount = users.length;
  const atLimit   = limits.maxUsers !== Infinity && userCount >= limits.maxUsers;

  return (
    <div style={{ padding: "36px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Team members</h1>
          <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>
            {userCount}{limits.maxUsers !== Infinity ? `/${limits.maxUsers}` : ""} members
          </p>
        </div>

        {isAdmin && (
          atLimit ? (
            <button onClick={() => navigate("/pricing")}
              style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600 }}>
              Upgrade to add more →
            </button>
          ) : (
            <button onClick={() => setShowInviteModal(true)} ...>
              + Invite member
            </button>
          )
        )}
      </div>

      {/* Near-limit nudge */}
      <UpgradeBanner type="users" count={userCount} max={limits.maxUsers} isDark={isDark} />

      {/* Users table … */}
    </div>
  );
}
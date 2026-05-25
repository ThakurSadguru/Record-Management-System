import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? "bg-green-50 text-green-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      <span>{icon}</span>
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { modules, loadModules } = useData();

  // Load modules from backend when sidebar mounts
  useEffect(() => {
    loadModules();
  }, [loadModules]);

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
          R
        </div>
        <div>
          <div className="text-sm font-semibold">RMS</div>
          <div className="text-xs text-gray-400">Record Management</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <NavItem to="/dashboard" icon="⊞" label="Dashboard" />

        <div className="pt-4 pb-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Modules
            </span>
            {isAdmin && (
              <NavLink
                to="/modules/new"
                className="text-gray-400 hover:text-green-600 text-xl leading-none"
                title="New Module"
              >
                +
              </NavLink>
            )}
          </div>
          {modules.length === 0 ? (
            <p className="px-3 text-xs text-gray-400 py-2">No modules yet</p>
          ) : (
            modules.map((m) => (
              <NavLink
                key={m.id}
                to={`/modules/${m.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all truncate ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
                <span className="truncate">{m.name}</span>
              </NavLink>
            ))
          )}
        </div>

        <div className="pt-3 space-y-1">
          <NavItem to="/modules" icon="☰" label="All Modules" />
          {isAdmin && <NavItem to="/users" icon="👥" label="Users" />}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 capitalize">
              {user?.role?.toLowerCase()}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-gray-300 hover:text-red-500 transition-colors"
            title="Logout"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}

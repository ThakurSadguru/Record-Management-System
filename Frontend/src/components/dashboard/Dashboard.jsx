import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

function StatCard({ label, value, color = "green" }) {
  const colors = {
    green: "bg-green-50  text-green-700  border-green-100",
    blue: "bg-blue-50   text-blue-700   border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    amber: "bg-amber-50  text-amber-700  border-amber-100",
  };
  return (
    <div className={`card p-5 border ${colors[color]}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-0.5 opacity-80">{label}</div>
    </div>
  );
}

function ModuleCard({ module }) {
  return (
    <Link
      to={`/modules/${module.id}`}
      className="card p-5 hover:shadow-md transition-shadow block group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
          {module.name[0].toUpperCase()}
        </div>
        <span className="text-xs text-gray-400 group-hover:text-green-600 transition-colors">
          View →
        </span>
      </div>
      <div className="font-semibold text-gray-900">{module.name}</div>
      <div className="text-xs text-gray-500 mt-1">
        {module.fields?.length ?? 0} fields
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { modules, loadModules } = useData();

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const totalFields = modules.reduce((s, m) => s + (m.fields?.length ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your RMS overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Modules" value={modules.length} color="green" />
        <StatCard label="Total Fields" value={totalFields} color="blue" />
        <StatCard label="Your Role" value={user?.role} color="purple" />
        <StatCard label="Status" value="Live" color="amber" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Modules</h2>
          <div className="flex gap-2">
            <Link to="/modules" className="btn-secondary text-xs py-1.5 px-3">
              View all
            </Link>
            {isAdmin && (
              <Link
                to="/modules/new"
                className="btn-primary text-xs py-1.5 px-3"
              >
                + New
              </Link>
            )}
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">📂</div>
            <div className="text-gray-600 font-medium">No modules yet</div>
            {isAdmin && (
              <Link to="/modules/new" className="btn-primary mt-4 inline-flex">
                Create your first module
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {modules.map((m) => (
              <ModuleCard key={m.id} module={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

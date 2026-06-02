import { createContext, useContext, useState, useCallback } from "react";
import { moduleApi } from "../api/moduleApi";
import { recordApi } from "../api/recordApi";
import { userApi } from "../api/userApi";
import toast from "react-hot-toast";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // ── Modules ──────────────────────────────────────────────────────────────
  const [modules, setModules] = useState([]);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  const loadModules = useCallback(async () => {
    try {
      const data = await moduleApi.getAll();
      setModules(data);
      setModulesLoaded(true);
    } catch {
      toast.error("Failed to load modules");
    }
  }, []);

  const createModule = useCallback(async (payload) => {
    const created = await moduleApi.create(payload);
    setModules((prev) => [...prev, created]);
    toast.success("Module created!");
    return created;
  }, []);

  const updateModule = useCallback(async (id, payload) => {
    const updated = await moduleApi.update(id, payload);
    setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));
    toast.success("Module updated!");
    return updated;
  }, []);

  const deleteModule = useCallback(async (id) => {
    await moduleApi.delete(id);
    setModules((prev) => prev.filter((m) => m.id !== id));
    setRecordsMap((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    toast.success("Module deleted");
  }, []);

  // ── Records ───────────────────────────────────────────────────────────────
  const [recordsMap, setRecordsMap] = useState({});

  /**
   * loadRecords(moduleId)               → loads main module records
   * loadRecords(subModuleId, parentId)  → loads submodule records
   *   key in recordsMap is always the first arg (moduleId or subModuleId)
   */
  const loadRecords = useCallback(async (moduleId, parentModuleId = null) => {
    try {
      const data = parentModuleId
        ? await recordApi.getByModule(parentModuleId, moduleId) // submodule
        : await recordApi.getByModule(moduleId); // main module
      setRecordsMap((prev) => ({ ...prev, [moduleId]: data }));
    } catch {
      toast.error("Failed to load records");
    }
  }, []);

  const searchRecords = useCallback(async (moduleId, q) => {
    try {
      return await recordApi.search(moduleId, q);
    } catch {
      return [];
    }
  }, []);

  /**
   * createRecord(moduleId, values)                      → main module record
   * createRecord(moduleId, values, subModuleId)         → submodule record
   *   recordsMap key = subModuleId when subModuleId provided, else moduleId
   */
  const createRecord = useCallback(
    async (moduleId, values, subModuleId = null) => {
      const created = subModuleId
        ? await recordApi.createSubModule(moduleId, subModuleId, values)
        : await recordApi.create(moduleId, values);

      const key = subModuleId ?? moduleId;
      setRecordsMap((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), created],
      }));
      toast.success("Record saved!");
      return created;
    },
    [],
  );

  const updateRecord = useCallback(async (id, moduleId, values) => {
    const updated = await recordApi.update(id, values);
    setRecordsMap((prev) => ({
      ...prev,
      [moduleId]: (prev[moduleId] ?? []).map((r) =>
        r.id === id ? updated : r,
      ),
    }));
    toast.success("Record updated!");
    return updated;
  }, []);

  const deleteRecord = useCallback(async (id, moduleId) => {
    await recordApi.delete(id);
    setRecordsMap((prev) => ({
      ...prev,
      [moduleId]: (prev[moduleId] ?? []).filter((r) => r.id !== id),
    }));
    toast.success("Record deleted");
  }, []);

  // ── Users ─────────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    }
  }, []);

  const updateUser = useCallback(async (id, data) => {
    const updated = await userApi.update(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    toast.success("User updated!");
  }, []);

  const deleteUser = useCallback(async (id) => {
    await userApi.delete(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("User removed");
  }, []);

  const sendInvite = useCallback(async (data) => {
    await userApi.sendInvite(data);
    toast.success(`Invite sent to ${data.email}!`);
  }, []);

  return (
    <DataContext.Provider
      value={{
        // modules
        modules,
        modulesLoaded,
        loadModules,
        createModule,
        updateModule,
        deleteModule,
        // records
        recordsMap,
        loadRecords,
        searchRecords,
        createRecord,
        updateRecord,
        deleteRecord,
        // users
        users,
        loadUsers,
        updateUser,
        deleteUser,
        sendInvite,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}

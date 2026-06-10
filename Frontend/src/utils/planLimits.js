// src/utils/planLimits.js
export const PLAN_LIMITS = {
  STARTER: {
    maxRecords:      500,
    maxModules:      5,
    maxUsers:        3,
    subModules:      false,
    fileUpload:      false,
    recycleBin:      false,
    export:          false,
    activityLog:     false,   // ← NEW
    dashboardCharts: false,   // ← NEW
    dashboardExport: false,   // ← NEW
  },
  PROFESSIONAL: {
    maxRecords:      100_000,
    maxModules:      Infinity,
    maxUsers:        25,
    subModules:      true,
    fileUpload:      true,
    recycleBin:      true,
    export:          true,
    activityLog:     true,
    dashboardCharts: true,
    dashboardExport: true,
  },
  ENTERPRISE: {
    maxRecords:      Infinity,
    maxModules:      Infinity,
    maxUsers:        Infinity,
    subModules:      true,
    fileUpload:      true,
    recycleBin:      true,
    export:          true,
    activityLog:     true,
    dashboardCharts: true,
    dashboardExport: true,
  },
};

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan?.toUpperCase()] ?? PLAN_LIMITS.STARTER;
}
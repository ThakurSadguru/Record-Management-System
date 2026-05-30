import { Outlet } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import Sidebar from "./Sidebar";

// Theme context — accessible anywhere in the app
export const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
});
export function useTheme() {
  return useContext(ThemeContext);
}

export default function AppLayout() {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark((p) => !p);

  const dark = {
    pageBg: "linear-gradient(135deg, #050d1f 0%, #0a1628 40%, #0d1f3c 100%)",
    gridColor: "rgba(74,159,255,0.03)",
    glowColor: "rgba(30,80,200,0.1)",
  };
  const light = {
    pageBg: "linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 50%, #f5f8ff 100%)",
    gridColor: "rgba(37,99,235,0.04)",
    glowColor: "rgba(37,99,235,0.06)",
  };
  const theme = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: theme.pageBg,
          position: "relative",
          transition: "background 0.3s",
        }}
      >
        {/* BG grid */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage:
              `linear-gradient(${theme.gridColor} 1px, transparent 1px),` +
              `linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            transition: "background-image 0.3s",
          }}
        />
        {/* Glow */}
        <div
          style={{
            position: "fixed",
            top: "-10%",
            right: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Sidebar */}
        <div style={{ position: "relative", zIndex: 10, flexShrink: 0 }}>
          <Sidebar />
        </div>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            position: "relative",
            zIndex: 10,
          }}
        >
          <Outlet />
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

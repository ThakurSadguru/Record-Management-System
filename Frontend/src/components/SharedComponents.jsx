import logoSrc from "../assets/logo.png";

export function Navbar({ navigate, active }) {
  const links = [
    { key: "features", label: "Features", path: "/features" },
    { key: "solutions", label: "Solutions", path: "/solutions" },
    { key: "pricing", label: "Pricing", path: "/pricing" },
    { key: "about", label: "About Us", path: "/about" },
  ];
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 52px",
        height: 70,
        background: "rgba(5,13,31,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(74,159,255,0.12)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
      >
        <img
          src={logoSrc}
          alt="RMS"
          style={{
            width: 40,
            height: 40,
            objectFit: "contain",
            filter: "drop-shadow(0 0 10px rgba(74,159,255,0.8))",
          }}
        />
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: 0.5,
              color: "#fff",
            }}
          >
            RMS
          </div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Record Management
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {links.map((l) => (
          <button
            key={l.key}
            onClick={() => navigate(l.path)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: active === l.key ? 600 : 400,
              color: active === l.key ? "#fff" : "rgba(255,255,255,0.6)",
              borderBottom:
                active === l.key
                  ? "2px solid #4B9FFF"
                  : "2px solid transparent",
              paddingBottom: 2,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => {
              if (active !== l.key)
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            }}
          >
            {l.label}
          </button>
        ))}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            color: "#fff",
            border: "none",
            padding: "9px 22px",
            borderRadius: 9,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
          }}
        >
          Login
        </button>
      </div>
    </nav>
  );
}

export function BottomCTA({ navigate }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 48px 80px",
        borderTop: "1px solid rgba(74,159,255,0.1)",
        background: "rgba(5,13,31,0.5)",
      }}
    >
      <h2 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 12px" }}>
        Ready to get started?
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "rgba(255,255,255,0.5)",
          margin: "0 0 28px",
        }}
      >
        Join hundreds of teams already using RMS to manage their data.
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
          color: "#fff",
          border: "none",
          padding: "13px 36px",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          boxShadow: "0 8px 30px rgba(37,99,235,0.4)",
        }}
      >
        Get Started Free →
      </button>
    </div>
  );
}

import { StoreProvider, useStore } from "../core/store.jsx";
import { useHashRouter } from "../core/router.js";
import { REGISTRY } from "../core/registry.js";
import { T } from "../core/tokens.js";
import { Header } from "./Header.jsx";
import { BottomNav } from "./BottomNav.jsx";
import { Toast } from "./Toast.jsx";

function Shell() {
  const st = useStore();
  useHashRouter();

  if (!st.ready) {
    return (
      <div
        style={{
          minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center",
          justifyContent: "center", color: T.ember, fontFamily: T.fontDisplay,
          fontWeight: 700, letterSpacing: "0.2em",
        }}
      >
        DRONASHALA OS
      </div>
    );
  }

  const Active = REGISTRY.find((m) => m.id === st.nav)?.component;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.fontBody, color: T.text }}>
      <Header />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 16px 100px" }}>
        {Active && <Active />}
      </div>
      <BottomNav />
      <Toast />
      {/* CommandPalette + ModalRouter wire in at Step 8 */}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

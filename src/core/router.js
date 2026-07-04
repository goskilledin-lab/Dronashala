/* ═══════════ L2 · HASH ROUTER — nav ↔ #/module, modal ↔ ?m=type ═══════════
   §8 rule: back button closes an open modal first, then walks module
   history, and only then exits the app. Called once from the Shell
   (Step 3) via useHashRouter(). */
import { useEffect, useRef } from "react";
import { useStore } from "./store.jsx";
import { REGISTRY } from "./registry.js";

const VALID_MODULES = REGISTRY.map(m => m.id);

function parseHash(hash) {
  const clean = hash.replace(/^#\/?/, "");
  const [modulePart, query] = clean.split("?");
  const nav = VALID_MODULES.includes(modulePart) ? modulePart : "home";
  const modalType = new URLSearchParams(query || "").get("m") || null;
  return { nav, modalType };
}

const buildHash = (nav, modalType) => (modalType ? `#/${nav}?m=${modalType}` : `#/${nav}`);

export function useHashRouter() {
  const st = useStore();
  const fromPopState = useRef(false);
  const initialized = useRef(false);
  const prevModal = useRef(null);

  // Initial load — adopt whatever module/modal the URL already points at.
  useEffect(() => {
    const { nav } = parseHash(window.location.hash);
    if (nav !== st.nav) st.setNav(nav);
    if (!window.location.hash) window.history.replaceState(null, "", buildHash(nav, null));
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back/forward: sync store from the URL. A hash without ?m= means a
  // modal (if any) must close before any module change is applied.
  useEffect(() => {
    const onPopState = () => {
      fromPopState.current = true;
      const { nav, modalType } = parseHash(window.location.hash);
      if (!modalType && st.modal) st.setModal(null);
      if (nav !== st.nav) st.setNav(nav);
      fromPopState.current = false;
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    };
  }, [st, st.nav, st.modal]);

  // In-app nav change (bottom nav tap, command palette, …) → push hash.
  useEffect(() => {
    if (!initialized.current || fromPopState.current) return;
    if (!st.modal) window.history.pushState(null, "", buildHash(st.nav, null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st.nav]);

  // In-app modal open/close → push/pop a history entry so back closes it.
  useEffect(() => {
    if (!initialized.current || fromPopState.current) { prevModal.current = st.modal; return; }
    if (st.modal && !prevModal.current) {
      window.history.pushState(null, "", buildHash(st.nav, st.modal.type));
    } else if (!st.modal && prevModal.current && parseHash(window.location.hash).modalType) {
      window.history.back(); // closed via X/backdrop — pop the entry we pushed
    }
    prevModal.current = st.modal;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st.modal, st.nav]);
}

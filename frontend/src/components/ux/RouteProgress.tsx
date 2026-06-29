import { useEffect, useState } from "react";
import { useLocation } from "wouter";
export default function RouteProgress() {
  const [location] = useLocation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
    const t = setTimeout(() => setShow(false), 450);
    return () => clearTimeout(t);
  }, [location]);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden">
      <div className="h-full w-1/3 animate-[slide_0.45s_linear] bg-gradient-to-r from-quantum-cyan via-quantum-lime to-quantum-purple" />
      <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}

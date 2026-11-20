import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "./Icons";

// Hoja inferior en mobile / diálogo centrado en escritorio, con animación de entrada y salida.
// `children` puede ser una función que recibe `close` para cerrar con animación.
function Modal({ title, onClose, children, maxWidth = "md:max-w-lg", as: Tag = "div", formProps }) {
  const [show, setShow] = useState(false);
  const close = useCallback(() => {
    setShow(false);
    setTimeout(onClose, 260);
  }, [onClose]);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return createPortal(
    <div
      className={`overlay fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 md:items-center md:p-4 md:pl-64 ${show ? "opacity-100" : "opacity-0"}`}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Tag
        {...formProps}
        className={`safe-bottom max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1.1)] md:rounded-[32px] md:p-7 ${maxWidth} ${
          show ? "translate-y-0 md:scale-100" : "translate-y-full md:translate-y-8 md:scale-95"
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 md:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button type="button" onClick={close} className="rounded-full p-2 text-slate-500 transition duration-300 hover:rotate-90 hover:bg-slate-100" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
        {typeof children === "function" ? children(close) : children}
      </Tag>
    </div>,
    document.body
  );
}

export default Modal;

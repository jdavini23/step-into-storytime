import React, { useState, useRef, cloneElement, isValidElement, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
  id?: string; // Optional id for aria-describedby
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, id }) => {
  const [show, setShow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // Use SSR-safe deterministic id
  const tooltipId = id || useId();
  // Debug log for verification (remove after confirming fix)
  if (typeof window !== 'undefined') {
    console.log('TooltipID (client):', tooltipId);
  } else {
    // This will only log on server/SSR
    console.log('TooltipID (server):', tooltipId);
  }

  // Clone the child to add aria-describedby and tabIndex if needed
  let trigger = children;
  if (isValidElement(children)) {
    const childProps: any = {
      'aria-describedby': tooltipId,
    };
    // If the child is not focusable, add tabIndex
    if (
      typeof children.type === 'string' &&
      !['a', 'button', 'input', 'textarea', 'select'].includes(children.type)
    ) {
      childProps.tabIndex = 0;
    }
    trigger = cloneElement(children, childProps);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {trigger}
      <AnimatePresence>
        {show && (
          <motion.div
            ref={tooltipRef}
            id={tooltipId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50"
            role="tooltip"
          >
            {text}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;

import React from 'react';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, title, description, onConfirm, onCancel }) => {
  // TODO: Implement confirmation dialog UI
  // Accessibility: Dialog semantics
  const dialogRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);
  if (!open) return null;
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      tabIndex={-1}
      className="outline-none"
    >
      <h2 id="dialog-title">{title}</h2>
      <p id="dialog-desc">{description}</p>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onConfirm}>Confirm</button>
    </div>
  );
};

export default React.memo(ConfirmationDialog);

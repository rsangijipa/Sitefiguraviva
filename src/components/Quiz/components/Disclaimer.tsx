import { AlertCircle } from "lucide-react";
import "./Disclaimer.css";

interface DisclaimerProps {
  text?: string;
  type?: "info" | "warning" | "clinical";
}

export function Disclaimer({
  text = "Este questionário tem finalidade educativa e de auto-observação. O resultado não constitui diagnóstico psicológico ou psiquiátrico.",
  type = "clinical",
}: DisclaimerProps) {
  return (
    <div className={`disclaimer disclaimer--${type}`}>
      <AlertCircle size={20} strokeWidth={2} className="disclaimer__icon" />
      <p className="disclaimer__text">{text}</p>
    </div>
  );
}

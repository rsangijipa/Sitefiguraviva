import { ArrowLeft } from "lucide-react";
import { APP_CONFIG } from "../config";
import "./AppHeader.css";

interface AppHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function AppHeader({ showBack = false, onBack }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="qz-app-container">
        <div className="app-header__inner">
          <div className="app-header__left">
            {showBack && onBack && (
              <button
                onClick={onBack}
                className="app-header__back-btn"
                aria-label="Voltar"
              >
                <ArrowLeft size={20} strokeWidth={2} />
              </button>
            )}
            <div className="app-header__logo">
              <span className="app-header__logo-mente">Mente</span>
              <span className="app-header__logo-quiz">Quiz</span>
            </div>
          </div>
          <div className="app-header__right">
            <span className="app-header__subtitle">um recurso Figura Viva</span>
          </div>
        </div>
      </div>
    </header>
  );
}

import { ArrowLeft } from "lucide-react";
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
            <div className="app-header__logo" aria-hidden="true" />
          </div>
          <div className="app-header__right">
            <span className="app-header__subtitle">Autoconhecimento</span>
          </div>
        </div>
      </div>
    </header>
  );
}

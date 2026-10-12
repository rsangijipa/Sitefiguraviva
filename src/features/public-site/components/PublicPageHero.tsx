import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./PublicPageHero.module.css";
interface PublicPageHeroProps {
  eyebrow?: string; title: string; description?: string; notice?: ReactNode;
  actions?: ReactNode; visual?: ReactNode; backgroundImage?: string;
}
export default function PublicPageHero({ eyebrow, title, description, notice, actions, visual, backgroundImage }: PublicPageHeroProps) {
  return <header className={styles.hero} data-public-hero>
    {backgroundImage && <div className={styles.artwork} aria-hidden="true"><Image src={backgroundImage} alt="" fill sizes="100vw" priority className="object-cover object-center" /></div>}
    <div className={styles.layout}>
      <div className={styles.copy}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {visual && <div className={styles.visual}>{visual}</div>}
    </div>
  </header>;
}

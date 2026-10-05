import styles from "./AuthBackground.module.css";

/** Decorative artwork stays anchored to the viewport while long forms scroll. */
export default function AuthBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet="/assets/auth/watercolor-small.webp"
        />
        <img
          src="/assets/auth/watercolor.webp"
          alt=""
          width={1672}
          height={941}
          fetchPriority="high"
          className={styles.artwork}
        />
      </picture>
    </div>
  );
}

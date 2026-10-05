"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import NotificationBell from "@/components/layout/NotificationBell";
import {
  ADMIN_NAVIGATION_GROUPS,
  isAdminRouteActive,
} from "@/config/admin-navigation";
import styles from "./Admin.module.css";

const items = ADMIN_NAVIGATION_GROUPS.flatMap((group) => group.items);

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const { addToast } = useToast();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const suggestions = useMemo(() => {
    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const term = normalize(query.trim());
    return items
      .filter((item) => !term || normalize(item.label).includes(term))
      .slice(0, 7);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = menuButton.current;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      ).filter((el) => el.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const media = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onResize);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onResize);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div
      className={"fv-admin " + styles.root}
      data-collapsed={collapsed}
      data-menu-open={open}
    >
      {open && (
        <button
          className={styles.scrim}
          onClick={() => setOpen(false)}
          aria-label="Fechar menu de navegação"
          tabIndex={-1}
        />
      )}
      <aside
        ref={sidebar}
        id="admin-navigation"
        className={styles.sidebar}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label="Menu administrativo"
      >
        <div className={styles.brand}>
          <Image
            src="/icon-192x192.png"
            alt="Instituto Figura Viva"
            width={40}
            height={40}
          />
          <div className={styles.brandText}>
            <strong>Figura Viva</strong>
            <span>Administração</span>
          </div>
          <button
            ref={closeButton}
            type="button"
            className={styles.mobileClose}
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav
          className={styles.navigation}
          aria-label="Áreas do painel"
          data-lenis-prevent
        >
          {ADMIN_NAVIGATION_GROUPS.map((group, index) => (
            <section
              key={group.label}
              className={styles.navGroup}
              data-tone={index % 4}
            >
              <h2>{group.label}</h2>
              {group.items.map((item) => {
                const active = isAdminRouteActive(pathname, item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.label}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setOpen(false)}
                    className={styles.navItem}
                  >
                    <span className={styles.navIcon}>
                      <item.icon size={19} aria-hidden="true" />
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                    {active && (
                      <span className={styles.activeDot} aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </section>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link
            href="/"
            className={styles.footerLink}
            aria-label="Abrir site público"
            title="Abrir site público"
          >
            <Home size={18} aria-hidden="true" />
            <span>Ver site</span>
            <ArrowUpRight size={15} className={styles.externalIcon} />
          </Link>
          <button
            type="button"
            className={styles.footerLink}
            aria-label="Sair da conta"
            title="Sair da conta"
            onClick={() =>
              void signOut().catch((error) =>
                addToast(
                  error instanceof Error
                    ? error.message
                    : "Não foi possível sair. Tente novamente.",
                  "error",
                ),
              )
            }
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Sair da conta</span>
          </button>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
            <span>Recolher menu</span>
          </button>
        </div>
      </aside>
      <div className={styles.workspace} inert={open ? true : undefined}>
        <header className={styles.topbar}>
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            onClick={() => setOpen(true)}
            aria-controls="admin-navigation"
            aria-expanded={open}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <div className={styles.breadcrumbs}>
            <Breadcrumbs className="!mb-0" />
          </div>
          <span className={styles.mobileTitle}>
            Figura Viva <small>Admin</small>
          </span>
          <div
            className={styles.search}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setSearchOpen(false);
            }}
          >
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Buscar área do painel"
              type="search"
              placeholder="Buscar no painel…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setSearchOpen(false);
              }}
            />
            {searchOpen && (
              <div className={styles.searchResults}>
                <p>Ir para uma área</p>
                {suggestions.length ? (
                  suggestions.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery("");
                      }}
                    >
                      <item.icon size={17} aria-hidden="true" />
                      {item.label}
                      <ArrowUpRight size={15} />
                    </Link>
                  ))
                ) : (
                  <span>Nenhuma área encontrada.</span>
                )}
              </div>
            )}
          </div>
          <NotificationBell />
          <Link
            href="/admin/settings"
            className={styles.account}
            aria-label="Abrir configurações"
            title="Configurações"
          >
            <span className={styles.avatar}>
              {user?.displayName?.[0]?.toUpperCase() || "A"}
            </span>
            <span className={styles.accountName}>
              {user?.displayName || "Administrador"}
              <small>Minha conta</small>
            </span>
            <Settings size={17} aria-hidden="true" />
          </Link>
        </header>
        <main id="main-content" className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

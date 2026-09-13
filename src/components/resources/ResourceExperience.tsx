"use client";

import type { ReactNode } from "react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { ResourceNavigation } from "./ResourceNavigation";
import { ResourceWindow } from "./ResourceWindow";
import type { ResourceSection } from "./resourceCatalog";

export interface ResourceExperienceProps {
  isOpen: boolean;
  title: string;
  category?: string;
  onClose: () => void;
  sections?: ResourceSection[];
  activeSection?: string;
  onSectionChange?: (id: string) => void;
  className?: string;
  children: ReactNode;
}

export function ResourceExperience({
  isOpen,
  title,
  category,
  onClose,
  sections,
  activeSection,
  onSectionChange,
  className = "",
  children,
}: ResourceExperienceProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={title}>
      <ModalContent
        size="full"
        className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col min-h-0 bg-paper p-0 m-0 overflow-hidden"
      >
        <div className="flex h-full w-full flex-col min-h-0">
          <ResourceNavigation
            title={title}
            category={category}
            backLabel="Recursos"
            onBack={onClose}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <ResourceWindow
              isOpen={true}
              title={title}
              onClose={onClose}
              className={className}
              scrollKey={activeSection}
            >
              {sections && sections.length > 0 && (
                <nav aria-label="Seções do recurso" className="sticky top-0 z-10 border-b border-primary/10 bg-paper">
                  <div className="flex gap-1 overflow-x-auto scrollbar-none px-4 py-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => onSectionChange?.(section.id)}
                          className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            isActive
                              ? "bg-primary text-white"
                              : "border border-primary/15 bg-white/85 text-primary hover:border-terra hover:text-terra"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {Icon && <Icon size={16} aria-hidden="true" />}
                          <span>{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
              )}
              <div className="h-full min-h-0 w-full">{children}</div>
            </ResourceWindow>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

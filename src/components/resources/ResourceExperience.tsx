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
        className="flex h-[100dvh] max-h-[100dvh] w-full max-w-full flex-col min-h-0 bg-paper sm:h-[min(94dvh,960px)] sm:max-h-[calc(100dvh-24px)] sm:w-[min(96vw,1440px)] sm:rounded-[2rem] sm:border sm:border-white/80 sm:bg-paper sm:shadow-[0_28px_90px_rgba(30,25,20,0.35)] p-0 m-0 overflow-hidden"
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
                <nav className="sticky top-0 z-10 -mt-4 -mx-4 sm:-mx-8 mb-4 sm:mb-8 bg-paper pb-2">
                  <div className="flex gap-1 overflow-x-auto scrollbar-none px-4 sm:px-8 pt-4 pr-16 sm:pr-20">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => onSectionChange?.(section.id)}
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
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

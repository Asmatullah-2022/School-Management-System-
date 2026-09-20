"use client";

import { useState } from "react";
import { Card, EmptyState } from "@/components/ui/card";
import { MyLibraryView } from "@/components/library/my-library-view";
import type { Book, BookIssue, LibrarySettings, Student } from "@/types/database";

export function MyLibraryChildSwitcher({
  entries,
  books,
  settings,
  showChildHeader,
}: {
  entries: { student: Student; issues: BookIssue[] }[];
  books: Book[];
  settings: LibrarySettings;
  showChildHeader: boolean;
}) {
  const [selectedId, setSelectedId] = useState(entries[0]?.student.id);
  const active = entries.find((e) => e.student.id === selectedId) ?? entries[0];

  if (!active) {
    return (
      <Card>
        <EmptyState label="No linked student record was found for your account. Please contact the school office." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {entries.map((e) => (
            <button
              key={e.student.id}
              onClick={() => setSelectedId(e.student.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                active.student.id === e.student.id ? "bg-primary text-primary-foreground" : "border border-border text-muted hover:bg-background"
              }`}
            >
              {e.student.full_name}
            </button>
          ))}
        </div>
      )}
      <MyLibraryView issues={active.issues} books={books} settings={settings} student={showChildHeader ? active.student : undefined} />
    </div>
  );
}

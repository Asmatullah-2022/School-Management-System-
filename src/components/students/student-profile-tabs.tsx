"use client";

import { useState } from "react";
import { Card, EmptyState } from "@/components/ui/card";
import type { AttendanceRecord, FeeRecord, HomeworkRecord, Student } from "@/types/database";

const TABS = ["Overview", "Attendance", "Fees", "Homework"] as const;

const feeStatusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success",
  partial: "bg-warning/10 text-warning",
  unpaid: "bg-muted/10 text-muted",
  overdue: "bg-danger/10 text-danger",
};

const attendanceStyles: Record<string, string> = {
  present: "bg-success/10 text-success",
  absent: "bg-danger/10 text-danger",
  late: "bg-warning/10 text-warning",
  leave: "bg-primary/10 text-primary",
};

export function StudentProfileTabs({
  student,
  attendance,
  attendancePct,
  fees,
  homework,
}: {
  student: Student;
  attendance: AttendanceRecord[];
  attendancePct: number;
  fees: FeeRecord[];
  homework: HomeworkRecord[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  return (
    <Card>
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              tab === t ? "border-b-2 border-primary text-primary" : "text-muted hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "Overview" && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {[
              ["Father's Name", student.father_name],
              ["Mother's Name", student.mother_name],
              ["Gender", student.gender],
              ["Date of Birth", student.date_of_birth],
              ["Blood Group", student.blood_group],
              ["Contact Number", student.contact_number],
              ["Emergency Contact", student.emergency_contact],
              ["Address", student.address],
              ["District", student.district],
              ["Province", student.province],
              ["B-Form Number", student.b_form_number],
              ["Admission Date", student.admission_date],
              ["Previous School", student.previous_school],
              ["Medical Information", student.medical_info],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
                <dd className="mt-0.5 text-sm">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "Attendance" && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="text-3xl font-semibold text-primary">{attendancePct}%</div>
              <p className="text-sm text-muted">attendance in the recorded period</p>
            </div>
            {attendance.length === 0 ? (
              <EmptyState label="No attendance records yet." />
            ) : (
              <ul className="space-y-1.5">
                {attendance
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((a) => (
                    <li key={a.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span>{new Date(a.date).toLocaleDateString()}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${attendanceStyles[a.status]}`}>
                        {a.status}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {tab === "Fees" && (
          <div>
            {fees.length === 0 ? (
              <EmptyState label="No fee records yet." />
            ) : (
              <ul className="space-y-2">
                {fees.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                    <div>
                      <p className="font-medium">{f.title}</p>
                      <p className="text-xs text-muted">Due {new Date(f.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">PKR {(f.amount - f.discount).toLocaleString()}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${feeStatusStyles[f.status]}`}>
                        {f.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "Homework" && (
          <div>
            {homework.length === 0 ? (
              <EmptyState label="No homework assigned yet." />
            ) : (
              <ul className="space-y-2">
                {homework.map((h) => (
                  <li key={h.id} className="rounded-lg border border-border px-3 py-2.5 text-sm">
                    <p className="font-medium">{h.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{h.description}</p>
                    <p className="mt-1 text-xs text-muted">Due {new Date(h.due_date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

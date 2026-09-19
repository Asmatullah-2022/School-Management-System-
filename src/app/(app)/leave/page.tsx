import { redirect } from "next/navigation";
import { getSession, isSchoolAdmin } from "@/lib/auth/session";
import { getChildStudentIdsForProfile } from "@/lib/data/people";
import { listStudents } from "@/lib/data/students";
import { listAllLeaveRequests, listMyLeaveRequests } from "@/lib/data/leave";
import { Card, CardHeader, EmptyState } from "@/components/ui/card";
import { LeaveRequestForm } from "@/components/leave/leave-request-form";
import { LeaveReviewButtons } from "@/components/leave/leave-review-buttons";
import { submitLeaveRequestAction, reviewLeaveRequestAction } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-danger/10 text-danger",
};

export default async function LeavePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const canReview = isSchoolAdmin(session.profile.role);
  const [requests, students] = await Promise.all([
    canReview ? listAllLeaveRequests() : listMyLeaveRequests(session.profile.id),
    listStudents(),
  ]);

  let children: Awaited<ReturnType<typeof listStudents>> = [];
  if (session.profile.role === "parent") {
    const childIds = await getChildStudentIdsForProfile(session.profile.id);
    children = students.filter((s) => childIds.includes(s.id));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{canReview ? "Leave Requests" : "Leave"}</h1>
        <p className="text-sm text-muted">
          {canReview ? "Review and decide on leave requests from parents, students, and staff." : "Submit a leave request and track its status."}
        </p>
      </div>

      {!canReview && (
        <Card className="p-5">
          <LeaveRequestForm linkedChildren={session.profile.role === "parent" ? children : undefined} action={submitLeaveRequestAction} />
        </Card>
      )}

      <Card>
        <CardHeader title={canReview ? "All Leave Requests" : "History"} />
        {requests.length === 0 ? (
          <EmptyState label="No leave requests yet." />
        ) : (
          <ul className="divide-y divide-border">
            {requests.map((r) => {
              const student = students.find((s) => s.id === r.student_id);
              return (
                <li key={r.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {new Date(r.start_date).toLocaleDateString()} – {new Date(r.end_date).toLocaleDateString()}
                      {student && <span className="text-muted"> · {student.full_name}</span>}
                    </p>
                    <p className="mt-0.5 text-muted">{r.reason}</p>
                    {r.review_remarks && <p className="mt-1 text-xs text-muted">Admin remarks: {r.review_remarks}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                    {canReview && r.status === "pending" && <LeaveReviewButtons id={r.id} action={reviewLeaveRequestAction} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

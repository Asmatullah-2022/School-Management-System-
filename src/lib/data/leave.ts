import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { LeaveRequest, UserRole } from "@/types/database";

/** All leave requests in the school — RLS (and, in demo mode, the caller)
 * restrict this to "own requests only" for parent/student/teacher; staff
 * see everything. Always call with the caller's own role in mind. */
export async function listAllLeaveRequests(): Promise<LeaveRequest[]> {
  if (isDemoMode()) return demoStore.listLeaveRequests();
  const supabase = await createClient();
  const { data, error } = await supabase.from("leave_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as LeaveRequest[];
}

/** A single requester's own leave requests (parent/student/teacher view). */
export async function listMyLeaveRequests(profileId: string): Promise<LeaveRequest[]> {
  if (isDemoMode()) return demoStore.listLeaveRequestsFor(profileId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("requester_profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as LeaveRequest[];
}

export async function createLeaveRequest(input: {
  schoolId: string;
  requesterProfileId: string;
  requesterRole: UserRole;
  studentId?: string | null;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<LeaveRequest> {
  if (isDemoMode()) {
    return demoStore.createLeaveRequest({
      requester_profile_id: input.requesterProfileId,
      requester_role: input.requesterRole,
      student_id: input.studentId ?? null,
      teacher_id: null,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason,
    });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      school_id: input.schoolId,
      requester_profile_id: input.requesterProfileId,
      requester_role: input.requesterRole,
      student_id: input.studentId ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      reason: input.reason,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as LeaveRequest;
}

export async function reviewLeaveRequest(
  id: string,
  status: "approved" | "rejected",
  reviewedBy: string,
  remarks?: string
): Promise<LeaveRequest | undefined> {
  if (isDemoMode()) return demoStore.reviewLeaveRequest(id, status, reviewedBy, remarks);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leave_requests")
    .update({ status, reviewed_by: reviewedBy, review_remarks: remarks ?? null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as LeaveRequest;
}

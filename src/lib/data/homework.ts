import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { demoStore } from "@/lib/demo/store";
import type { HomeworkRecord } from "@/types/database";

export async function getHomework(id: string): Promise<HomeworkRecord | undefined> {
  if (isDemoMode()) return demoStore.getHomework(id);
  const supabase = await createClient();
  const { data, error } = await supabase.from("homework").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as HomeworkRecord) ?? undefined;
}

/** Creates a homework item. RLS enforces that a teacher may only do this
 * for a class/section/subject they are actively assigned to — never trust
 * the client for that gate, only the DB policy (`teacher_has_assignment`). */
export async function createHomework(input: {
  schoolId: string;
  classId: string;
  sectionId: string | null;
  subjectId: string;
  teacherId: string | null;
  createdBy: string;
  title: string;
  description: string | null;
  instructions: string | null;
  attachmentUrl: string | null;
  assignedDate: string;
  dueDate: string;
  maxMarks: number | null;
  allowLate: boolean;
  stage: "draft" | "published";
}): Promise<HomeworkRecord> {
  if (isDemoMode()) {
    return demoStore.createHomework({
      class_id: input.classId,
      section_id: input.sectionId,
      subject_id: input.subjectId,
      teacher_id: input.teacherId,
      created_by: input.createdBy,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      attachment_url: input.attachmentUrl,
      assigned_date: input.assignedDate,
      due_date: input.dueDate,
      max_marks: input.maxMarks,
      allow_late: input.allowLate,
      stage: input.stage,
    });
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homework")
    .insert({
      school_id: input.schoolId,
      class_id: input.classId,
      section_id: input.sectionId,
      subject_id: input.subjectId,
      teacher_id: input.teacherId,
      created_by: input.createdBy,
      title: input.title,
      description: input.description,
      instructions: input.instructions,
      attachment_url: input.attachmentUrl,
      assigned_date: input.assignedDate,
      due_date: input.dueDate,
      max_marks: input.maxMarks,
      allow_late: input.allowLate,
      stage: input.stage,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as HomeworkRecord;
}

export async function updateHomework(id: string, data: Partial<HomeworkRecord>): Promise<HomeworkRecord | undefined> {
  if (isDemoMode()) return demoStore.updateHomework(id, data);
  const supabase = await createClient();
  const { data: row, error } = await supabase.from("homework").update(data).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return row as HomeworkRecord;
}

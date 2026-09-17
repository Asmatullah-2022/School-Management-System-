"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { archiveTeacher, createTeacher, type NewTeacher } from "@/lib/data/teachers";
import type { Teacher } from "@/types/database";

export async function createTeacherAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const input: NewTeacher = {
    employee_id: String(formData.get("employee_id") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
    father_name: String(formData.get("father_name") ?? "") || null,
    cnic: String(formData.get("cnic") ?? "") || null,
    gender: (formData.get("gender") as Teacher["gender"]) || null,
    mobile: String(formData.get("mobile") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    designation: String(formData.get("designation") ?? "") || null,
    qualification: String(formData.get("qualification") ?? "") || null,
    joining_date: String(formData.get("joining_date") ?? "") || null,
    photo_url: null,
  };

  if (!input.full_name || !input.employee_id) {
    return { error: "Full name and employee ID are required." };
  }

  await createTeacher(input, session.school.id);
  revalidatePath("/teachers");
  redirect("/teachers");
}

export async function archiveTeacherAction(id: string) {
  await archiveTeacher(id);
  revalidatePath("/teachers");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { archiveStudent, createStudent, updateStudent, type NewStudent } from "@/lib/data/students";
import type { Student } from "@/types/database";

function readStudentForm(formData: FormData): NewStudent {
  return {
    full_name: String(formData.get("full_name") ?? ""),
    father_name: String(formData.get("father_name") ?? "") || null,
    mother_name: String(formData.get("mother_name") ?? "") || null,
    gender: (formData.get("gender") as Student["gender"]) || null,
    date_of_birth: String(formData.get("date_of_birth") ?? "") || null,
    b_form_number: String(formData.get("b_form_number") ?? "") || null,
    contact_number: String(formData.get("contact_number") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    district: String(formData.get("district") ?? "") || null,
    province: String(formData.get("province") ?? "") || null,
    class_id: String(formData.get("class_id") ?? "") || null,
    section_id: String(formData.get("section_id") ?? "") || null,
    roll_number: String(formData.get("roll_number") ?? "") || null,
    admission_number: String(formData.get("admission_number") ?? ""),
    admission_date: String(formData.get("admission_date") ?? new Date().toISOString().slice(0, 10)),
    previous_school: String(formData.get("previous_school") ?? "") || null,
    blood_group: String(formData.get("blood_group") ?? "") || null,
    emergency_contact: String(formData.get("emergency_contact") ?? "") || null,
    photo_url: null,
    medical_info: String(formData.get("medical_info") ?? "") || null,
    academic_session_id: null,
  };
}

export async function createStudentAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const input = readStudentForm(formData);
  if (!input.full_name || !input.admission_number) {
    return { error: "Full name and admission number are required." };
  }

  const student = await createStudent(input, session.school.id);
  revalidatePath("/students");
  redirect(`/students/${student.id}`);
}

export async function updateStudentAction(id: string, formData: FormData) {
  const input = readStudentForm(formData);
  await updateStudent(id, input);
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function archiveStudentAction(id: string) {
  await archiveStudent(id);
  revalidatePath("/students");
  redirect("/students");
}

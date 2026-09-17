import { listClasses, listSections } from "@/lib/data/academics";
import { listStudents } from "@/lib/data/students";
import { listTeachers } from "@/lib/data/teachers";
import { Card, CardHeader } from "@/components/ui/card";

export default async function ClassesPage() {
  const [classes, sections, students, teachers] = await Promise.all([
    listClasses(),
    listSections(),
    listStudents(),
    listTeachers(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Classes & Sections</h1>
        <p className="text-sm text-muted">{classes.length} classes · {sections.length} sections</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => {
          const classSections = sections.filter((s) => s.class_id === c.id);
          const classStudents = students.filter((s) => s.class_id === c.id);
          return (
            <Card key={c.id}>
              <CardHeader
                title={c.name}
                action={
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {classStudents.length} students
                  </span>
                }
              />
              <div className="p-4">
                {classSections.length === 0 ? (
                  <p className="text-sm text-muted">No sections created yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {classSections.map((s) => {
                      const teacher = teachers.find((t) => t.id === s.class_teacher_id);
                      const count = students.filter((st) => st.section_id === s.id).length;
                      return (
                        <li key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium">Section {s.name}</p>
                            <p className="text-xs text-muted">{teacher ? `Class teacher: ${teacher.full_name}` : "No class teacher assigned"}</p>
                          </div>
                          <span className="text-xs text-muted">{count} students</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

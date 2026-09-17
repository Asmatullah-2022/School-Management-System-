import { listHomework } from "@/lib/data/records";
import { listClasses, listSections, listSubjects } from "@/lib/data/academics";
import { listTeachers } from "@/lib/data/teachers";
import { Card } from "@/components/ui/card";

export default async function HomeworkPage() {
  const [homework, classes, sections, subjects, teachers] = await Promise.all([
    listHomework(),
    listClasses(),
    listSections(),
    listSubjects(),
    listTeachers(),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Homework & Assignments</h1>
        <p className="text-sm text-muted">{homework.length} active homework items</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {homework.map((h) => {
          const cls = classes.find((c) => c.id === h.class_id)?.name;
          const sec = sections.find((s) => s.id === h.section_id)?.name;
          const subject = subjects.find((s) => s.id === h.subject_id)?.name;
          const teacher = teachers.find((t) => t.id === h.teacher_id)?.full_name;
          const overdue = new Date(h.due_date) < new Date(new Date().toDateString());

          return (
            <Card key={h.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{subject}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${overdue ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                  {overdue ? "Overdue" : "Open"}
                </span>
              </div>
              <h3 className="text-sm font-semibold">{h.title}</h3>
              <p className="mt-1 text-sm text-muted">{h.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted">
                <span>{cls} {sec ? `- ${sec}` : ""} · {teacher}</span>
                <span>Due {new Date(h.due_date).toLocaleDateString()}</span>
              </div>
            </Card>
          );
        })}
        {homework.length === 0 && <p className="text-sm text-muted">No homework assigned yet.</p>}
      </div>
    </div>
  );
}

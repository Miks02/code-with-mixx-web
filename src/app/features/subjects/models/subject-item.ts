export type SubjectItem = {
  id: number;
  subjectName: string;
  subjectDescription: string;
  classesCount: number;
  studentsCount: number;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
};

import { ProjectType } from './project-type';

export type ProjectItem = {
  id: number;
  subjectId: number;
  subjectName: string;
  projectType: ProjectType;
  price: number;
  progress: number;
  reservedAt: string;
  startDate: string;
  endDate: string;
  githubLink: string | null,
  downloadLink: string | null,
  notes: string[]
};

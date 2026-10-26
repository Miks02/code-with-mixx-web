import { ProjectNote } from './project-note';

export type UpdateProjectRequest = {
  price: number,
  progress: number,
  githubLink: string | null,
  downloadLink: string | null,
  notesToDelete: number[],
  notesToAdd: string[]
};

export type UpdateProjectPayload = {
  projectId: number,
  reservationId: number,
  request: UpdateProjectRequest
};

export type UpdateProjectFormModel = Omit<
  UpdateProjectRequest,
  'githubLink' | 'downloadLink' | 'notesToAdd'
> & {
  githubLink: string,
  downloadLink: string,
  notes: ProjectNote[]
};

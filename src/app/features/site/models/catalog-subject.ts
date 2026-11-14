export type SubjectArea = 'Programiranje' | 'Web razvoj' | 'Podaci';

export type CatalogSubject = {
  id: string;
  name: string;
  area: SubjectArea;
  description: string;
  topics: string[];
  // Names of the matching courses at ITS, shown only when they differ from `name`.
  itsCourses: string[];
  // Path to a file in `public/`. While it is null the list shows a placeholder.
  image: string | null;
};

export type SubjectGroup = {
  area: SubjectArea;
  note: string;
  subjects: CatalogSubject[];
};

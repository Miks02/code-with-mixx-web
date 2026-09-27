export type CreateStudentRequest = {
  firstName: string;
  lastName: string;
  university: string | null;
  email: string;
  phoneNumber: string;
};

export type CreateStudentFormModel = Omit<CreateStudentRequest, 'university'> & {
  university: string;
};

export enum Status {
  pending,
  success,
  failure,
}

export enum StepType {
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
}

export interface Step {
  id: number;
  description?: string;
  title: String;
  status: Status;
  stepType: StepType;
}

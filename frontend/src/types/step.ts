export enum Status {
  pending,
  completed,
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
  code?: string;
  title: string;
  status: Status;
  stepType: StepType;
  path?: string;
}

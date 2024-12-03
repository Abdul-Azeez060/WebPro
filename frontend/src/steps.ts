import { Status, Step, StepType } from "./types/step";

export function stepsParser(steps: string): Step[] {
  // Regex to extract full file paths
  const fileEntries = steps.split(/([a-zA-Z0-9.-/]+):\n```/);

  // Filter and clean the file names, ensuring they are valid file entries
  const files = fileEntries.filter(
    (entry, index) =>
      index % 2 === 1 &&
      entry.trim() !== "" &&
      // Exclude entries that might be partial matches
      !entry.includes("```")
  );
  console.log(files, "these are the files which we got check it out");

  return files.map((file, index) => ({
    id: index,
    title: `Create ${file}`,
    status: Status.pending,
    stepType: file.includes("/") ? StepType.CreateFile : StepType.CreateFolder,
  }));
}

import { Heading1 } from "lucide-react";
import { Status, Step, StepType } from "./types/step";

// export function stepsParser(steps: string): Step[] {
//   // Regex to extract full file paths
//   const fileEntries = steps.split(/([a-zA-Z0-9.-/]+):\n```/);

//   // Filter and clean the file names, ensuring they are valid file entries
//   const files = fileEntries.filter(
//     (entry, index) =>
//       index % 2 === 1 &&
//       entry.trim() !== "" &&
//       // Exclude entries that might be partial matches
//       !entry.includes("```")
//   );
//   console.log(files, "these are the files which we got check it out");

//   const newList = []
//   files.forEach((file, index) => {
//       for(let i=0; i < folder.length-1; i++){
//         // only push the create folder object to the list if it is not present
//         newList.push({
//           id: index,
//           title: `Create ${file}`,
//           status: Status.pending,
//           stepType:  StepType.CreateFolder,
//         })
//       }

//     }
//     newList.push({
//       id: index,
//       title: `Create ${file}`,
//       status: Status.pending,
//       stepType:  StepType.CreateFile,
//     })

//   })

//   return files.map((file, index) => ({
//     id: index,
//     title: `Create ${file}`,
//     status: Status.pending,
//     stepType: file.includes("/") ? StepType.CreateFile : StepType.CreateFolder,
//   }));

// }

export function stepsParser(steps: string): Step[] {
  // Regex to extract full file paths and their content
  const fileEntries = steps.split(/([a-zA-Z0-9.-/]+):\n```([\s\S]*?)```/g);

  const parsedSteps: Step[] = [];

  // Iterate through entries in groups of 3 (full match, filename, content)
  for (let i = 1; i < fileEntries.length; i += 3) {
    const path = fileEntries[i];
    const code = fileEntries[i + 1]?.trim() || "";

    parsedSteps.push({
      id: parsedSteps.length,
      title: path,
      path: path,
      description: `Create ${path}`,
      code: code,
      status: Status.pending,
      stepType: StepType.CreateFile,
    });
  }
  console.log(parsedSteps);
  return parsedSteps;
}

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
export function parseXml(response: string): Step[] {
  // Extract the XML content between <boltArtifact> tags
  const xmlMatch = response.match(
    /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/
  );
  if (!xmlMatch) {
    return [];
  }
  const xmlContent = xmlMatch[1];
  const steps: Step[] = [];
  let stepId = 1;

  // Extract artifact title
  const titleMatch = response.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : "Project Files";

  // Add initial artifact step
  steps.push({
    id: stepId++,
    title: artifactTitle,
    description: "",
    stepType: StepType.CreateFolder,
    status: Status.pending,
  });

  // Regular expression to find boltAction elements
  const actionRegex =
    /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;
  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;
    if (type === "file") {
      // More aggressive code block marker removal

      console.log(content, "this is the content");

      const cleanedCode = content
        .replace(/^```typescript/, "")
        .replace(/^```tsx/, "")
        .replace(/\n```$/, "");
      console.log(cleanedCode, "this isthe cleaned code");

      // File creation step
      steps.push({
        id: stepId++,
        title: `Create ${filePath || "file"}`,
        description: "",
        stepType: StepType.CreateFile,
        status: Status.pending,
        code: cleanedCode,
        path: filePath,
      });
    } else if (type === "shell") {
      // Clean up shell command
      const cleanedContent = content
        .replace(/^```\w*\s*/, "") // Remove opening code block marker and any following whitespace
        .replace(/\s*```$/, "") // Remove closing code block marker with preceding whitespace
        .trim();

      // Shell command step
      steps.push({
        id: stepId++,
        title: "Run command",
        description: "",
        stepType: StepType.RunScript,
        status: Status.pending,
        code: cleanedContent,
      });
    }
  }
  return steps;
}

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

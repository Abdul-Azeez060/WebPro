require("dotenv").config();
import express, { Request, Response } from "express";
import { BASE_PROMPT_NODE, BASE_REACT } from "./prompt";
import BASE_PROMPT_REACT from "./prompt";
import { getSystemPrompt } from "./prompts";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function main(prom: any) {
  try {
    const result = await model.generateContentStream(prom);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      process.stdout.write(chunkText);
      return chunkText;
    }
  } catch (error) {
    console.log(error);
  }
}

app.post("/template", async (req: Request, res: Response) => {
  const prompt = req.body?.prompt;
  const fullPrompt =
    ' According to the below statement, give me whether it is a "react" or a "node" applicaton, only give one word answer "react" or "node"  ';
  const response = await main(prompt + fullPrompt);
  if (response == "react") {
    res.status(200).json({
      prompts: [
        BASE_REACT,
        `# Project Files\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${BASE_PROMPT_REACT} Here is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n  - .bolt/prompt`,
      ],
      uiPrompts: BASE_PROMPT_REACT,
    });
  }

  if (response == "node") {
    res.status(200).json({
      prompts: [
        `# use all the stable versions of the dependencies and install all the required dependencies. Project Files\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.${BASE_PROMPT_NODE}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json`,
      ],
      uiPrompts: BASE_PROMPT_NODE,
    });
  }
  if (response != "react" && response != "node") {
    res.status(403).json({
      message: "Please specify the type of stack you want to use",
    });
  }
});

app.post("/chat", async (req: any, res: any) => {
  const messages = req.body.messages;

  const defaultPrompt = `<bolt_running_commands>\n</bolt_running_commands>\n\n${messages}\n\n# File Changes\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json`;

  let prompt = getSystemPrompt();
  messages.forEach((element: String) => {
    prompt += element;
  });
  try {
    const result = await model.generateContentStream(prompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText); //Send each chunk to the client
    }

    return res.end(); // Signal the end of the stream
  } catch (error) {
    res.write(`event: error\ndata: ${JSON.stringify({ error })}\n\n`);
    res.end();
  }
});
app.listen("3000", () => console.log("succesfully running"));

import { Status, Step, StepType } from "./types/step";
/*
```html
<boltArtifact id="todo-app" title="Todo App with Vite, React, and TypeScript">
  <boltAction type="file" filePath="src/App.tsx">
    ```tsx
    import React, { useState } from 'react';
    import { Plus } from 'lucide-react';

    interface Todo {
      id: number;
      text: string;
      completed: boolean;
    }

    const App: React.FC = () => {
      const [todos, setTodos] = useState<Todo[]>([]);
      const [newTodo, setNewTodo] = useState('');

      const addTodo = () => {
        if (newTodo.trim() === '') return;
        setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
        setNewTodo('');
      };

      const toggleComplete = (id: number) => {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
      };

      const removeTodo = (id: number) => {
        setTodos(todos.filter((todo) => todo.id !== id));
      };

      return (
        <div className="min-h-screen bg-gray-100 p-4">
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="border border-gray-300 px-3 py-2 rounded-md flex-grow"
            />
            <button onClick={addTodo} className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              <Plus className="h-5 w-5 inline-block mr-1" />
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center p-2 bg-white rounded-md shadow">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                  className="mr-2"
                />
                <span
                  className={`${todo.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="ml-auto bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    };

    export default App;
    ```
  </boltAction>
  <boltAction type="shell">
    npm run dev
  </boltAction>
</boltArtifact>
```
*/

// [{id: 0, title: 'src/App.tsx', path: 'src/App.tsx', code: "import React, { useState } from import { Plus } from 'lucide-react'",status:  Status.pending, steptype: StepType.CreateFile},
//   {id: 1, title: '', path: '', code: '', status: '', steptype: ''}]

export function parser(steps: string): Step[] {
  const result: Step[] = [];

  // Regex to match the boltArtifact block
  const artifactRegex = /<boltArtifact[\s\S]*?>([\s\S]*?)<\/boltArtifact>/g;
  const artifacts = [...steps.matchAll(artifactRegex)];

  artifacts.forEach((artifact) => {
    const content = artifact[1];

    // Regex to match boltAction with optional filePath and code block
    const actionRegex =
      /<boltAction\s+type="([^"]+)"(?:\s+filePath="([^"]+)")?>\s*(```[\w]*\s*([\s\S]*?)```|([\s\S]*?))<\/boltAction>/g;
    const actions = [...content.matchAll(actionRegex)];

    actions.forEach((action) => {
      const [, type, filePath = "", codeBlock, inlineCode = ""] = action;

      // Extract code content from either a code block or inline code
      let code = codeBlock
        ? codeBlock
            .replace(/^```[\w]*\n?/, "")
            .replace(/```$/, "")
            .trim()
        : inlineCode.trim();

      code = code.replace("```", "");
      console.log(code, "the changed god, fingeres crossed");

      result.push({
        id: result.length,
        title: filePath ? filePath.split("/").pop() || "" : type,
        path: filePath,
        code,
        status: Status.pending, // Assuming initial status
        stepType: StepType.CreateFile, // Capitalize first letter
      });
    });
  });
  console.log(result, "this is the parsed result");
  return result;
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

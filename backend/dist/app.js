"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const prompt_1 = require("./prompt");
const prompt_2 = __importDefault(require("./prompt"));
const prompts_1 = require("./prompts");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
function main(prom) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        try {
            const result = yield model.generateContentStream(prom);
            try {
                for (var _d = true, _e = __asyncValues(result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const chunk = _c;
                    const chunkText = chunk.text();
                    process.stdout.write(chunkText);
                    return chunkText;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const prompt = (_a = req.body) === null || _a === void 0 ? void 0 : _a.prompt;
    const fullPrompt = ' According to the below statement, give me whether it is a "react" or a "node" applicaton, only give one word answer "react" or "node"  ';
    const response = yield main(prompt + fullPrompt);
    if (response == "react") {
        res.status(200).json({
            prompts: [
                prompt_1.BASE_REACT,
                `# Project Files\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${prompt_2.default} Here is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n  - .bolt/prompt`,
            ],
            uiPrompts: prompt_2.default,
        });
    }
    if (response == "node") {
        res.status(200).json({
            prompts: [
                `# Project Files\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.${prompt_1.BASE_PROMPT_NODE}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json`,
            ],
            uiPrompts: prompt_1.BASE_PROMPT_NODE,
        });
    }
    if (response != "react" && response != "node") {
        res.status(403).json({
            message: "Please specify the type of stack you want to use",
        });
    }
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_2, _b, _c;
    const messages = req.body.messages;
    const defaultPrompt = `<bolt_running_commands>\n</bolt_running_commands>\n\n${messages}\n\n# File Changes\n\nHere is a list of all files that have been modified since the start of the conversation.\nThis information serves as the true contents of these files!\n\nThe contents include either the full file contents or a diff (when changes are smaller and localized).\n\nUse it to:\n - Understand the latest file modifications\n - Ensure your suggestions build upon the most recent version of the files\n - Make informed decisions about changes\n - Ensure suggestions are compatible with existing code\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - /home/project/.bolt/config.json`;
    let prompt = (0, prompts_1.getSystemPrompt)();
    messages.forEach((element) => {
        prompt += element;
    });
    try {
        const result = yield model.generateContentStream(prompt);
        try {
            for (var _d = true, _e = __asyncValues(result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                const chunkText = chunk.text();
                console.log(chunkText, "--------this is the chunk---------");
                res.write(`${chunkText}`); // Send each chunk to the client
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        res.end(); // Signal the end of the stream
        return res.status(200);
    }
    catch (error) {
        res.write(`event: error\ndata: ${JSON.stringify({ error })}\n\n`);
        res.end();
    }
}));
app.listen("3000", () => console.log("succesfully running"));

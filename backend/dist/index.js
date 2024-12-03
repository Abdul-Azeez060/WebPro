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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const client = new sdk_1.default({});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("my main is running");
        try {
            yield client.messages
                .stream({
                messages: [{ role: "user", content: "Hello" }],
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 1024,
            })
                .on("text", (text) => {
                console.log(text);
            });
            console.log("this is the message");
        }
        catch (error) {
            console.log("this is the error", error);
        }
    });
}
main();

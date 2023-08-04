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
exports.assertEqual = void 0;
const tests_1 = __importDefault(require("./tests"));
function assertEqual(actual, expected) {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
    }
}
exports.assertEqual = assertEqual;
let success = 0;
let failure = 0;
const run = (name, test) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield test();
        console.log(`>>> PASS: ${name}`);
        success++;
    }
    catch (e) {
        console.error(`>>> FAIL: ${name}`);
        console.error(e);
        failure++;
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (const name in tests_1.default) {
        const test = tests_1.default[name];
        yield run(name, test);
    }
    console.log(`>>> Success: ${success}, Failure: ${failure}`);
}))();

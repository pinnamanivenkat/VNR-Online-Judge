"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var source_writer_1 = require("../source-writer");
var executable_ext_1 = require("../executable/executable-ext");
var init_1 = require("../init");
var path_1 = __importDefault(require("path"));
var execute_command_1 = require("../execute-command");
/**
 * Compiles a Cpp source file and returns a promise that resolves with the path of the executable
 * @param filePath A path like string
 * @param options Optional options
 */
function compileCpp(filePath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var compileTimeout, executableExt, compilationPath, cppPath, executableName, executablePath, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    compileTimeout = options && options.compileTimeout || 3000;
                    executableExt = executable_ext_1.getExecutableExt();
                    compilationPath = options && options.compilationPath || 'g++';
                    cppPath = path_1.default.join(init_1.tmpPath, 'cpp');
                    init_1.checkExistsAndMakeDir(cppPath);
                    executableName = source_writer_1.getFileName(executableExt);
                    executablePath = path_1.default.join(cppPath, executableName);
                    return [4 /*yield*/, execute_command_1.execute(compilationPath, [filePath, '-o', executablePath], { timeout: compileTimeout })];
                case 1:
                    res = _a.sent();
                    console.log('compile-file.js'+res);
                    if (res.exitCode !== 0) {
                        res.errorType = 'compile-time';
                        throw res;
                    }
                    return [2 /*return*/, executablePath];
            }
        });
    });
}
exports.compileCpp = compileCpp;
//# sourceMappingURL=compile-file.js.map
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var fs = __toESM(require("node:fs/promises"));
var graphTemplate = "```mermaid\ngraph LR\n";
var encoder = new TextEncoder();
var emptyGraph = encoder.encode(graphTemplate);
var Ignore = [/build/, /\..*/];
function isIgnore(name) {
  for (let i = 0; i < Ignore.length; i++) {
    if (Ignore[i].test(name)) {
      return true;
    }
  }
  return false;
}
async function makeGraph(root, graphpath, dirname) {
  if (!root) {
    return;
  }
  const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(root));
  for (let i = 0; i < files.length; i++) {
    if (isIgnore(files[i][0])) {
      continue;
    }
    if (files[i][1] === 1) {
      const id = root + "/" + files[i][0];
      const node = "	" + root.replaceAll("/", "_") + "(" + dirname + ") --> " + id.replaceAll("/", "_") + "[" + files[i][0] + "]\n";
      await fs.appendFile(graphpath, node);
    } else {
      const id = root + "/" + files[i][0];
      const node = "	" + root.replaceAll("/", "_") + "(" + dirname + ") --> " + id.replaceAll("/", "_") + "(" + files[i][0] + ")\n";
      await fs.appendFile(graphpath, node);
      await makeGraph(root + "/" + files[i][0], graphpath, files[i][0]);
    }
  }
  return;
}
function activate(context) {
  console.log('\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 "graph-extension" \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E');
  const disposable = vscode.commands.registerCommand(
    "graph-extension.ProjectGraphMaker",
    async () => {
      const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      const rootName = vscode.workspace.workspaceFolders?.[0]?.name;
      if (typeof root !== "undefined") {
        const graph = root + "/graph.md";
        const graphUri = vscode.Uri.file(graph);
        await vscode.workspace.fs.writeFile(graphUri, emptyGraph);
        await makeGraph(root, graph, rootName);
        await fs.appendFile(graph, "```");
        vscode.window.showInformationMessage("Graph has been made successfully!");
      } else {
        vscode.window.showErrorMessage("You have to open project firstly!");
      }
    }
  );
  context.subscriptions.push(disposable);
}
function deactivate() {
  console.log('\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 "graph-extension" \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E');
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map

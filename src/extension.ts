import * as vscode from 'vscode';
import * as fs from 'node:fs/promises';

const graphTemplate = "```mermaid\ngraph LR\n";
const encoder = new TextEncoder();

const emptyGraph = encoder.encode(graphTemplate);
const Ignore = [/build/, /\..*/];

function isIgnore(name: string): boolean {
    /*
    Эта функция решает, игнорировать ли данный путь или нет.

    Аргументы:
        name (string) - имя файла или директории.

    Возвращаемое значение:
        is_ignored (boolean) - true если файл игнорируется и false если нет
    
    */

    for (let i = 0; i < Ignore.length; i++) {
        if (Ignore[i].test(name)) {
            return true;
        }
    }
    return false;
}

async function makeGraph(root: string | undefined, graphpath: string, dirname: string | undefined) {
    /*
    Эта функция рекурсивно сканирует проект и, если файл или директория не должны игнорироваться,
добавляет файл или директорию в граф.
    
    Аргументы:
        root (string | undefined) - полный путь к родительской директории
        graphpath (string) -  полный путь к файлу графа
        diranme (string | undefined) - имя родительской директории

    Возвращаемое значение:
        Promise<void> - промис, который считывается после успешного завершения функции
    */

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
            const node = "\t" + root.replaceAll("/", "_") + "(" + dirname + ") --> " + id.replaceAll("/", "_") + "[" + files[i][0] + "]\n"; 
            await fs.appendFile(graphpath, node);
        } else {
            const id = root + "/" + files[i][0];
            const node = "\t" + root.replaceAll("/", "_") + "(" + dirname + ") --> " + id.replaceAll("/", "_") + "(" + files[i][0] + ")\n"; 
            await fs.appendFile(graphpath, node); 
            await makeGraph(root + "/" + files[i][0], graphpath, files[i][0]);
        }
    }
    return;
} 

export function activate(context: vscode.ExtensionContext) {
    /*
    Активирует расширение и регистрирует команду генерации графа. 
    
    Аргументы:
        context - контекст расширений VS

    */

    console.log('Расширение "graph-extension" активировано');

    // Регистрируем команду
    const disposable = vscode.commands.registerCommand(
        "graph-extension.ProjectGraphMaker",
        async () => {
            const root = (vscode.workspace.workspaceFolders)?.[0]?.uri.fsPath;
            const rootName = (vscode.workspace.workspaceFolders)?.[0]?.name;
            if (typeof root !== "undefined") {
                const graph = root + "/graph.md";
                const graphUri = vscode.Uri.file(graph);
                // Making empty graph.md
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


export function deactivate() {
    /*
    Деактивирует расширение.
    */

    console.log('Расширение "graph-extension" деактивировано');
}


import * as vscode from 'vscode';
import * as fs from 'node:fs/promises';

const graphTemplate = "```mermaid\ngraph LR\n";
const encoder = new TextEncoder();

const emptyGraph = encoder.encode(graphTemplate);
const Ignore = [/build/, /\..*/];

function isIgnore(name: string): boolean {
    /*
    This function decides either ignore given path or not

    Args:
        name (string) - the name of file or directory

    Returns:
        is_ignored (boolean) - true if file will be ignored and false if not
    
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
    This function recursively scans the project and if file or directory shouldn't be ignored 
    adds file or directory to graph.
    
    Args:
        root (string | undefined) - full path to the current parent (root) dir.
        graphpath (string) -  full path to the graph.md.
        diranme (string | undefined) - name of the current parent (root) dir.

    Returns:
        Promise<void> - promise wich resolves after successful writen in the file.
    */

    if (!root) {
        return;
    }
    const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(root));
    for (let i = 0; i < files.length; i++) {
        if (isIgnore(files[i][0]) && files[i][1] === 2) {
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
    Activates VC Code extention and registers the graph generation command.
    
    Args:
        context - the extention context provided by VC Code

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
    Deactivates VC Code extention and registers the graph generation command.
    */

    console.log('Расширение "graph-extension" деактивировано');
}


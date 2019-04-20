import * as vscode from "vscode";
import { frames } from "./frames/frames";

const log = vscode.window.showInformationMessage;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("partyparrot");
  const frameLoadTime = 1000 / config["frameRate"];
  const colors: vscode.TextEditorDecorationType[] = config["colors"].map(
    (c: string) => vscode.window.createTextEditorDecorationType({ color: c })
  );
  const frameSize: vscode.Range = new vscode.Range(
    new vscode.Position(0, 0),
    new vscode.Position(
      frames[0].split("\n").length,
      frames[0].split("\n")[0].length
    )
  );

  const docInit = async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "text"
    });
    const editor = await vscode.window.showTextDocument(doc);
    return editor;
  };

  const partyParrot = async () => {
    const editor = await docInit();
    let index = 0;
    let colorIndex = 0;
    let unsetDecoration = (editor: vscode.TextEditor) => {
      colors.forEach(c => editor.setDecorations(c, []));
    };
    const t = setInterval(() => {
      if (!editor || editor.document.isClosed) {
        clearInterval(t);
        return;
      }
      editor
        .edit(
          editorEdit => {
            editorEdit.replace(frameSize, frames[index]);
            editor.selection = new vscode.Selection(
              new vscode.Position(0, 0),
              new vscode.Position(0, 0)
            );
          },
          { undoStopAfter: false, undoStopBefore: false }
        )
        .then(() => {
          try {
            unsetDecoration(editor);
            editor.setDecorations(colors[colorIndex], editor.visibleRanges);
            colorIndex = (colorIndex + 1) % colors.length;
          } catch (err) {
            clearInterval(t);
          }
        })
        .then(undefined, err => {
          clearInterval(t);
        });
      index = (index + 1) % frames.length;
    }, frameLoadTime);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("partyparrot.party", partyParrot)
  );
}

export function deactivate() {}

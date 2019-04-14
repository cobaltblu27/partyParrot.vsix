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
    let unsetDecoration = () => {};
    const t = setInterval(() => {
      if (!editor || editor.document.isClosed) {
        clearInterval(t);
        return;
      }
      editor
        .edit(editorEdit => {
          editorEdit.replace(frameSize, frames[index]);
          editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0)
          );
        })
        .then(() => {
          try {
            editor.setDecorations(colors[colorIndex], editor.visibleRanges);
            unsetDecoration = () => {
              editor.setDecorations(colors[colorIndex], []);
              log("unset");
            };
            unsetDecoration();
            //editor.setDecorations(colors[2], [frameSize]);
            colorIndex = (colorIndex + 1) % colors.length;
            log(`${colorIndex}`);
          } catch (err) {
            clearInterval(t);
          }
        })
        .then(undefined, err => {
          clearInterval(t);
        });
      index = (index + 1) % frames.length;
    }, 1000);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("partyparrot.party", partyParrot)
  );
}

export function deactivate() {}

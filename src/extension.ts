'use strict';

import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.vscode-buildx-debugger.debugEditorContents', (resource: vscode.Uri) => {
      let targetResource = resource;
      if (!targetResource && vscode.window.activeTextEditor) {
        targetResource = vscode.window.activeTextEditor.document.uri;
      }
      if (targetResource) {
        vscode.debug.startDebugging(undefined, {
            type: 'dockerfile',
            name: 'Dockerfile: Build',
            request: 'launch',
            dockerfile: targetResource.fsPath,
            contextPath: '${workspaceFolder}'
        });
      }
    }),
    vscode.commands.registerCommand('extension.vscode-buildx-debugger.getDockerfilePath', config => {
      return vscode.window.showInputBox({
          placeHolder: "Please enter the name of a Dockerfile file in the workspace folder",
          value: "Dockerfile"
      });
    }),
    vscode.debug.registerDebugAdapterDescriptorFactory('dockerfile', new DebugAdapterExecutableFactory()),
  );
}

export function deactivate() {}

class DebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {
	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): ProviderResult<vscode.DebugAdapterDescriptor> {
    var args = ["buildx", "dap", "build"];
    if (session.configuration?.args) {
      args = args.concat(session.configuration?.args);
    }
    const options = {
      env: { "BUILDX_EXPERIMENTAL": "1" },
      cwd: session.workspaceFolder?.uri.path,
    };
    return new vscode.DebugAdapterExecutable("docker", args, options);
	}
}

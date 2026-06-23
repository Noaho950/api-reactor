import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// ---------- TREE VIEW PROVIDER ----------

class EndpointItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly method: string,
        public readonly path: string,
        public readonly body: string | null,
        public readonly headers: string | null,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        super(label, collapsibleState);
        this.tooltip = `${method} ${path}`;
        this.contextValue = 'endpoint';
        this.iconPath = new vscode.ThemeIcon('play');
    }
}

class CategoryItem extends vscode.TreeItem {
    public children: EndpointItem[] = [];
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.iconPath = new vscode.ThemeIcon('folder');
    }
}

class ApiReactorProvider implements vscode.TreeDataProvider<CategoryItem | EndpointItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CategoryItem | EndpointItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    private categories: CategoryItem[] = [];
    private baseUrl: string = '';

    refresh(): void {
        this._loadDefinitions().then(() => {
            this._onDidChangeTreeData.fire();
        });
    }

    private async _loadDefinitions() {
        this.categories = [];
        const config = vscode.workspace.getConfiguration('apiReactor');
        this.baseUrl = config.get<string>('baseUrl') || 'http://localhost:3000/api';
        const url = config.get<string>('definitionsUrl');
        if (!url) return;

        try {
            let data: any;
            if (url.startsWith('file:///')) {
                const filePath = url.replace('file:///', '');
                const content = fs.readFileSync(filePath, 'utf8');
                data = JSON.parse(content);
            } else {
                const response = await fetch(url);
                data = await response.json();
            }

            if (!Array.isArray(data)) return;

            for (const item of data) {
                const categoryName = item.category || 'Uncategorized';
                const category = new CategoryItem(categoryName, vscode.TreeItemCollapsibleState.Collapsed);
                const endpoints = item.endpoints || [];
                for (const ep of endpoints) {
                    const method = ep.method || 'GET';
                    const path = ep.path || '';
                    const label = `${method} ${path}`;
                    const endpoint = new EndpointItem(
                        label,
                        ep.description || '',
                        method,
                        path,
                        ep.body || null,
                        ep.headers || null
                    );
                    category.children.push(endpoint);
                }
                this.categories.push(category);
            }
        } catch (err) {
            // ignore
        }
    }

    getTreeItem(element: CategoryItem | EndpointItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CategoryItem | EndpointItem): Thenable<(CategoryItem | EndpointItem)[]> {
        if (!element) {
            return Promise.resolve(this.categories);
        }
        if (element instanceof CategoryItem) {
            return Promise.resolve(element.children);
        }
        return Promise.resolve([]);
    }

    async previewEndpoint(item: EndpointItem) {
        const doc = await vscode.workspace.openTextDocument({
            content: `Method: ${item.method}\nURL: ${this.baseUrl}${item.path}\nHeaders: ${item.headers || 'None'}\nBody: ${item.body || 'None'}`,
            language: 'plaintext'
        });
        await vscode.window.showTextDocument(doc);
    }

    async runEndpoint(item: EndpointItem) {
        const url = `${this.baseUrl}${item.path}`;
        let curlCmd = `curl -X ${item.method}`;

        if (item.headers) {
            try {
                const headers = JSON.parse(item.headers);
                for (const [key, value] of Object.entries(headers)) {
                    curlCmd += ` -H "${key}: ${value}"`;
                }
            } catch (err) {
                curlCmd += ` -H "${item.headers}"`;
            }
        }

        if (item.body) {
            curlCmd += ` -d '${item.body}'`;
        }

        curlCmd += ` "${url}"`;

        const choice = await vscode.window.showInformationMessage(
            `Send request to ${url}?\n${curlCmd}`,
            { modal: true },
            'Send'
        );
        if (choice !== 'Send') return;

        const terminal = vscode.window.createTerminal('API Reactor');
        terminal.show();
        terminal.sendText(curlCmd);
    }
}

// ---------- ACTIVATION ----------

export async function activate(context: vscode.ExtensionContext) {
    const provider = new ApiReactorProvider();
    await provider.refresh();
    vscode.window.registerTreeDataProvider('apiReactorView', provider);

    const refreshCmd = vscode.commands.registerCommand('api-reactor.refresh', () => provider.refresh());
    context.subscriptions.push(refreshCmd);

    const previewCmd = vscode.commands.registerCommand('api-reactor.preview', (node: EndpointItem) => provider.previewEndpoint(node));
    context.subscriptions.push(previewCmd);

    const runCmd = vscode.commands.registerCommand('api-reactor.run', (node: EndpointItem) => provider.runEndpoint(node));
    context.subscriptions.push(runCmd);

    const config = vscode.workspace.getConfiguration('apiReactor');
    if (config.get<boolean>('autoFetch', false)) {
        provider.refresh();
    }
}

export function deactivate() {}

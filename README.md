# API Testing Suite

**API Testing Suite** is a VS Code extension that allows you to load API endpoint definitions from any URL (local file, local server, or remote) and test them directly from the VS Code sidebar.

---

## ✨ Features

* Load API definitions from any URL:

  * `http://`
  * `https://`
  * `file:///`
* Browse API endpoints in a dedicated sidebar
* Group endpoints by category
* Preview request details before execution
* Execute requests directly from VS Code using `curl`
* Refresh endpoint definitions on demand
* Optional auto-fetch on VS Code startup
* Configurable base URL and definitions URL

---

## 📦 Installation

### Install from VSIX

1. Download the `.vsix` file.
2. Open **Visual Studio Code**.
3. Navigate to **Extensions** (`Ctrl + Shift + X`).
4. Click the **⋯** menu.
5. Select **Install from VSIX...**
6. Choose the downloaded `.vsix` file.

### Install via Command Line

```bash
code --install-extension api-testing-suite-0.0.1.vsix
```

---

## ⚙️ Configuration

Open **Settings** (`Ctrl + ,`) and search for **apiTesting**.

| Setting                     | Type    | Default                                | Description                                                                             |
| --------------------------- | ------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `apiTesting.baseUrl`        | string  | `http://localhost:3000/api`            | Base URL used for all API requests                                                      |
| `apiTesting.definitionsUrl` | string  | `http://localhost:3000/api-tests.json` | URL containing API endpoint definitions. Supports `http://`, `https://`, and `file:///` |
| `apiTesting.autoFetch`      | boolean | `false`                                | Automatically fetch API definitions when VS Code starts                                 |

### Example Configuration

```json
{
  "apiTesting.baseUrl": "https://api.example.com/v1",
  "apiTesting.definitionsUrl": "https://api.example.com/api-tests.json",
  "apiTesting.autoFetch": true
}
```

---

## 📄 API Definitions Format

The `definitionsUrl` must return a JSON array in the following format:

```json
[
  {
    "category": "Users",
    "endpoints": [
      {
        "label": "Get All Users",
        "method": "GET",
        "path": "/users",
        "description": "Fetches all users from the system"
      },
      {
        "label": "Create User",
        "method": "POST",
        "path": "/users",
        "body": "{\"name\":\"John\",\"email\":\"john@test.com\"}",
        "headers": "{\"Content-Type\":\"application/json\"}",
        "description": "Creates a new user"
      }
    ]
  },
  {
    "category": "Auth",
    "endpoints": [
      {
        "label": "Login",
        "method": "POST",
        "path": "/auth/login",
        "body": "{\"username\":\"admin\",\"password\":\"secret\"}",
        "headers": "{\"Content-Type\":\"application/json\"}",
        "description": "Authenticates a user and returns a token"
      }
    ]
  }
]
```

---

## 📋 Endpoint Properties

| Property      | Type   | Required | Description                                        |
| ------------- | ------ | -------- | -------------------------------------------------- |
| `label`       | string | ✅        | Display name shown in the sidebar                  |
| `method`      | string | ✅        | HTTP method (`GET`, `POST`, `PUT`, `DELETE`, etc.) |
| `path`        | string | ✅        | API path appended to `baseUrl`                     |
| `description` | string | ❌        | Tooltip text shown on hover                        |
| `body`        | string | ❌        | Request body for methods such as `POST` and `PUT`  |
| `headers`     | string | ❌        | Request headers in JSON format                     |

---

## 🚀 Usage

### 1. Configure the Extension

Set the following values in VS Code settings:

* `apiTesting.baseUrl`
* `apiTesting.definitionsUrl`

### 2. Open the API Testing Sidebar

Click the **🧪 API Testing Suite** icon in the VS Code Activity Bar.

### 3. Load API Definitions

Click the **🔄 Refresh** button to fetch endpoint definitions.

### 4. Preview an Endpoint

Hover over an endpoint and click the **👁️ Preview** icon to view:

* HTTP Method
* Full URL
* Headers
* Request Body

### 5. Execute an Endpoint

Hover over an endpoint and click the **▶️ Run** icon.

After confirmation, the extension executes the request in a VS Code terminal using:

```bash
curl
```

The response is displayed directly in the terminal.

---

## 🛠️ Building from Source

Clone the repository and build the extension locally.

```bash
git clone https://github.com/Noaho950/api-testing-suite.git
cd api-testing-suite

npm install
npm run compile

vsce package
```

A `.vsix` package will be generated in the project root.

---

## 📁 Project Structure

```text
api-testing-suite/
├── src/
├── media/
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Noaho950**

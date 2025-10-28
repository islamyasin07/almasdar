module.exports = {
root: true,
parser: "@typescript-eslint/parser",
plugins: ["@typescript-eslint"],
extends: [
"eslint:recommended",
"plugin:@typescript-eslint/recommended",
"plugin:@typescript-eslint/recommended-requiring-type-checking",
"prettier"
],
parserOptions: {
project: ["./tsconfig.json"],
ecmaVersion: "latest",
sourceType: "module"
},
env: { node: true, jest: true },
rules: {}
};
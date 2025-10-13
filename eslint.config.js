module.exports = [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        URLSearchParams: "readonly",
        global: "readonly",
        // Node.js globals
        require: "readonly",
        process: "readonly",
        module: "writable",
        __dirname: "readonly",
        // Electron globals
        electron: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: false
        }
      }
    },
    rules: {
      // Errors and best practices
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off", // Allow console in Electron app
      "semi": ["error", "always"],
      "max-len": ["error", { "code": 120 }],
      "indent": ["error", 2],
      "quotes": ["error", "double", { "allowTemplateLiterals": true }]
    }
  },
  {
    // Test-specific config
    files: ["**/__tests__/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly"
      }
    }
  }
];
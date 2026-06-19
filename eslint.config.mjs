import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // The new react-hooks (v6) rules are too aggressive for an SSR app that
      // hydrates client state from localStorage after mount (setState-in-effect
      // is the correct pattern there) and computes time-based values in memos
      // (Date.now() in useMemo). Both fire on legitimate code, so disable them.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
];

export default eslintConfig;

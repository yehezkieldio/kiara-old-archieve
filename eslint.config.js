import antfu from "@antfu/eslint-config";

export default antfu({
    type: "lib",
    stylistic: {
        indent: 4,
        quotes: "double",
        semi: true,
    },
    typescript: {
        overrides: {
            "ts/no-require-imports": "off",
            "node/prefer-global/process": "off",
            "no-console": "off",
            "antfu/no-top-level-await": "off",
        },
    },
});

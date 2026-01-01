// tsconfig.json
export const tsconfig = {
    compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        jsx: "react-jsx",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        allowJs: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
    },
    include: ["src"],
};
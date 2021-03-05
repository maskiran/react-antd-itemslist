import babel from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle"

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/bundle.js',
    },
    plugins: [
        babel({
            babelHelpers: "bundled",
            exclude: 'node_modules/**',
            presets: [
                '@babel/react'
            ],
            plugins: [
                '@babel/plugin-proposal-class-properties'
            ]
        }),
        postcss(),
        excludeDependenciesFromBundle()
    ]
}
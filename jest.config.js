module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'cobertura'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    verbose: true,
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json'
        }
    }
};
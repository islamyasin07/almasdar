import type { Config } from 'jest';

// Use ts-jest ESM preset so imports with .js extensions in TS work under Jest
const config: Config = {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	roots: ['<rootDir>/src', '<rootDir>/tests'],
	moduleFileExtensions: ['ts', 'js'],
	extensionsToTreatAsEsm: ['.ts'],
			moduleNameMapper: {
				// Map only our source's ESM-style relative imports with .js extension to .ts during tests
				'^\./config/(.*)\.js$': '<rootDir>/src/config/$1.ts',
				'^\./routes/(.*)\.js$': '<rootDir>/src/routes/$1.ts',
				'^\./middleware/(.*)\.js$': '<rootDir>/src/middleware/$1.ts',
					'^\./utils/(.*)\.js$': '<rootDir>/src/utils/$1.ts',
					// Parent-relative imports from within subfolders
					'^\.\./config/(.*)\.js$': '<rootDir>/src/config/$1.ts',
					'^\.\./routes/(.*)\.js$': '<rootDir>/src/routes/$1.ts',
					'^\.\./middleware/(.*)\.js$': '<rootDir>/src/middleware/$1.ts',
					'^\.\./utils/(.*)\.js$': '<rootDir>/src/utils/$1.ts',
					'^\.\./services/(.*)\.js$': '<rootDir>/src/services/$1.ts',
					'^\.\./models/(.*)\.js$': '<rootDir>/src/models/$1.ts'
			},
	clearMocks: true,
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: '<rootDir>/tsconfig.json'
			}
		]
	}
};
export default config;
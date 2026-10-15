import antfu from '@antfu/eslint-config'

export default antfu(
  {
    markdown: false,
    rules: {
      'no-console': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration:not([const=true])',
          message: 'Use const enums instead',
        },
      ],
      'ts/ban-ts-comment': 'off',
      'unicorn/new-for-builtins': 'off',
    },
    gitignore: true,
  },
)

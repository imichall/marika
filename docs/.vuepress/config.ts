import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'cs-CZ',
  title: 'Marika - Changelog',
  description: 'Historie změn aplikace',
  base: '/changelog/',
  themeConfig: {
    navbar: [
      {
        text: 'Changelog',
        link: '/changelog/',
      },
    ],
    sidebar: {
      '/changelog/': [
        {
          text: 'Changelog',
          children: [
            '/changelog/README.md',
          ],
        },
      ],
    },
  },
})
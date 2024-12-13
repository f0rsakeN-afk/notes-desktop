/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        violet: {
          350: '#9f7aea' // Custom lavender
        },
        rose: {
          350: '#ff8a8a' // Custom coral
        },
        amber: {
          350: '#ffd03d' // Custom gold
        },
        emerald: {
          350: '#34d399' // Custom mint
        },
        sky: {
          350: '#38bdf8' // Custom azure
        },
        fuchsia: {
          350: '#f472b6' // Custom magenta
        },
        teal: {
          350: '#2dd4bf' // Custom turquoise
        },
        indigo: {
          350: '#818cf8' // Custom periwinkle
        },
        orange: {
          350: '#fb923c' // Custom peach
        },
        purple: {
          350: '#c084fc' // Custom orchid
        }
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.gray[300]'),
            '--tw-prose-headings': theme('colors.gray[100]'),
            '--tw-prose-lead': theme('colors.gray[300]'),
            '--tw-prose-links': theme('colors.indigo[400]'),
            '--tw-prose-bold': theme('colors.gray[100]'),
            '--tw-prose-counters': theme('colors.gray[400]'),
            '--tw-prose-bullets': theme('colors.gray[400]'),
            '--tw-prose-hr': theme('colors.gray[800]'),
            '--tw-prose-quotes': theme('colors.gray[100]'),
            '--tw-prose-quote-borders': theme('colors.gray[800]'),
            '--tw-prose-captions': theme('colors.gray[400]'),
            '--tw-prose-code': theme('colors.gray[100]'),
            '--tw-prose-pre-code': theme('colors.gray[300]'),
            '--tw-prose-pre-bg': theme('colors.gray[800]'),
            '--tw-prose-th-borders': theme('colors.gray[700]'),
            '--tw-prose-td-borders': theme('colors.gray[800]')
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography', 'tailwind-scrollbar')]
}

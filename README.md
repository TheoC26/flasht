This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Flasht

A flashcard learning application with AI-powered suggestions.

## Features

- Create and manage flashcard sets
- AI-powered suggestions for flashcard backs
- Interactive flashcard creation interface
- Collection organization system

## AI Suggestion Feature

The application now includes an AI-powered suggestion system that automatically generates back-side content for flashcards:

### How it works:

1. **Automatic Generation**: When you type in the front of a flashcard, the AI will automatically generate a suggestion for the back after a 1-second delay
2. **Smart Placeholders**: AI suggestions appear as placeholders in the back card field
3. **Auto-fill**: Press Enter or Tab on an empty back card to automatically fill it with the AI suggestion
4. **User Control**: Once you start typing in the back field, the AI suggestion is disregarded

### Setup:

1. Create a `.env.local` file in the root directory
2. Add your OpenAI API key: `NEXT_PUBLIC_OPENAI_KEY=your_api_key_here`
3. Restart the development server

### Usage:

- Type in the front of a flashcard
- Wait for the AI to generate a suggestion (indicated by "AI thinking..." message)
- The suggestion will appear as a placeholder in the back field
- Press Enter or Tab to auto-fill, or start typing to override the suggestion

## Development

```bash
npm install
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_OPENAI_KEY`: Your OpenAI API key for AI suggestions

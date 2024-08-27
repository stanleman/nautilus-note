This is a student productivity app with it's main feature being a Kanban board and also a Pomodoro timer. This project is coded using React, Next JS, Firebase, ShadCN UI, Sonner and hello-pangea-dnd (react-beautiful-dnd).

To get started:
```
git clone https://github.com/stanleman/nautilus-note.git
cd nautilus-note
npm install
```

To run the project, start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Setting up your .env for Firebase (all the relevant info can be gotten once you create your Firestore project):
```
NEXT_PUBLIC_API_KEY = # Your API Key
NEXT_PUBLIC_AUTH_DOMAIN = # Your auth domain
NEXT_PUBLIC_PROJECT_ID = # Your project ID
NEXT_PUBLIC_STORAGE_BUCKET = # Your storage bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID = # Your messaging sender ID
NEXT_PUBLIC_APP_ID = # Your app ID
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.


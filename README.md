# CamScreen: Easy Screen & Webcam Recorder

CamScreen is a modern, web-based application built with Next.js that allows users to easily record their screen and webcam simultaneously. It's designed for creating tutorials, demos, presentations, or any content that benefits from showing both screen activity and a personal video feed. Recordings are processed locally in the browser and can be downloaded directly as `.webm` files.



## Core Features

- **Start/Stop Controls**: Simple and intuitive buttons to start and stop screen sharing and recording.
- **Live Preview**: Displays a live preview of both the screen capture and the webcam feed in a Picture-in-Picture style.
- **Screen Capture**: Utilizes the `getDisplayMedia()` API to capture screen content, with error handling for permissions.
- **Webcam and Audio Capture**: Uses `getUserMedia()` to access webcam and microphone, with graceful permission handling.
- **Stream Combination**: Merges screen, webcam, and audio streams into a single `MediaStream` for unified recording.
- **Unified Recording**: Leverages the `MediaRecorder` API to record the combined stream and manages data availability.
- **Local Download**: Allows users to download the recorded video as a `.webm` file.
- **AI-Powered Filename Suggestion**: Users can provide a topic for their recording, and Genkit AI suggests a descriptive filename (e.g., `my-feature-demo-YYYYMMDD.webm`).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit (Firebase Genkit)](https://firebase.google.com/docs/genkit) for filename generation.
- **State Management**: React Hooks (`useState`, `useRef`, `useCallback`, `useEffect`)
- **Deployment (Assumed)**: Firebase App Hosting (based on `apphosting.yaml`)

## Getting Started (Local Development)

To get this project running locally:

1.  **Clone the repository (if applicable)**:

    ```bash
    git clone https://github.com/abhishek01dev/CamScreen.git
    cd camscreen-project-directory
    ```

2.  **Install dependencies**:
    Ensure you have Node.js and npm (or yarn/pnpm) installed.

    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

3.  **Environment Variables (for Genkit/AI Features)**:
    If you are using AI features that require API keys (like Google AI for Genkit), you might need to set up a `.env.local` file. Refer to Genkit and Google AI documentation for specifics. For the filename generation with the default `gemini-2.0-flash` model, ensure your environment is configured for Google AI.

4.  **Run the development server**:

    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```

    This will typically start the app on `http://localhost:9002` (as per `package.json` script).

5.  **For Genkit development (if modifying AI flows)**:
    In a separate terminal, you can run the Genkit development server:
    ```bash
    npm run genkit:dev
    # or for watching changes
    # npm run genkit:watch
    ```
    This allows you to inspect and test Genkit flows, typically via `http://localhost:4000`.

## Project Structure

- `src/app/`: Main Next.js application pages and layouts.
  - `page.tsx`: The main entry point and UI for the recorder.
  - `layout.tsx`: Root layout, including font setup and Toaster.
  - `globals.css`: Global styles and ShadCN theme variables.
- `src/components/`: Reusable React components.
  - `ui/`: ShadCN UI components.
  - `recorder-controls.tsx`: Component for start/stop/download buttons and filename input.
  - `video-previews.tsx`: Component for displaying screen and webcam video elements.
- `src/hooks/`: Custom React hooks.
  - `use-media-recorder.ts`: Core logic for screen recording, stream management, and AI filename generation.
  - `use-toast.ts`: Custom toast notification hook.
- `src/ai/`: Genkit AI related files.
  - `genkit.ts`: Genkit initialization and configuration.
  - `flows/filenameGenerator.ts`: Genkit flow for generating filenames.
- `public/`: Static assets (if any).
- `next.config.ts`: Next.js configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `components.json`: ShadCN UI configuration.

## Browser Compatibility & Requirements

- Screen recording APIs (`getDisplayMedia`) require a secure context (HTTPS or localhost).
- Users will need to grant permissions for screen, camera, and microphone access.
- Modern browsers (Chrome, Firefox, Edge, Safari latest versions) are recommended for best compatibility with WebRTC APIs.

This README should provide a good overview of CamScreen!

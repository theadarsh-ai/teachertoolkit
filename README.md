# Edu-Platform

Edu-Platform is a comprehensive educational platform designed to provide a rich learning experience with various tools and features. This platform integrates AI-powered agents to assist in content generation, assessment, and providing a gamified learning environment.

![demo_flow](https://github.com/user-attachments/assets/187dde9b-9d24-43a0-bcc3-363f812469eb)


## Features

- **AI-Powered Agents:** Utilizes AI for various tasks like content generation, lesson planning, and assessments.
- **Differentiated Learning:** Provides materials tailored to different learning needs.
- **Gamified Teaching:** Incorporates game-like elements to make learning more engaging.
- **AR Integration:** Supports Augmented Reality for an immersive learning experience.
- **Real-time Analytics:** Offers insights into student performance and classroom engagement.
- **Content Generation:** Automatically generates educational content, including quizzes and lesson plans.
- **Video Generation:** Capable of generating video content for lessons.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/theadarsh-ai/Edu-Platform.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

### Running the application

- To run the development server:
  ```sh
  npm run dev
  ```
- To build the application for production:
  ```sh
  npm run build
  ```
- To start the production server:
  ```sh
  npm run start
  ```

## Scripts

- `dev`: Starts the development server with hot-reloading.
- `build`: Builds the application for production.
- `start`: Starts the production server.
- `check`: Runs the TypeScript compiler to check for errors.
- `db:push`: Pushes database changes using Drizzle ORM.

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** Neon, Drizzle ORM
- **AI:** Google Vertex AI, OpenAI
- **Deployment:** Firebase

## Project Structure

```
.
├── client/         # Frontend React application
├── functions/      # Firebase functions
├── server/         # Backend Express server
├── public/         # Public assets
├── scripts/        # Additional scripts
├── python_agents/  # Python scripts for AI agents
└── ...
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Adarsh** - [theadarsh-ai](https://github.com/theadarsh-ai)

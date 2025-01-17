# Fantasy RPG Adventure

A text-based RPG game where you embark on epic quests and adventures. Built with React, TypeScript, and Three.js. Features real-time character animations with item tracking and dynamic storytelling powered by AI.

![Game Screenshot](https://github.com/user-attachments/assets/867e9c32-11f5-4078-887c-224f19a2a560)

## Features

- 🎮 Real-time character animations with dynamic item tracking
- 🎲 3D dice rolling system with Three.js
- 🎨 AI-generated character portraits and item images
- 🎭 Rich narrative interactions with LLM-powered responses
- 📊 Detailed character stats and inventory system
- 🗡️ Dynamic combat and skill checks
- 🎯 Skill-based progression system
- 🎲 D20-based action resolution

## Core Game Mechanics

### Character Creation
- Generate unique character paths using the slot machine
- Customize your character's name
- Receive AI-generated character portraits
- Get assigned random starting stats and equipment

### Stats System
- **Health**: Physical wellbeing
- **Energy**: Required for actions
- **Damage**: Offensive capabilities
- **Defense**: Protective capabilities
- **Core Stats**:
  - Strength: Physical power
  - Dexterity: Precision and skill
  - Endurance: Stamina and resilience
  - Agility: Speed and reflexes
  - Wisdom: Decision making
  - Charisma: Social interactions

### Dice Rolling System
- 1-5: Critical failure
- 6-10: Failure
- 11-15: Partial success
- 16-19: Success
- 20: Critical success

### Animation System
- Real-time character animations
- Dynamic item tracking for both hands
- Smooth transitions between animations
- Visual feedback for actions

## Tech Stack

- React 18
- TypeScript
- Three.js
- Tailwind CSS
- Vite
- Lucide Icons
- Cloudflare Workers (for API)

## Getting Started

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/fantasy-rpg.git
cd fantasy-rpg
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

### Project Structure
\`\`\`
src/
├── components/      # React components
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── data/          # Game data and configurations
└── utils/         # Utility functions
\`\`\`

### Key Components

- \`GameUI\`: Main game interface
- \`AnimationOverlay\`: Handles character animations and item tracking
- \`Dice\`: 3D dice rolling system
- \`SlotMachine\`: Character path generation
- \`Onboarding\`: Character creation flow

### Building

To create a production build:

\`\`\`bash
npm run build
\`\`\`

The build output will be in the \`dist/\` directory.

### Deployment

The game is deployed on Netlify. To deploy your own instance:

1. Fork this repository
2. Connect your fork to Netlify
3. Configure the build settings:
   - Build command: \`npm run build\`
   - Publish directory: \`dist\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- 3D rendering powered by [Three.js](https://threejs.org/)
- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animations powered by [gifuct-js](https://github.com/matt-way/gifuct-js)
- Deployed on [Netlify](https://www.netlify.com/)
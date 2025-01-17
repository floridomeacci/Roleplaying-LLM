# Fantasy RPG Adventure

A text-based RPG game with AI-powered storytelling and real-time character animations. Built with React, TypeScript, and Three.js. The game features dynamic story generation based on random word combinations, OpenPose-based character animations with item tracking, and fully AI-controlled game mechanics.

![Game Screenshot](https://github.com/user-attachments/assets/867e9c32-11f5-4078-887c-224f19a2a560)

## Current Development Status

The game is actively being developed with the following features currently working:

- ✨ **Random Story Generation**: Creates unique narratives using random word combinations
- 🎮 **OpenPose Animations**: Character animations with real-time item tracking
- 🎨 **AI Image Generation**: Generates character portraits and story-based scene images
- 📊 **Dynamic Stats System**: LLM-controlled stats and inventory management
- ⚔️ **Level Progression**: Gain experience, level up, and improve stats
- 🎲 **D20 Dice System**: Roll-based action resolution
- 🎯 **Mission System**: AI-generated quests and objectives (in progress)

Coming Soon:
- 🎥 AI Video Generation integration with OpenPose animations
- 🖼️ Enhanced story-based image generation
- 🎭 More complex mission and quest systems

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
- OpenPose-based character rigging
- Support for various actions and states
- Real-time item visualization

## Tech Stack

- React 18
- TypeScript
- Three.js
- Tailwind CSS
- Vite
- Cloudflare Workers
  - Animation API for OpenPose animations
  - Item API for inventory visualization
  - Image generation for characters and scenes
  - LLM integration for story generation

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

- \`GameUI\`: Main game interface with chat and character status
- \`AnimationOverlay\`: OpenPose animation system with item tracking
- \`Dice\`: 3D dice rolling system with Three.js
- \`SlotMachine\`: Random word combination generator for story paths
- \`Onboarding\`: Character creation with AI portrait generation

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

# Corporate RPG

A text-based RPG game where you navigate the treacherous waters of corporate life. Built with React, TypeScript, and Three.js.

![Game Screenshot](https://github.com/stackblitz/corporate-rpg/raw/main/screenshot.png)

## Features

- 🎲 Real-time 3D dice rolling with Three.js
- 🎮 Dynamic character creation with unique paths
- 📊 Detailed character stats and inventory system
- 💼 Corporate-themed missions and challenges
- 🎨 AI-generated character portraits
- 🎯 Skill-based progression system
- 🎭 Rich narrative interactions

## How It Works

### LLM Integration
The game uses a Language Learning Model (LLM) to control:

1. Character Generation
   - Creates unique backstories from slot machine words
   - Generates appropriate starting equipment
   - Assigns initial missions based on character path

2. Story Progression
   - Interprets player actions using special tags
   - Controls inventory through [ADD_INV] and [REMOVE_INV] tags
   - Manages stats with [STATS] tags
   - Awards experience with [EXP] tags
   - Updates coins using [COINS] tags
   - Suggests next moves with [MOVES] tags

3. Dynamic Responses
   - Considers character stats for outcomes
   - Uses dice rolls for action resolution
   - Maintains game state and context
   - Provides contextual suggestions

### Cloudflare Workers Setup

The project requires a Cloudflare Worker to handle API requests. Here's how to set it up:

1. Create a Cloudflare Worker:
   ```bash
   npm create cloudflare@latest
   ```

2. Configure Environment Variables:
   - Go to your Worker's settings in Cloudflare Dashboard
   - Add `REPLICATE_API_TOKEN` for image generation

3. Deploy the Worker:
   ```bash
   npx wrangler deploy
   ```

4. Update the fetch URLs in your code to point to your Worker's URL

The Worker handles:
- LLM API requests for game responses
- Image generation for character portraits
- CORS and request forwarding
- API key management

## Tech Stack

- React 18
- TypeScript
- Three.js
- Tailwind CSS
- Vite
- Lucide Icons
- Cloudflare Workers
- Replicate API (for image generation)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/corporate-rpg.git
cd corporate-rpg
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Set up your Cloudflare Worker (see Cloudflare Workers Setup section)

5. Update the API endpoints in your code to point to your Worker

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Game Mechanics

### Character Creation
- Generate unique character paths using the slot machine
- Customize your character's name
- Receive AI-generated character portraits
- Get assigned random starting stats and equipment

### Core Stats
- Health: Your physical and mental wellbeing
- Energy: Required for actions
- Damage: Your offensive capabilities
- Defense: Your protective capabilities
- Strength: Physical power
- Dexterity: Precision and skill
- Endurance: Stamina and resilience
- Agility: Speed and reflexes
- Luck: Random event outcomes
- Charisma: Social interactions

### Gameplay
- Roll dice to determine action outcomes
- Manage inventory and equipment
- Level up and distribute skill points
- Complete missions and challenges
- Navigate office politics
- Make strategic decisions

### Dice Rolling System
- 1-5: Critical failure
- 6-10: Failure
- 11-15: Partial success
- 16-19: Success
- 20: Critical success

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- 3D rendering powered by [Three.js](https://threejs.org/)
- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Image generation by [Replicate](https://replicate.com/)
- Powered by Cloudflare Workers
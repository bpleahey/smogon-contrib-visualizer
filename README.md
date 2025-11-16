# Smogon Contribution Scraper and Visualizer

> Fetch and parse your Smogon contribution history programmatically

A TypeScript/Node.js tool to scrape your Smogon competitive Pokémon contribution data from the Smogon CMS and export it as clean JSON. Perfect for displaying your contributions on personal websites and portfolios!

## Installation

### As a package (recommended once published, coming soon!)

```bash
npm install smogon-contribution-scraper
```

### For development

```bash
git clone https://github.com/bpleahey/smogon-contrib-visualizer.git
cd smogon-contrib-visualizer
npm install
npm run build
```

## 🚀 Quick Start

### CLI Usage

```bash
# Set environment variables
export SMOGON_SESSION="your_session_cookie"
export USER_ID="641532" # Your Smogon user ID

# Run the scraper
npm run scrape

# Or with custom variables
tsx src/cli.ts --user 641532 --session "your_session_cookie" --output your_output_file.json
```

### Programmatic Usage

```javascript
const { SmogonScraper } = require("smogon-contribution-scraper");

async function main() {
  const scraper = new SmogonScraper(process.env.SMOGON_SESSION);
  const data = await scraper.fetchContributions("641532");

  console.log(`${data.username} has ${data.totalContributions} contributions!`);
  console.log(`Written: ${data.stats.written}`);
  console.log(`Quality Checked: ${data.stats.qualityChecked}`);
}

main();
```

## Getting Your Session Cookie

1. Log in to [Smogon Forums](https://www.smogon.com/forums/)
2. Open Developer Tools (F12) / Inspect Element
3. Go to Application → Cookies → `smogon.com`
4. Copy the value of `xf_session`
5. Use it in your `.env` file or as a command line argument

```bash
# .env
SMOGON_SESSION=your_session_cookie_here
USER_ID=641532
```

## Output Format

The scraper outputs a JSON file with the following structure:

```json
{
  "userId": "641532",
  "username": "bleahey",
  "fetchedAt": "2024-01-15T10:30:00.000Z",
  "totalContributions": 16,
  "contributions": [
    {
      "id": "sv/Chinchou_sv/LC_0_0",
      "creditType": "Written by",
      "pokemon": "Chinchou",
      "format": "LC",
      "generation": "sv",
      "language": "en",
      "url": "https://www.smogon.com/dex/sv/pokemon/chinchou",
      "setNumber": 0
    }
  ],
  "stats": {
    "written": 5,
    "qualityChecked": 11,
    "byFormat": {
      "LC": 14,
      "PU": 2
    },
    "byGeneration": {
      "sv": 16
    }
  }
}
```

## Demo Visualizer

A sample HTML page is included to visualize your contributions:

1. Generate your data:

   ```bash
   npm run scrape
   ```

2. Open `examples/demo.html` in a browser and load your generated JSON file

**[Try the live demo →](examples/demo.html)**

OR

```
bash
npm run demo

#or
npm run demo:server
Then open `http://localhost:3000` in your browser.

```

## GitHub Actions Integration

# TODO

See [examples/github-actions/](examples/github-actions/) for the complete setup.

## API Reference

### `SmogonScraper`

```typescript
class SmogonScraper {
  constructor(sessionCookie: string);
  constructor(options: ScraperOptions);

  async fetchContributions(userId: string | number): Promise<ContributionData>;
}
```

### Types

```typescript
interface ContributionData {
  userId: string;
  username: string;
  fetchedAt: string;
  totalContributions: number;
  contributions: Contribution[];
  stats: ContributionStats;
}

interface Contribution {
  id: string;
  creditType: string;
  pokemon: string;
  format: string;
  generation: string;
  language: string;
  url: string;
  setNumber: number;
}

interface ContributionStats {
  written: number;
  qualityChecked: number;
  byFormat: Record<string, number>;
  byGeneration: Record<string, number>;
}
```

## Website Integration Examples

### Static Site (Recommended)

Generate data periodically and commit to your repo:

# TODO from my own website!

Then in your website:

```javascript
fetch("/data/contributions.json")
  .then((res) => res.json())
  .then((data) => displayContributions(data));
```

### React Component (add in my own website!)

```jsx
function SmogonContributions() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/contributions.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h2>{data?.username}'s Contributions</h2>
      <p>Total: {data?.totalContributions}</p>
      {/* Render contributions */}
    </div>
  );
}
```

### Next.js

```typescript
// app/contributions/page.tsx
export default async function ContributionsPage() {
  const data = await fetch("https://yoursite.com/data/contributions.json").then(
    (res) => res.json()
  );

  return <ContributionsDisplay data={data} />;
}
```

## CLI Options

```
smogon-scraper [options]

Options:
  --user, -u <ID>        Smogon user ID (required)
  --session, -s <COOKIE> Session cookie (or use SMOGON_SESSION env var)
  --output, -o <FILE>    Output file path (default: contributions.json)
  --help, -h             Show help message
```

## Project Structure

```
smogon-contribution-scraper/
├── src/
│   ├── index.ts       # Main scraper API
│   ├── cli.ts         # CLI tool
│   ├── parser.ts      # HTML parsing logic
│   └── types.ts       # TypeScript definitions
├── examples/
│   ├── basic.js       # Simple usage example
│   ├── demo.html      # Interactive visualizer
│   └── github-actions/
│       └── workflow.yml
├── dist/              # Compiled JavaScript (after build)
├── package.json
└── README.md
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT © [Brendan Leahey]

## Acknowledgments

- [Smogon](https://www.smogon.com/) for hosting a thriving competitive Pokémon community
- All Smogon developers and contributors who make competitive Pokémon accessible and fun!

## Disclaimer

This tool is unofficial and not affiliated with Smogon. Use responsibly and respect Smogon's servers by not making excessive API requests.

import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

const db = admin.firestore();

const mvpGames = [
    {
        gameId: "rooftop-solar-builder",
        type: "dragdrop",
        config: {
            mode: "sorting",
            items: [
                { id: "panel-1", name: "Monocrystalline Panel", category: "high-efficiency", points: 10 },
                { id: "panel-2", name: "Polycrystalline Panel", category: "standard", points: 8 }
            ],
            targets: [
                { id: "roof-flat", name: "Flat Roof", category: "high-efficiency", maxItems: 4 },
                { id: "roof-slanted", name: "Slanted Roof", category: "standard", maxItems: 6 }
            ],
            correctMapping: { "panel-1": "roof-flat", "panel-2": "roof-slanted" }
        },
        coins: 15
    },
    {
        gameId: "eco-quiz",
        type: "quiz",
        config: {
            questions: [
                {
                    id: "q1",
                    text: "What percentage of sunlight do solar panels convert to electricity?",
                    options: [
                        { id: "a", text: "15-20%" },
                        { id: "b", text: "30-35%" },
                        { id: "c", text: "50-60%" },
                        { id: "d", text: "80-90%" }
                    ],
                    correctAnswer: "a",
                    points: 5
                }
            ],
            timeLimit: 30,
            passingScore: 70
        },
        coins: 10
    },
    {
        gameId: "waste-sorter",
        type: "dragdrop",
        config: {
            mode: "categorization",
            items: [
                { id: "plastic-bottle", name: "Plastic Bottle", category: "recycling", points: 5 },
                { id: "banana-peel", name: "Banana Peel", category: "compost", points: 3 },
                { id: "glass-jar", name: "Glass Jar", category: "recycling", points: 5 },
                { id: "paper-bag", name: "Paper Bag", category: "recycling", points: 3 }
            ],
            targets: [
                { id: "recycling-bin", name: "Recycling Bin", category: "recycling", maxItems: 10 },
                { id: "compost-bin", name: "Compost Bin", category: "compost", maxItems: 10 },
                { id: "landfill-bin", name: "Landfill Bin", category: "landfill", maxItems: 10 }
            ]
        },
        coins: 12
    },
    {
        gameId: "energy-puzzle",
        type: "puzzle",
        config: {
            gridSize: 4,
            pieces: [
                { id: "solar", image: "solar.png", connections: ["wind", "battery"] },
                { id: "wind", image: "wind.png", connections: ["solar", "grid"] },
                { id: "battery", image: "battery.png", connections: ["solar", "home"] },
                { id: "grid", image: "grid.png", connections: ["wind", "home"] },
                { id: "home", image: "home.png", connections: ["battery", "grid"] }
            ],
            timeLimit: 120
        },
        coins: 20
    },
    {
        gameId: "carbon-memory",
        type: "memory",
        config: {
            pairs: [
                { id: "solar", image: "solar.png", matchId: "solar-fact", matchImage: "solar-fact.png" },
                { id: "wind", image: "wind.png", matchId: "wind-fact", matchImage: "wind-fact.png" },
                { id: "hydro", image: "hydro.png", matchId: "hydro-fact", matchImage: "hydro-fact.png" },
                { id: "geothermal", image: "geothermal.png", matchId: "geothermal-fact", matchImage: "geothermal-fact.png" }
            ],
            timeLimit: 120,
            difficulty: "medium"
        },
        coins: 15
    },
    {
        gameId: "eco-city-builder",
        type: "simulation",
        config: {
            initialResources: { money: 1000, energy: 100, happiness: 50 },
            buildings: [
                { id: "solar-farm", cost: 200, energyProduction: 50, happiness: 5, co2Reduction: 20 },
                { id: "wind-farm", cost: 150, energyProduction: 30, happiness: 3, co2Reduction: 15 },
                { id: "park", cost: 50, energyProduction: 0, happiness: 10, co2Reduction: 5 }
            ],
            winConditions: { energy: 300, happiness: 80, co2Reduction: 100 }
        },
        coins: 25
    },
    {
        gameId: "water-cycle",
        type: "simulation",
        config: {
            stages: ["evaporation", "condensation", "precipitation", "collection"],
            interactions: [
                { id: "heat-water", affects: "evaporation", value: 10 },
                { id: "cool-clouds", affects: "condensation", value: 10 },
                { id: "seed-clouds", affects: "precipitation", value: 15 },
                { id: "build-reservoir", affects: "collection", value: 20 }
            ],
            formulas: [
                { id: "evaporation-rate", expression: "temperature * 0.5 + sunlight * 0.3" },
                { id: "rainfall", expression: "cloudDensity * 0.7 + windSpeed * 0.2" }
            ]
        },
        coins: 18
    },
    {
        gameId: "climate-challenge",
        type: "quiz",
        config: {
            questions: [
                {
                    id: "cc1",
                    text: "Which of the following is NOT a greenhouse gas?",
                    options: [
                        { id: "a", text: "Carbon dioxide" },
                        { id: "b", text: "Methane" },
                        { id: "c", text: "Nitrogen" },
                        { id: "d", text: "Water vapor" }
                    ],
                    correctAnswer: "c",
                    points: 5
                },
                {
                    id: "cc2",
                    text: "What is the main cause of ocean acidification?",
                    options: [
                        { id: "a", text: "Plastic pollution" },
                        { id: "b", text: "Absorption of CO2" },
                        { id: "c", text: "Oil spills" },
                        { id: "d", text: "Overfishing" }
                    ],
                    correctAnswer: "b",
                    points: 5
                }
            ],
            timeLimit: 60,
            passingScore: 60
        },
        coins: 15
    }
];

async function seedGames() {
    try {
        for (const game of mvpGames) {
            await db.collection('games').doc(game.gameId).set(game);
            console.log(`Added game: ${game.gameId}`);
        }
        console.log('All games seeded successfully!');
    } catch (error) {
        console.error('Error seeding games:', error);
    } finally {
        process.exit(0);
    }
}

seedGames();
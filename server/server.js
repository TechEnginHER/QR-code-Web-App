const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Use environment variable for MongoDB URI
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

// CORS configuration
app.use(cors({
    origin: 'https://familyscavengerhunt.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Handle preflight requests
app.options('*', cors()); 
git 

// Define the Team schema and model
const teamSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    passcode: { type: String, required: true },
});

const Team = mongoose.model('Team', teamSchema);

// Define the Clue schema and model
const clueSchema = new mongoose.Schema({
    text: String,
    teamName: String,
});

const Clue = mongoose.model('Clue', clueSchema);



// Route to get team name by team ID
app.get('/teams/:name', async (req, res) => {
    const { name } = req.params;

    try {
        const team = await Team.findOne({ name });
        
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        res.json({ teamName: team.name });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to create a new team
app.post('/teams', async (req, res) => {
    const { name, passcode } = req.body;

    if (!name || !passcode) {
        return res.status(400).json({ message: 'Team name and passcode are required.' });
    }

    try {
        // Create a new team
        const newTeam = new Team({ name, passcode });
        await newTeam.save();
        res.status(201).json({ message: 'Team created successfully.' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Team name already exists.' });
        } else {
            res.status(500).json({ message: 'Server error. Please try again later.' });
        }
    }
});

// Route to login to an existing team
app.post('/teams/login', async (req, res) => {
    const { name, passcode } = req.body;

    if (!name || !passcode) {
        return res.status(400).json({ message: 'Team name and passcode are required.' });
    }

    try {
        // Find the team by name and passcode
        const team = await Team.findOne({ name, passcode });

        if (!team) {
            return res.status(400).json({ message: 'Invalid team name or passcode.' });
        }

        res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Route to save a new clue
app.post('/clues', async (req, res) => {
    const { text, teamName } = req.body;
    try {
        // Check if the clue already exists for the team
        const existingClue = await Clue.findOne({ text, teamName });
        if (existingClue) {
            return res.status(400).json({ message: 'Clue already saved' });
        }

        // Save the new clue
        const clue = new Clue({ text, teamName });
        await clue.save();
        res.status(201).json(clue);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all clues for a team
app.get('/clues/:teamName', async (req, res) => {
    const { teamName } = req.params;
    try {
        const clues = await Clue.find({ teamName });
        res.json(clues);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to delete a clue
app.delete('/clues/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Clue.findByIdAndDelete(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q5fov.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db('doctor-portal');
		const appointmentCollection = database.collection('appointments');
		const userCollection = database.collection('users');

		app.get('/appointments', async (req, res) => {
			const email = req.query.email;
			const date = req.query.date;
			const query = { email: email, date: date };
			console.log(query);
			const cursor = appointmentCollection.find(query);
			const appointments = await cursor.toArray();
			console.log(appointments);
			res.json(appointments);
		});

		app.post('/appointments', async (req, res) => {
			const appointment = req.body;

			const result = await appointmentCollection.insertOne(appointment);
			res.json(result);
		});
		app.post('/users', async (req, res) => {
			const user = req.body;
			console.log(user);
			const result = await userCollection.insertOne(user);
			res.json(result);
		});
		app.put('/users', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await userCollection.updateOne(
				filter,
				updateDoc,
				options,
			);
			res.json(result);
		});
	} finally {
		// await client.close()
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('doctor portal');
});
app.listen(port, () => {
	console.log('listening to port', port);
});

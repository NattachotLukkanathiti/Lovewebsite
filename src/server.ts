import express from 'express';
import cors from 'cors';
import { pool } from './database/db';


// 1. ตั้งค่าให้ DNS เลือกใช้ IPv4 ก่อนเสมอ (ป้องกัน IPv6 ENETUNREACH)
const app = express();
// เก็บ OTP ชั่วคราว (ในระบบจริงควรใช้ Redis หรือ Database)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://cardunknow.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Todo API Running');
});


app.get('/natarida', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM natarida ORDER BY id DESC'
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.post('/natarida', async (req, res) => {
  try {
    const { color_wear, resturant } = req.body;

    const result = await pool.query(
      `INSERT INTO natarida (color_wear, resturant)
       VALUES ($1, $2)
       RETURNING *`,
      [color_wear, resturant]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put('/natarida/:id', async (req, res) => {
  try {

    const { id } = req.params;
    const { resturant } = req.body;


    const result = await pool.query(
      `UPDATE natarida
       SET resturant = $1
       WHERE id = $2
       RETURNING *`,
      [
        resturant,
        id
      ]
    );


    res.json(result.rows[0]);


  } catch(error) {

    console.error(error);

    res.status(500).json({
      message:'Server Error'
    });

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
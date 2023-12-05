/* filename: complexCode.js
   This code demonstrates a complex implementation of a car rental system. It includes advanced features like user authentication, location-based search, booking management, and payment processing. */

// Importing necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Initialize the express app
const app = express();
app.use(bodyParser.json());

// Database connection
const db = require('db');

// User Registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const user = await db.getUserByEmail(email);
    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user registration details to the database
    const savedUser = await db.createUser(name, email, hashedPassword);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search for available cars based on location
app.get('/cars', async (req, res) => {
  try {
    const { location } = req.query;

    // Perform location-based search
    const cars = await axios.get(`http://car-service/api/cars?location=${location}`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization}`,
      },
    });

    res.status(200).json(cars.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Book a car
app.post('/book', async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    // Verify the token and extract the user ID
    const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

    // Check if the car is available for the specified dates
    const carAvailability = await axios.get(`http://car-service/api/cars/${carId}/availability`, {
      headers: {
        Authorization: `Bearer ${req.headers.authorization}`,
      },
    });

    if (!carAvailability.data.available) {
      return res.status(409).json({ message: 'Car not available for specified dates' });
    }

    // Make the booking and return the booking details
    const booking = await axios.post('http://booking-service/api/bookings', {
      userId,
      carId,
      startDate,
      endDate,
    });

    res.status(201).json(booking.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Process payment for a booking
app.post('/payments', async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    // Verify the token and extract the user ID
    const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

    // Get the booking details
    const booking = await axios.get(`http://booking-service/api/bookings/${bookingId}`);

    // Check if the booking exists and belongs to the authenticated user
    if (!booking.data || booking.data.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Process the payment
    const payment = await axios.post('http://payment-service/api/payments', {
      bookingId,
      amount,
    });

    res.status(201).json({ message: 'Payment successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Listening on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import { http, HttpResponse } from 'msw';

export const handlers = [
  // Razorpay API mocks
  http.post('https://api.razorpay.com/v1/orders', () => {
    return HttpResponse.json({
      id: 'order_test_123456789',
      entity: 'order',
      amount: 50000, // Amount in paise (₹500)
      amount_paid: 0,
      amount_due: 50000,
      currency: 'INR',
      receipt: 'receipt_test_123',
      status: 'created',
      attempts: 0,
      notes: {},
      created_at: Math.floor(Date.now() / 1000),
    });
  }),

  http.post('https://api.razorpay.com/v1/payments/:paymentId/capture', () => {
    return HttpResponse.json({
      id: 'pay_test_123456789',
      entity: 'payment',
      amount: 50000,
      currency: 'INR',
      status: 'captured',
      order_id: 'order_test_123456789',
      method: 'card',
      captured: true,
      created_at: Math.floor(Date.now() / 1000),
    });
  }),

  // Razorpay webhook verification mock
  http.post('/api/webhooks/razorpay', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      data: body,
    });
  }),

  // Firebase Cloud Functions mocks
  http.post('*/earnCoins', () => {
    return HttpResponse.json({
      success: true,
      coinsEarned: 10,
      newBalance: 150,
      auditLogId: 'audit_test_123',
    });
  }),

  http.post('*/processPaymentWebhook', () => {
    return HttpResponse.json({
      success: true,
      paymentProcessed: true,
      subscriptionActive: true,
      auditLogId: 'audit_payment_123',
    });
  }),

  http.post('*/redeemCoins', () => {
    return HttpResponse.json({
      success: true,
      coinsDeducted: 50,
      newBalance: 100,
      redemptionId: 'redemption_test_123',
      auditLogId: 'audit_redemption_123',
    });
  }),

  // Tracker API mocks
  http.get('/api/trackers/carbon', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          date: '2024-01-15',
          category: 'transportation',
          activity: 'Car commute',
          amount: 5.2,
          unit: 'kg CO2',
          description: 'Daily commute to office',
          createdAt: '2024-01-15T08:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  }),

  http.post('/api/trackers/carbon', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '2',
        date: '2024-01-16',
        category: 'energy',
        activity: 'Electricity usage',
        amount: 12.8,
        unit: 'kg CO2',
        description: 'Home electricity consumption',
        createdAt: '2024-01-16T20:00:00Z',
      },
      message: 'Carbon log entry created successfully',
    });
  }),

  http.get('/api/trackers/mood', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          date: '2024-01-15',
          mood: 'happy',
          energy: 8,
          stress: 3,
          sleep: 7.5,
          notes: 'Great day at work, feeling productive',
          activities: ['exercise', 'meditation'],
          createdAt: '2024-01-15T20:00:00Z',
        },
      ],
      stats: {
        averageEnergy: 8,
        averageStress: 3,
        averageSleep: 7.5,
        moodDistribution: { happy: 1 },
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  }),

  http.post('/api/trackers/mood', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '2',
        date: '2024-01-16',
        mood: 'neutral',
        energy: 6,
        stress: 5,
        sleep: 6,
        notes: 'Average day, some work stress',
        activities: ['reading'],
        createdAt: '2024-01-16T21:30:00Z',
      },
      message: 'Mood log entry created successfully',
    });
  }),

  http.get('/api/trackers/animal', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          date: '2024-01-15',
          species: 'Robin',
          scientificName: 'Turdus migratorius',
          location: 'Central Park, NYC',
          coordinates: { lat: 40.7829, lng: -73.9654 },
          count: 3,
          behavior: 'foraging',
          habitat: 'urban park',
          weather: 'sunny',
          temperature: 15,
          notes: 'Spotted near the pond area',
          photos: ['robin1.jpg'],
          createdAt: '2024-01-15T08:30:00Z',
        },
      ],
      stats: {
        totalSightings: 1,
        uniqueSpecies: 1,
        totalAnimals: 3,
        habitatDistribution: { 'urban park': 1 },
        speciesFrequency: { Robin: 3 },
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  }),

  http.post('/api/trackers/animal', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '2',
        date: '2024-01-16',
        species: 'Red Squirrel',
        scientificName: 'Sciurus vulgaris',
        location: 'Prospect Park, Brooklyn',
        coordinates: { lat: 40.6602, lng: -73.969 },
        count: 2,
        behavior: 'climbing',
        habitat: 'deciduous forest',
        weather: 'cloudy',
        temperature: 12,
        notes: 'Active in oak trees',
        photos: [],
        createdAt: '2024-01-16T14:15:00Z',
      },
      message: 'Animal sighting logged successfully',
    });
  }),

  http.get('/api/trackers/transport', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          date: '2024-01-15',
          mode: 'bicycle',
          distance: 8.5,
          duration: 25,
          route: 'Home to Office',
          startLocation: 'Brooklyn Heights',
          endLocation: 'Manhattan Financial District',
          cost: 0,
          carbonSaved: 2.1,
          calories: 180,
          weather: 'sunny',
          notes: 'Great bike ride across Brooklyn Bridge',
          createdAt: '2024-01-15T08:00:00Z',
        },
      ],
      stats: {
        totalTrips: 1,
        totalDistance: 8.5,
        totalDuration: 25,
        totalCost: 0,
        totalCarbonSaved: 2.1,
        totalCalories: 180,
        modeDistribution: { bicycle: 1 },
        averageDistance: 8.5,
        averageDuration: 25,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  }),

  http.post('/api/trackers/transport', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '2',
        date: '2024-01-16',
        mode: 'subway',
        distance: 12.3,
        duration: 35,
        route: 'L Train to Union Square',
        startLocation: 'Williamsburg',
        endLocation: 'Union Square',
        cost: 2.9,
        carbonSaved: 8.4,
        calories: 25,
        weather: 'rainy',
        notes: 'Avoided driving due to rain',
        createdAt: '2024-01-16T09:15:00Z',
      },
      message: 'Transport log entry created successfully',
    });
  }),

  // Maps API mock
  http.get('https://maps.googleapis.com/maps/api/geocode/json', () => {
    return HttpResponse.json({
      results: [
        {
          formatted_address: 'Central Park, New York, NY, USA',
          geometry: {
            location: {
              lat: 40.7829,
              lng: -73.9654,
            },
          },
          place_id: 'ChIJ4zGFAZpYwokRGUGph3Mf37k',
        },
      ],
      status: 'OK',
    });
  }),

  // PDF/CSV export mocks
  http.post('/api/export/csv', () => {
    return HttpResponse.json({
      success: true,
      downloadUrl: '/downloads/export_test_123.csv',
      filename: 'export_test_123.csv',
    });
  }),

  http.post('/api/export/pdf', () => {
    return HttpResponse.json({
      success: true,
      downloadUrl: '/downloads/report_test_123.pdf',
      filename: 'report_test_123.pdf',
    });
  }),

  // Error scenarios for testing
  http.get('/api/error/500', () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  http.get('/api/error/404', () => {
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
  }),

  http.get('/api/error/timeout', () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json({ error: 'Request timeout' }, { status: 408 }));
      }, 5000);
    });
  }),
];

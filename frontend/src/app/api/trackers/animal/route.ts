import { NextRequest, NextResponse } from 'next/server';

// Mock data for animal tracker
const mockAnimalData = [
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
  {
    id: '2',
    date: '2024-01-14',
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
    createdAt: '2024-01-14T14:15:00Z',
  },
  {
    id: '3',
    date: '2024-01-13',
    species: 'Monarch Butterfly',
    scientificName: 'Danaus plexippus',
    location: 'Brooklyn Botanic Garden',
    coordinates: { lat: 40.6689, lng: -73.9642 },
    count: 1,
    behavior: 'feeding',
    habitat: 'garden',
    weather: 'sunny',
    temperature: 18,
    notes: 'Feeding on milkweed flowers',
    photos: ['monarch1.jpg', 'monarch2.jpg'],
    createdAt: '2024-01-13T11:45:00Z',
  },
  {
    id: '4',
    date: '2024-01-12',
    species: 'House Sparrow',
    scientificName: 'Passer domesticus',
    location: 'Washington Square Park',
    coordinates: { lat: 40.7308, lng: -73.9973 },
    count: 8,
    behavior: 'flocking',
    habitat: 'urban',
    weather: 'partly cloudy',
    temperature: 14,
    notes: 'Large flock near fountain',
    photos: ['sparrows1.jpg'],
    createdAt: '2024-01-12T16:20:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const species = searchParams.get('species');
    const location = searchParams.get('location');
    const habitat = searchParams.get('habitat');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredData = mockAnimalData;

    if (species) {
      filteredData = filteredData.filter(
        item =>
          item.species.toLowerCase().includes(species.toLowerCase()) ||
          item.scientificName.toLowerCase().includes(species.toLowerCase())
      );
    }

    if (location) {
      filteredData = filteredData.filter(item =>
        item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (habitat) {
      filteredData = filteredData.filter(item => item.habitat === habitat);
    }

    if (startDate) {
      filteredData = filteredData.filter(item => item.date >= startDate);
    }

    if (endDate) {
      filteredData = filteredData.filter(item => item.date <= endDate);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Calculate statistics
    const stats = {
      totalSightings: filteredData.length,
      uniqueSpecies: [...new Set(filteredData.map(item => item.species))].length,
      totalAnimals: filteredData.reduce((sum, item) => sum + item.count, 0),
      habitatDistribution: filteredData.reduce(
        (acc, item) => {
          acc[item.habitat] = (acc[item.habitat] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      speciesFrequency: filteredData.reduce(
        (acc, item) => {
          acc[item.species] = (acc[item.species] || 0) + item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    return NextResponse.json({
      success: true,
      data: paginatedData,
      stats,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
      },
    });
  } catch (error) {
    console.error('Animal tracker API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch animal tracker data',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { species, location, count } = body;

    if (!species || !location || !count) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: species, location, count',
        },
        { status: 400 }
      );
    }

    // Validate count
    if (count < 1 || !Number.isInteger(count)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Count must be a positive integer',
        },
        { status: 400 }
      );
    }

    // Create new animal sighting entry
    const newEntry = {
      id: (mockAnimalData.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      species,
      scientificName: body.scientificName || '',
      location,
      coordinates: body.coordinates || null,
      count: parseInt(count),
      behavior: body.behavior || '',
      habitat: body.habitat || 'unknown',
      weather: body.weather || '',
      temperature: body.temperature || null,
      notes: body.notes || '',
      photos: body.photos || [],
      createdAt: new Date().toISOString(),
    };

    // In a real app, this would be saved to a database
    mockAnimalData.unshift(newEntry);

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: 'Animal sighting logged successfully',
    });
  } catch (error) {
    console.error('Animal tracker POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log animal sighting',
      },
      { status: 500 }
    );
  }
}

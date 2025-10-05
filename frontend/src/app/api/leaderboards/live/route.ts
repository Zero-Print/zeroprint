import { NextResponse } from 'next/server';

export async function GET() {
  // Mock leaderboard data
  const mockLeaderboardData = {
    topUsers: [
      { id: 'user1', name: 'John Doe', score: 1250, rank: 1, avatar: '/avatar1.png' },
      { id: 'user2', name: 'Jane Smith', score: 1120, rank: 2, avatar: '/avatar2.png' },
      { id: 'user3', name: 'Alex Johnson', score: 980, rank: 3, avatar: '/avatar3.png' },
      { id: 'user4', name: 'Maria Garcia', score: 875, rank: 4, avatar: '/avatar4.png' },
      { id: 'user5', name: 'Robert Chen', score: 820, rank: 5, avatar: '/avatar5.png' },
    ],
    userRank: {
      rank: 42,
      score: 450,
      percentile: 78
    },
    totalParticipants: 1250,
    lastUpdated: new Date().toISOString()
  };

  return NextResponse.json(mockLeaderboardData);
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
export { WalletCard } from '../citizen/WalletCard';

export function TrackerCard({ children, ...props }: any) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Environmental Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {children || <p>Tracker data will be displayed here</p>}
      </CardContent>
    </Card>
  );
}

export function GameCard({ children, ...props }: any) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Games</CardTitle>
      </CardHeader>
      <CardContent>
        {children || <p>Game information will be displayed here</p>}
      </CardContent>
    </Card>
  );
}

export function LeaderboardList({ children, ...props }: any) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {children || <p>Leaderboard will be displayed here</p>}
      </CardContent>
    </Card>
  );
}

export function QuickActions({ children, ...props }: any) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {children || <p>Quick actions will be displayed here</p>}
      </CardContent>
    </Card>
  );
}

export function ActivityFeed({ children, ...props }: any) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {children || <p>Activity feed will be displayed here</p>}
      </CardContent>
    </Card>
  );
}

export function GamesCarousel({ children, ...props }: any) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Games Carousel</CardTitle>
      </CardHeader>
      <CardContent>
        {children || <p>Games carousel will be displayed here</p>}
      </CardContent>
    </Card>
  );
}

export function DigitalTwinPreview({ children, ...props }: any) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Digital Twin Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {children || <p>Digital twin preview will be displayed here</p>}
      </CardContent>
    </Card>
  );
}

export function ExportButton({ children, ...props }: any) {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" {...props}>
      {children || 'Export'}
    </button>
  );
}

export function AccessibilityChecker({ children, ...props }: any) {
  return (
    <div className="p-4 bg-gray-50 rounded" {...props}>
      {children || <p>Accessibility checker placeholder</p>}
    </div>
  );
}
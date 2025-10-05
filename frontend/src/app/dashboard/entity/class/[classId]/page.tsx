'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Target, 
  Calendar,
  Download,
  RefreshCw,
  ArrowLeft,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  Trophy,
  Gamepad2,
  Heart,
  Leaf,
  Brain,
  Zap
} from 'lucide-react';
import { ZPCard, ZPButton, ZPBadge } from '@/components/ui';

interface Student {
  id: string;
  name: string;
  ecoScore: number;
  co2Saved: number;
  healCoins: number;
  rank: number;
  mentalHealthScore: number;
  kindnessScore: number;
  gamesPlayed: number;
  lastActive: Date;
  badges: string[];
}

interface ClassData {
  classId: string;
  name: string;
  teacher: string;
  subject: string;
  totalStudents: number;
  activeStudents: number;
  avgEcoScore: number;
  totalCO2Saved: number;
  totalHealCoins: number;
  kpis: {
    avgEcoScore: number;
    totalCO2Saved: number;
    avgMentalHealthScore: number;
    avgKindnessScore: number;
    participationRate: number;
    challengesCompleted: number;
    badgesEarned: number;
    gamesPlayed: number;
  };
  students: Student[];
  monthlyTrends: Array<{
    month: string;
    ecoScore: number;
    co2Saved: number;
    participation: number;
    healCoins: number;
  }>;
  trackerStats: {
    carbonLogs: number;
    mentalHealthLogs: number;
    animalWelfareLogs: number;
    digitalTwinSims: number;
  };
  gameStats: {
    totalGamesPlayed: number;
    avgScore: number;
    favoriteGame: string;
    timeSpent: string;
    topGames: Array<{ name: string; plays: number; avgScore: number }>;
  };
  upcomingChallenges: Array<{
    id: string;
    title: string;
    startDate: string;
    reward: number;
    participants: number;
    description: string;
  }>;
  recentActivities: Array<{
    action: string;
    student: string;
    points: number;
    date: Date;
    type: 'eco' | 'mental' | 'animal' | 'game' | 'challenge';
  }>;
  alerts: Array<{
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    resolved: boolean;
  }>;
}

export default function ClassDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  // State management
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'performance' | 'games' | 'challenges'>('overview');

  // Role-based access control
  if (!user) {
    redirect('/auth/login');
  }

  const userRole = (user as any)?.role;
  if (userRole !== 'school' && userRole !== 'msme' && userRole !== 'admin') {
    redirect('/dashboard');
  }

  // Data loading function
  const loadClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call - in real app this would fetch from Firestore/API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockClassData: ClassData = generateMockClassData(classId);
      setClassData(mockClassData);
    } catch (err) {
      setError('Failed to load class data');
      console.error('Error loading class data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExportClassData = async () => {
    try {
      // In real app, this would call export service
      console.log('Exporting class data for:', classId);
      
      // Mock CSV export
      const csvData = generateClassCSV(classData!);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `class-${classId}-report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadClassData();
  }, [classId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class data...</p>
        </div>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Class not found'}</p>
          <ZPButton onClick={loadClassData}>Try Again</ZPButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <ZPButton 
                variant="outline" 
                size="sm" 
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </ZPButton>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
                <p className="text-gray-600">
                  {classData.subject} • {classData.teacher} • {classData.totalStudents} students
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ZPButton 
                variant="outline" 
                onClick={loadClassData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </ZPButton>
              <ZPButton 
                onClick={handleExportClassData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </ZPButton>
              {userRole === 'admin' && (
                <ZPButton 
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  Issue Badge
                </ZPButton>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average EcoScore</p>
                <p className="text-2xl font-bold text-green-600">{classData.kpis.avgEcoScore}</p>
                <p className="text-xs text-green-600 mt-1">↗ +5.2% from last month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </ZPCard>

          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CO₂ Saved</p>
                <p className="text-2xl font-bold text-blue-600">{classData.kpis.totalCO2Saved} kg</p>
                <p className="text-xs text-blue-600 mt-1">↗ +8.1% from last month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </ZPCard>

          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mental Health Score</p>
                <p className="text-2xl font-bold text-purple-600">{classData.kpis.avgMentalHealthScore}</p>
                <p className="text-xs text-purple-600 mt-1">↗ +3.4% from last month</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </ZPCard>

          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kindness Score</p>
                <p className="text-2xl font-bold text-pink-600">{classData.kpis.avgKindnessScore}</p>
                <p className="text-xs text-pink-600 mt-1">↗ +6.7% from last month</p>
              </div>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </ZPCard>
        </div>

        {/* Additional KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Participation Rate</p>
                <p className="text-2xl font-bold text-orange-600">{classData.kpis.participationRate}%</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </ZPCard>

          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Challenges Completed</p>
                <p className="text-2xl font-bold text-indigo-600">{classData.kpis.challengesCompleted}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </ZPCard>

          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-yellow-600">{classData.kpis.badgesEarned}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </ZPCard>

          <ZPCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Games Played</p>
                <p className="text-2xl font-bold text-red-600">{classData.kpis.gamesPlayed}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </ZPCard>
        </div>

        {/* Alerts */}
        {classData.alerts.filter(alert => !alert.resolved).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
            <div className="space-y-3">
              {classData.alerts.filter(alert => !alert.resolved).map((alert) => (
                <ZPCard key={alert.id} className={`p-4 border-l-4 ${
                  alert.type === 'error' ? 'border-red-500 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  alert.type === 'success' ? 'border-green-500 bg-green-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {alert.type === 'info' && <Activity className="h-5 w-5 text-blue-500" />}
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </ZPCard>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'performance', label: 'Performance', icon: TrendingUp },
                { id: 'games', label: 'Games', icon: Gamepad2 },
                { id: 'challenges', label: 'Challenges', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
         {activeTab === 'overview' && (
           <div className="space-y-8">
             {/* Monthly Trends Chart */}
             <ZPCard className="p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
               <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                 <p className="text-gray-500">Monthly trends chart would be rendered here using Recharts</p>
               </div>
             </ZPCard>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Tracker Activity */}
               <ZPCard className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracker Activity</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                     <div className="flex items-center gap-3">
                       <Leaf className="h-5 w-5 text-green-600" />
                       <span className="font-medium">Carbon Logs</span>
                     </div>
                     <span className="text-green-600 font-bold">{classData.trackerStats.carbonLogs}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                     <div className="flex items-center gap-3">
                       <Brain className="h-5 w-5 text-purple-600" />
                       <span className="font-medium">Mental Health Logs</span>
                     </div>
                     <span className="text-purple-600 font-bold">{classData.trackerStats.mentalHealthLogs}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                     <div className="flex items-center gap-3">
                       <Heart className="h-5 w-5 text-pink-600" />
                       <span className="font-medium">Animal Welfare Logs</span>
                     </div>
                     <span className="text-pink-600 font-bold">{classData.trackerStats.animalWelfareLogs}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                     <div className="flex items-center gap-3">
                       <Zap className="h-5 w-5 text-blue-600" />
                       <span className="font-medium">Digital Twin Simulations</span>
                     </div>
                     <span className="text-blue-600 font-bold">{classData.trackerStats.digitalTwinSims}</span>
                   </div>
                 </div>
               </ZPCard>

               {/* Recent Activities */}
               <ZPCard className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                 <div className="space-y-3">
                   {classData.recentActivities.slice(0, 6).map((activity, index) => (
                     <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div>
                         <p className="font-medium text-sm">{activity.action}</p>
                         <p className="text-xs text-gray-600">{activity.student}</p>
                       </div>
                       <div className="text-right">
                         <ZPBadge variant={activity.type === 'eco' ? 'success' : activity.type === 'mental' ? 'info' : 'secondary'}>
                           +{activity.points}
                         </ZPBadge>
                         <p className="text-xs text-gray-500 mt-1">
                           {activity.date.toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                   ))}
                 </div>
               </ZPCard>
             </div>
           </div>
         )}

         {activeTab === 'students' && (
           <div className="space-y-6">
             <ZPCard className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
                 <ZPButton variant="outline" size="sm">
                   <Download className="h-4 w-4 mr-2" />
                   Export Student Data
                 </ZPButton>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="border-b border-gray-200">
                       <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-900">EcoScore</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-900">CO₂ Saved</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-900">HealCoins</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-900">Mental Health</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-900">Kindness</th>
                       <th className="text-left py-3 px-4 font-medium text-gray-900">Last Active</th>
                     </tr>
                   </thead>
                   <tbody>
                     {classData.students.map((student) => (
                       <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                         <td className="py-3 px-4">
                           <div className="flex items-center gap-2">
                             {student.rank <= 3 && (
                               <Trophy className={`h-4 w-4 ${
                                 student.rank === 1 ? 'text-yellow-500' :
                                 student.rank === 2 ? 'text-gray-400' :
                                 'text-orange-400'
                               }`} />
                             )}
                             <span className="font-medium">#{student.rank}</span>
                           </div>
                         </td>
                         <td className="py-3 px-4">
                           <div>
                             <p className="font-medium text-gray-900">{student.name}</p>
                             <div className="flex gap-1 mt-1">
                               {student.badges.slice(0, 3).map((badge, idx) => (
                                 <ZPBadge key={idx} variant="secondary" className="text-xs">
                                   {badge}
                                 </ZPBadge>
                               ))}
                             </div>
                           </div>
                         </td>
                         <td className="py-3 px-4">
                           <span className="font-bold text-green-600">{student.ecoScore}</span>
                         </td>
                         <td className="py-3 px-4">
                           <span className="font-medium">{student.co2Saved} kg</span>
                         </td>
                         <td className="py-3 px-4">
                           <span className="font-medium text-purple-600">{student.healCoins}</span>
                         </td>
                         <td className="py-3 px-4">
                           <span className="font-medium text-blue-600">{student.mentalHealthScore}</span>
                         </td>
                         <td className="py-3 px-4">
                           <span className="font-medium text-pink-600">{student.kindnessScore}</span>
                         </td>
                         <td className="py-3 px-4">
                           <span className="text-sm text-gray-600">
                             {student.lastActive.toLocaleDateString()}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </ZPCard>
           </div>
         )}

         {activeTab === 'performance' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ZPCard className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                 <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                   <p className="text-gray-500">Performance trends chart would be rendered here</p>
                 </div>
               </ZPCard>
               
               <ZPCard className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
                 <div className="space-y-4">
                   {classData.monthlyTrends.slice(-3).map((trend, index) => (
                     <div key={index} className="p-3 bg-gray-50 rounded-lg">
                       <div className="flex items-center justify-between mb-2">
                         <span className="font-medium">{trend.month}</span>
                         <span className="text-sm text-gray-600">EcoScore: {trend.ecoScore}</span>
                       </div>
                       <div className="grid grid-cols-3 gap-2 text-sm">
                         <div>
                           <span className="text-gray-600">CO₂:</span>
                           <span className="font-medium ml-1">{trend.co2Saved}kg</span>
                         </div>
                         <div>
                           <span className="text-gray-600">Participation:</span>
                           <span className="font-medium ml-1">{trend.participation}%</span>
                         </div>
                         <div>
                           <span className="text-gray-600">HealCoins:</span>
                           <span className="font-medium ml-1">{trend.healCoins}</span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </ZPCard>
             </div>
           </div>
         )}

         {activeTab === 'games' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ZPCard className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Statistics</h3>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                     <span className="font-medium">Total Games Played</span>
                     <span className="font-bold text-blue-600">{classData.gameStats.totalGamesPlayed}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                     <span className="font-medium">Average Score</span>
                     <span className="font-bold text-green-600">{classData.gameStats.avgScore}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                     <span className="font-medium">Favorite Game</span>
                     <span className="font-bold text-purple-600">{classData.gameStats.favoriteGame}</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                     <span className="font-medium">Time Spent</span>
                     <span className="font-bold text-orange-600">{classData.gameStats.timeSpent}</span>
                   </div>
                 </div>
               </ZPCard>

               <ZPCard className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Games</h3>
                 <div className="space-y-3">
                   {classData.gameStats.topGames.map((game, index) => (
                     <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div>
                         <p className="font-medium">{game.name}</p>
                         <p className="text-sm text-gray-600">{game.plays} plays</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-blue-600">{game.avgScore}</p>
                         <p className="text-xs text-gray-500">avg score</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </ZPCard>
             </div>
           </div>
         )}

         {activeTab === 'challenges' && (
           <div className="space-y-6">
             <ZPCard className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-semibold text-gray-900">Upcoming Challenges</h3>
                 <ZPButton variant="outline" size="sm">
                   <Calendar className="h-4 w-4 mr-2" />
                   Schedule New
                 </ZPButton>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {classData.upcomingChallenges.map((challenge) => (
                   <ZPCard key={challenge.id} className="p-4 border-l-4 border-blue-500">
                     <div className="mb-3">
                       <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                       <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                     </div>
                     <div className="space-y-2 text-sm">
                       <div className="flex items-center justify-between">
                         <span className="text-gray-600">Start Date:</span>
                         <span className="font-medium">{challenge.startDate}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-gray-600">Reward:</span>
                         <ZPBadge variant="success">{challenge.reward} HC</ZPBadge>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-gray-600">Participants:</span>
                         <span className="font-medium">{challenge.participants}</span>
                       </div>
                     </div>
                   </ZPCard>
                 ))}
               </div>
             </ZPCard>
           </div>
         )}
        
      </div>
    </div>
  );
}

// Helper function to generate mock class data
function generateMockClassData(classId: string): ClassData {
  const students: Student[] = [
    {
      id: '1',
      name: 'Arjun Patel',
      ecoScore: 92,
      co2Saved: 15.2,
      healCoins: 850,
      rank: 1,
      mentalHealthScore: 88,
      kindnessScore: 95,
      gamesPlayed: 45,
      lastActive: new Date('2024-01-15'),
      badges: ['Eco Champion', 'Carbon Saver', 'Green Leader']
    },
    {
      id: '2',
      name: 'Priya Sharma',
      ecoScore: 88,
      co2Saved: 12.8,
      healCoins: 720,
      rank: 2,
      mentalHealthScore: 92,
      kindnessScore: 87,
      gamesPlayed: 38,
      lastActive: new Date('2024-01-14'),
      badges: ['Mental Health Hero', 'Kindness Star', 'Game Master']
    },
    {
      id: '3',
      name: 'Rahul Kumar',
      ecoScore: 85,
      co2Saved: 11.5,
      healCoins: 680,
      rank: 3,
      mentalHealthScore: 85,
      kindnessScore: 90,
      gamesPlayed: 42,
      lastActive: new Date('2024-01-13'),
      badges: ['Animal Friend', 'Eco Warrior', 'Challenge Winner']
    },
    {
      id: '4',
      name: 'Ananya Singh',
      ecoScore: 82,
      co2Saved: 10.2,
      healCoins: 620,
      rank: 4,
      mentalHealthScore: 89,
      kindnessScore: 85,
      gamesPlayed: 35,
      lastActive: new Date('2024-01-12'),
      badges: ['Digital Twin Pro', 'Wellness Champion']
    },
    {
      id: '5',
      name: 'Vikram Gupta',
      ecoScore: 79,
      co2Saved: 9.8,
      healCoins: 580,
      rank: 5,
      mentalHealthScore: 83,
      kindnessScore: 88,
      gamesPlayed: 40,
      lastActive: new Date('2024-01-11'),
      badges: ['Team Player', 'Eco Learner']
    }
  ];

  return {
    classId,
    name: `Class ${classId.toUpperCase()}`,
    teacher: 'Ms. Sarah Johnson',
    subject: 'Environmental Science',
    totalStudents: 32,
    activeStudents: 28,
    avgEcoScore: 85.2,
    totalCO2Saved: 245.8,
    totalHealCoins: 15420,
    kpis: {
      avgEcoScore: 85.2,
      totalCO2Saved: 245.8,
      avgMentalHealthScore: 87.4,
      avgKindnessScore: 89.0,
      participationRate: 87.5,
      challengesCompleted: 12,
      badgesEarned: 45,
      gamesPlayed: 234
    },
    students,
    monthlyTrends: [
      { month: 'Jan', ecoScore: 82, co2Saved: 180, participation: 85, healCoins: 12000 },
      { month: 'Feb', ecoScore: 84, co2Saved: 210, participation: 88, healCoins: 13500 },
      { month: 'Mar', ecoScore: 85, co2Saved: 245, participation: 87, healCoins: 15420 }
    ],
    trackerStats: {
      carbonLogs: 156,
      mentalHealthLogs: 89,
      animalWelfareLogs: 67,
      digitalTwinSims: 34
    },
    gameStats: {
      totalGamesPlayed: 1247,
      avgScore: 78.5,
      favoriteGame: 'EcoQuest',
      timeSpent: '45h 23m',
      topGames: [
        { name: 'EcoQuest', plays: 450, avgScore: 82 },
        { name: 'Carbon Calculator', plays: 320, avgScore: 75 },
        { name: 'Green City Builder', plays: 280, avgScore: 88 },
        { name: 'Wildlife Protector', plays: 197, avgScore: 79 }
      ]
    },
    upcomingChallenges: [
      {
        id: '1',
        title: 'Zero Waste Week',
        startDate: '2024-02-15',
        reward: 500,
        participants: 24,
        description: 'Reduce waste to zero for one week'
      },
      {
        id: '2',
        title: 'Solar Energy Quiz',
        startDate: '2024-02-20',
        reward: 300,
        participants: 18,
        description: 'Test your knowledge about renewable energy'
      },
      {
        id: '3',
        title: 'Tree Planting Drive',
        startDate: '2024-02-25',
        reward: 750,
        participants: 30,
        description: 'Plant trees in the school garden'
      }
    ],
    recentActivities: [
      {
        action: 'Completed EcoQuest Level 5',
        student: 'Arjun Patel',
        points: 150,
        date: new Date('2024-01-15'),
        type: 'game'
      },
      {
        action: 'Logged bike commute',
        student: 'Priya Sharma',
        points: 50,
        date: new Date('2024-01-14'),
        type: 'eco'
      },
      {
        action: 'Mental health check-in',
        student: 'Rahul Kumar',
        points: 25,
        date: new Date('2024-01-13'),
        type: 'mental'
      },
      {
        action: 'Animal welfare activity',
        student: 'Ananya Singh',
        points: 75,
        date: new Date('2024-01-12'),
        type: 'animal'
      },
      {
        action: 'Completed Zero Waste Challenge',
        student: 'Vikram Gupta',
        points: 100,
        date: new Date('2024-01-11'),
        type: 'challenge'
      }
    ],
    alerts: [
      {
        id: '1',
        message: 'Low participation in mental health tracking this week',
        type: 'warning',
        timestamp: new Date('2024-01-10'),
        resolved: false
      },
      {
        id: '2',
        message: 'Class achieved 90% participation in eco challenges!',
        type: 'success',
        timestamp: new Date('2024-01-08'),
        resolved: false
      }
    ]
  };
}

// Helper function to generate CSV export
function generateClassCSV(classData: ClassData): string {
  const headers = [
    'Student Name',
    'Rank',
    'EcoScore',
    'CO2 Saved (kg)',
    'HealCoins',
    'Mental Health Score',
    'Kindness Score',
    'Games Played',
    'Last Active',
    'Badges'
  ];

  const rows = classData.students.map(student => [
    student.name,
    student.rank.toString(),
    student.ecoScore.toString(),
    student.co2Saved.toString(),
    student.healCoins.toString(),
    student.mentalHealthScore.toString(),
    student.kindnessScore.toString(),
    student.gamesPlayed.toString(),
    student.lastActive.toLocaleDateString(),
    student.badges.join('; ')
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}
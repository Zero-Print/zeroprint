'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Bell, 
  Lock, 
  Globe, 
  Palette, 
  Shield, 
  Download, 
  Trash2, 
  Eye,
  Users,
  Key,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Customize your account preferences and privacy settings
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Enhanced Notifications */}
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-blue-500 rounded-full">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Bell className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Email Notifications</div>
                    <div className="text-sm text-gray-600">Receive updates about your environmental progress</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Push Notifications</div>
                    <div className="text-sm text-gray-600">Get notified about challenges and HealCoin rewards</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Achievement Notifications</div>
                    <div className="text-sm text-gray-600">Celebrate your environmental milestones</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Privacy */}
          <Card className="bg-gradient-to-br from-white to-green-50 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-green-500 rounded-full">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Profile Visibility</div>
                    <div className="text-sm text-gray-600">Make your profile visible to other eco-warriors</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Leaderboard Participation</div>
                    <div className="text-sm text-gray-600">Show your ranking on public leaderboards</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Data Sharing</div>
                    <div className="text-sm text-gray-600">Share anonymized data for environmental research</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Preferences */}
          <Card className="bg-gradient-to-br from-white to-yellow-50 border-yellow-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-yellow-500 rounded-full">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <span>Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Language</span>
                    </div>
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    <option>English (US)</option>
                    <option>Hindi (हिंदी)</option>
                    <option>Spanish (Español)</option>
                    <option>French (Français)</option>
                    <option>German (Deutsch)</option>
                  </select>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span>Timezone</span>
                    </div>
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                    <option>Asia/Tokyo (JST)</option>
                  </select>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Palette className="w-4 h-4 text-purple-600" />
                      <span>Theme</span>
                    </div>
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                    <option>Light Theme</option>
                    <option>Dark Theme</option>
                    <option>Auto (System)</option>
                  </select>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="w-4 h-4 text-orange-600" />
                      <span>Units</span>
                    </div>
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors">
                    <option>Metric (kg, km, °C)</option>
                    <option>Imperial (lbs, miles, °F)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Account Actions */}
          <Card className="bg-gradient-to-br from-white to-red-50 border-red-200 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-red-500 rounded-full">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <span>Account Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full text-left p-6 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Key className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-gray-800 group-hover:text-blue-800">Change Password</div>
                    <div className="text-sm text-gray-600">Update your account password for better security</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-6 border border-green-200 rounded-xl hover:bg-green-50 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-gray-800 group-hover:text-green-800">Export Data</div>
                    <div className="text-sm text-gray-600">Download your account data and environmental metrics</div>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-6 border border-red-200 rounded-xl hover:bg-red-50 transition-all duration-300 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-red-700 group-hover:text-red-800">Delete Account</div>
                    <div className="text-sm text-red-600">Permanently delete your account and all associated data</div>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
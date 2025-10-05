'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Plus, TrendingUp, MapPin, Camera } from 'lucide-react';

export default function AnimalWelfareTracker() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('log');
  const [formData, setFormData] = useState({
    sightingType: '',
    species: '',
    location: '',
    description: '',
    photo: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form or show success message
    router.push('/dashboard/citizen');
  };

  const sightingTypes = [
    { value: 'bird', label: 'Bird Sighting' },
    { value: 'mammal', label: 'Mammal Sighting' },
    { value: 'reptile', label: 'Reptile/Amphibian' },
    { value: 'insect', label: 'Insect/Arthropod' },
    { value: 'marine', label: 'Marine Life' },
    { value: 'plant', label: 'Plant/Rare Flora' },
    { value: 'conservation', label: 'Conservation Action' },
  ];

  const recentSightings = [
    {
      id: 1,
      type: 'Bird',
      species: 'Red-tailed Hawk',
      location: 'Central Park',
      date: '2023-06-15',
      photo: null,
    },
    {
      id: 2,
      type: 'Mammal',
      species: 'Raccoon',
      location: 'Backyard',
      date: '2023-06-10',
      photo: null,
    },
    {
      id: 3,
      type: 'Conservation',
      species: 'Community Garden',
      location: 'Local Park',
      date: '2023-06-05',
      photo: null,
    },
  ];

  return (
    <div className="min-h-screen tracker-bg-animal-welfare py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="tracker-header">
          <div className="flex items-center justify-center mb-4">
            <div className="tracker-header-icon-container bg-gradient-to-r from-purple-500 to-pink-600">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="tracker-header-title">Animal Welfare Tracker</h1>
              <p className="tracker-header-subtitle">Monitor wildlife sightings and conservation efforts</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="tracker-tabs-container">
            <button
              onClick={() => setActiveTab('log')}
              className={`tracker-tab-button ${
                activeTab === 'log'
                  ? 'tracker-tab-active'
                  : 'tracker-tab-inactive'
              }`}
            >
              Log Sighting
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`tracker-tab-button ${
                activeTab === 'history'
                  ? 'tracker-tab-active'
                  : 'tracker-tab-inactive'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`tracker-tab-button ${
                activeTab === 'analytics'
                  ? 'tracker-tab-active'
                  : 'tracker-tab-inactive'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'log' && (
          <ZPCard className="tracker-card">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Plus className="mr-2 text-purple-600" size={20} />
              Log New Wildlife Sighting
            </h2>
            
            <form onSubmit={handleSubmit} className="tracker-form">
              <div className="tracker-grid-form">
                <div>
                  <label className="tracker-form-label">
                    Sighting Type *
                  </label>
                  <Select name="sightingType" value={formData.sightingType} onValueChange={(value) => setFormData(prev => ({ ...prev, sightingType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sightingTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="tracker-form-label">
                    Species Name *
                  </label>
                  <Input
                    type="text"
                    name="species"
                    value={formData.species}
                    onChange={handleInputChange}
                    placeholder="e.g., Red-tailed Hawk"
                    required
                    className="tracker-form-input"
                  />
                </div>
              </div>
              
              <div>
                <label className="tracker-form-label">
                  Location *
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Where did you see it?"
                    required
                    className="tracker-form-input tracker-form-input-with-icon"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              
              <div>
                <label className="tracker-form-label">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange as any}
                  placeholder="Describe what you observed..."
                  rows={3}
                  className="tracker-form-input"
                />
              </div>
              
              <div>
                <label className="tracker-form-label">
                  Photo (Optional)
                </label>
                <div className="tracker-photo-upload">
                  <label className="tracker-photo-upload-label">
                    <div className="tracker-photo-upload-content">
                      <Camera className="tracker-photo-upload-icon" />
                      <p className="tracker-photo-upload-text">
                        <span className="tracker-photo-upload-text-bold">Click to upload</span> or drag and drop
                      </p>
                      <p className="tracker-photo-upload-file-info">PNG, JPG up to 10MB</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>
              
              <div className="tracker-action-buttons">
                <ZPButton variant="outline" onClick={() => router.push('/dashboard/citizen')}>
                  Cancel
                </ZPButton>
                <ZPButton type="submit" variant="primary">
                  Log Sighting
                </ZPButton>
              </div>
            </form>
          </ZPCard>
        )}
        
        {activeTab === 'history' && (
          <div className="space-y-6">
            <ZPCard className="tracker-card">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="mr-2 text-purple-600" size={20} />
                Recent Sightings
              </h2>
              
              <div className="space-y-4">
                {recentSightings.map(sighting => (
                  <div key={sighting.id} className="tracker-activity-item">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Leaf className="text-purple-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">{sighting.species}</h3>
                        <span className="text-sm text-gray-500">{sighting.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className="capitalize">{sighting.type}</span>
                        <span className="mx-2">•</span>
                        <span>{sighting.location}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <ZPButton variant="outline" size="sm">
                        View
                      </ZPButton>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <ZPButton variant="outline">
                  Load More
                </ZPButton>
              </div>
            </ZPCard>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <ZPCard className="tracker-card">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
            
            <div className="tracker-grid-stats">
              <div className="tracker-stats-card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                <div className="tracker-stats-value text-purple-700">24</div>
                <div className="tracker-stats-label text-purple-600">Species Spotted</div>
                <div className="text-xs text-purple-500 mt-2">+3 this month</div>
              </div>
              
              <div className="tracker-stats-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                <div className="tracker-stats-value text-green-700">156</div>
                <div className="tracker-stats-label text-green-600">Total Sightings</div>
                <div className="text-xs text-green-500 mt-2">+12 this month</div>
              </div>
              
              <div className="tracker-stats-card bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                <div className="tracker-stats-value text-blue-700">8</div>
                <div className="tracker-stats-label text-blue-600">Conservation Actions</div>
                <div className="text-xs text-blue-500 mt-2">+2 this month</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-4">Sightings by Category</h3>
              <div className="space-y-4">
                {[
                  { category: 'Birds', count: 42, percentage: 65 },
                  { category: 'Mammals', count: 28, percentage: 43 },
                  { category: 'Reptiles', count: 15, percentage: 23 },
                  { category: 'Insects', count: 32, percentage: 49 },
                  { category: 'Plants', count: 18, percentage: 28 },
                  { category: 'Conservation', count: 8, percentage: 12 },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{item.category}</span>
                      <span className="text-gray-500">{item.count} sightings</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ZPCard>
        )}
      </div>
    </div>
  );
}
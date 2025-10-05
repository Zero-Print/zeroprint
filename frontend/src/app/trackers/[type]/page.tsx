'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTracker, TrackerType } from '@/hooks/useTracker';
import { useAuth } from '@/modules/auth';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { LineChart, BarChart, PieChart, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TrackerPage = () => {
  const params = useParams();
  const trackerType = (params?.type as TrackerType) || 'carbon';
  const { user } = useAuth();
  const { entries, summary, loading, error, addEntry, updateEntry, deleteEntry } = useTracker(trackerType);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    unit: trackerType === 'carbon' ? 'kg' : trackerType === 'water' ? 'liters' : trackerType === 'energy' ? 'kWh' : 'kg',
    category: '',
    description: '',
    location: ''
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading tracker data...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">Please log in to access the tracker</p>
        <ZPButton onClick={() => window.location.href = '/login'}>
          Go to Login
        </ZPButton>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = {
      value: parseFloat(formData.value),
      unit: formData.unit,
      category: formData.category,
      description: formData.description,
      location: formData.location || undefined
    };
    
    const result = await addEntry(entry);
    
    if (result) {
      setShowAddForm(false);
      setFormData({
        value: '',
        unit: trackerType === 'carbon' ? 'kg' : trackerType === 'water' ? 'liters' : trackerType === 'energy' ? 'kWh' : 'kg',
        category: '',
        description: '',
        location: ''
      });
    }
  };

  const getTrackerTitle = () => {
    switch (trackerType) {
      case 'carbon': return 'Carbon Footprint Tracker';
      case 'water': return 'Water Usage Tracker';
      case 'energy': return 'Energy Consumption Tracker';
      case 'waste': return 'Waste Management Tracker';
      default: return 'Environmental Tracker';
    }
  };

  const getCategoryOptions = () => {
    switch (trackerType) {
      case 'carbon':
        return ['transportation', 'food', 'household', 'shopping', 'other'];
      case 'water':
        return ['household', 'garden', 'personal', 'cooking', 'other'];
      case 'energy':
        return ['electricity', 'heating', 'cooling', 'appliances', 'other'];
      case 'waste':
        return ['plastic', 'paper', 'organic', 'electronic', 'other'];
      default:
        return ['general', 'other'];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Removed duplicate Navigation component */}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getTrackerTitle()}</h1>
        <p className="text-gray-600">
          Track and monitor your environmental impact
        </p>
      </div>
      
      {summary && (
        <ZPCard className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{summary.totalEntries}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total {trackerType === 'carbon' ? 'Emissions' : trackerType === 'water' ? 'Usage' : trackerType === 'energy' ? 'Consumption' : 'Waste'}</p>
                <p className="text-2xl font-bold">{summary.totalValue.toFixed(2)} {summary.unit}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average per Entry</p>
                <p className="text-2xl font-bold">{summary.averageValue.toFixed(2)} {summary.unit}</p>
              </div>
            </div>
          </div>
        </ZPCard>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Entries</h2>
        <ZPButton onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : <><Plus size={16} className="mr-2" /> Add Entry</>}
        </ZPButton>
      </div>
      
      {showAddForm && (
        <ZPCard className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Entry</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select a category</option>
                    {getCategoryOptions().map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <ZPButton type="submit">Save Entry</ZPButton>
              </div>
            </form>
          </div>
        </ZPCard>
      )}
      
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map(entry => (
            <ZPCard key={entry.id} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{entry.description}</h3>
                    <p className="text-sm text-gray-600 capitalize">{entry.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.value} {entry.unit}</p>
                    <p className="text-xs text-gray-500">{format(new Date(entry.timestamp), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button 
                    className="p-1 text-gray-500 hover:text-blue-500"
                    onClick={() => {
                      // Edit functionality would go here
                      alert('Edit functionality to be implemented');
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-1 text-gray-500 hover:text-red-500"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </ZPCard>
          ))}
        </div>
      ) : (
        <ZPCard className="text-center py-12">
          <p className="text-gray-600 mb-4">No entries yet. Add your first entry to get started!</p>
          <ZPButton onClick={() => setShowAddForm(true)}>
            <Plus size={16} className="mr-2" /> Add Entry
          </ZPButton>
        </ZPCard>
      )}
    </div>
  );
};

export default TrackerPage;
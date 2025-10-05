'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZPTextArea } from '@/components/ui/ZPTextArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf, Plus, MapPin, Camera, Users } from 'lucide-react';

export default function AnimalWelfareLogEntry() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    activityType: '',
    species: '',
    location: '',
    participants: 1,
    description: '',
    date: new Date().toISOString().split('T')[0],
    photo: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, activityType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form or show success message
    router.push('/trackers/animal-welfare');
  };

  const activityTypes = [
    { value: 'sighting', label: 'Wildlife Sighting' },
    { value: 'habitat', label: 'Habitat Restoration' },
    { value: 'cleanup', label: 'Cleanup Activity' },
    { value: 'planting', label: 'Tree/Planting' },
    { value: 'feeding', label: 'Animal Feeding' },
    { value: 'rescue', label: 'Animal Rescue' },
    { value: 'education', label: 'Environmental Education' },
  ];

  return (
    <div className="min-h-screen tracker-bg-animal-welfare py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="tracker-header">
          <div className="flex items-center justify-center mb-4">
            <div className="tracker-header-icon-container bg-gradient-to-r from-purple-500 to-pink-600">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="tracker-header-title">Log Animal Welfare Entry</h1>
              <p className="tracker-header-subtitle">Record your animal welfare activities and observations</p>
            </div>
          </div>
        </div>

        <ZPCard className="tracker-card">
          <form onSubmit={handleSubmit} className="tracker-form">
            <div>
              <Label className="tracker-form-label">
                Activity Type *
              </Label>
              <Select onValueChange={handleSelectChange} value={formData.activityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="tracker-grid-form">
              <div>
                <Label className="tracker-form-label">
                  Species (if applicable)
                </Label>
                <Input
                  type="text"
                  name="species"
                  value={formData.species}
                  onChange={handleInputChange}
                  placeholder="e.g., Red-tailed Hawk"
                  className="tracker-form-input"
                />
              </div>
              
              <div>
                <Label className="tracker-form-label">
                  Number of Participants
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                    min="1"
                    className="tracker-form-input tracker-form-input-with-icon"
                  />
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            </div>
            
            <div>
              <Label className="tracker-form-label">
                Location
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where did this activity take place?"
                  className="tracker-form-input tracker-form-input-with-icon"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            
            <div>
              <Label className="tracker-form-label">
                Description
              </Label>
              <ZPTextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your activity, observations, or impact..."
                rows={4}
                className="tracker-form-input"
              />
            </div>
            
            <div className="tracker-grid-form">
              <div>
                <Label className="tracker-form-label">
                  Date *
                </Label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="tracker-form-input"
                />
              </div>
            </div>
            
            <div>
              <Label className="tracker-form-label">
                Photo (Optional)
              </Label>
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
              <Button variant="outline" onClick={() => router.push('/trackers/animal-welfare')}>
                Cancel
              </Button>
              <Button type="submit" className="tracker-button-primary">
                <Plus className="mr-2" size={16} />
                Log Entry
              </Button>
            </div>
          </form>
        </ZPCard>
      </div>
    </div>
  );
}
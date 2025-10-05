'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ZPCard } from '@/components/ZPCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ZPTextArea } from '@/components/ui/ZPTextArea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Plus, TrendingUp, Calendar, Camera } from 'lucide-react';

export default function MentalHealthLogEntry() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    activityType: '',
    moodRating: 5,
    stressLevel: 5,
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

  const handleSliderChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    // Reset form or show success message
    router.push('/trackers/mental-health');
  };

  const activityTypes = [
    { value: 'meditation', label: 'Meditation/Mindfulness' },
    { value: 'exercise', label: 'Physical Exercise' },
    { value: 'nature', label: 'Time in Nature' },
    { value: 'social', label: 'Social Interaction' },
    { value: 'creative', label: 'Creative Activity' },
    { value: 'learning', label: 'Learning/Education' },
    { value: 'other', label: 'Other Activity' },
  ];

  return (
    <div className="min-h-screen tracker-bg-mental-health py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="tracker-header">
          <div className="flex items-center justify-center mb-4">
            <div className="tracker-header-icon-container bg-gradient-to-r from-blue-500 to-indigo-600">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h1 className="tracker-header-title">Log Mental Wellness Entry</h1>
              <p className="tracker-header-subtitle">Record your mental wellness activities and feelings</p>
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
                  Mood Rating (1-10) *
                </Label>
                <div className="relative">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.moodRating}
                    onChange={(e) => handleSliderChange('moodRating', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (Very Low)</span>
                    <span className="font-medium">{formData.moodRating}</span>
                    <span>10 (Very High)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="tracker-form-label">
                  Stress Level (1-10) *
                </Label>
                <div className="relative">
                  <Input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stressLevel}
                    onChange={(e) => handleSliderChange('stressLevel', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (Very Low)</span>
                    <span className="font-medium">{formData.stressLevel}</span>
                    <span>10 (Very High)</span>
                  </div>
                </div>
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
                placeholder="How are you feeling today? What helped or hindered your wellness?"
                rows={4}
              />
            </div>
            
            <div className="tracker-grid-form">
              <div>
                <Label className="tracker-form-label">
                  Date *
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="tracker-form-input tracker-form-input-with-icon"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
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
              <Button variant="outline" onClick={() => router.push('/trackers/mental-health')}>
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
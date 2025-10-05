'use client';

import React, { useState, useRef } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { Upload, X, FileText } from 'lucide-react';

interface VoucherUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, rewardId: string) => Promise<{ success: boolean; message: string }>;
  isLoading?: boolean;
}

export function VoucherUploadModal({ isOpen, onClose, onUpload, isLoading = false }: VoucherUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rewardId, setRewardId] = useState('');
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadStatus(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !rewardId) {
      setUploadStatus({ type: 'error', message: 'Please select a file and reward' });
      return;
    }

    try {
      const result = await onUpload(selectedFile, rewardId);
      setUploadStatus({ 
        type: result.success ? 'success' : 'error', 
        message: result.message 
      });
      
      if (result.success) {
        // Reset form on success
        setSelectedFile(null);
        setRewardId('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setUploadStatus({ type: 'error', message: 'Upload failed. Please try again.' });
    }
  };

  const handleClose = () => {
    // Reset form
    setSelectedFile(null);
    setRewardId('');
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <ZPCard className="w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Vouchers</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="rewardId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Reward
            </label>
            <select
              id="rewardId"
              value={rewardId}
              onChange={(e) => setRewardId(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Choose a reward</option>
              <option value="1">Amazon Voucher ₹100</option>
              <option value="2">Reusable Water Bottle</option>
              <option value="3">Electricity Bill Credit</option>
            </select>
          </div>
          
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-emerald-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV file up to 10MB</p>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">CSV Format:</p>
            <p>code</p>
            <p>ABC-123-XYZ</p>
            <p>DEF-456-UVW</p>
          </div>
          
          {uploadStatus && (
            <div className={`p-3 rounded-md ${uploadStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {uploadStatus.message}
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <ZPButton
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </ZPButton>
            
            <ZPButton
              variant="primary"
              onClick={handleUpload}
              disabled={isLoading || !selectedFile || !rewardId}
              loading={isLoading}
            >
              Upload Vouchers
            </ZPButton>
          </div>
        </div>
      </ZPCard>
    </div>
  );
}
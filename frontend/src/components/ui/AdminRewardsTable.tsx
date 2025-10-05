/**
 * Admin Rewards Table Component
 * Displays all redemptions with filtering and CSV export
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import api from '@/lib/apiClient';
import { Redemption } from '@/types';

interface AdminRewardsTableProps {
  onRefresh?: () => void;
}

export function AdminRewardsTable({ onRefresh }: AdminRewardsTableProps) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    status: '',
    userId: '',
    rewardId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load redemptions
  const loadRedemptions = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.admin.rewards.getAllRedemptions(page, pagination.limit, {
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      });

      if (response.success && response.data) {
        setRedemptions(response.data.redemptions);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to load redemptions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  };

  // Update redemption status
  const updateStatus = async (redemptionId: string, status: string, notes?: string) => {
    try {
      const response = await api.admin.rewards.updateRedemptionStatus(redemptionId, status, notes);
      if (response.success) {
        await loadRedemptions(pagination.page);
        onRefresh?.();
      } else {
        setError(response.error || 'Failed to update status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      const response = await api.admin.rewards.exportRedemptions('csv', filters);
      if (response.success) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `redemptions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setError(response.error || 'Failed to export data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    }
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadRedemptions(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      userId: '',
      rewardId: '',
      dateFrom: '',
      dateTo: '',
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
    loadRedemptions(1);
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter redemptions by search term
  const filteredRedemptions = redemptions.filter(redemption =>
    redemption.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    redemption.rewardId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    redemption.metadata?.rewardName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadRedemptions();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Redemption Management</CardTitle>
            <CardDescription>
              Manage and track all reward redemptions
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => loadRedemptions(pagination.page)} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search redemptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
          />

          <Input
            placeholder="Reward ID"
            value={filters.rewardId}
            onChange={(e) => setFilters(prev => ({ ...prev, rewardId: e.target.value }))}
          />

          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
          />

          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={applyFilters} size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm">
            Clear
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading redemptions...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRedemptions.map((redemption) => (
                  <TableRow key={redemption.id}>
                    <TableCell className="font-mono text-sm">
                      {redemption.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {redemption.userId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{redemption.metadata?.rewardName || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{redemption.rewardId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{redemption.quantity}</TableCell>
                    <TableCell>{redemption.coinCost.toLocaleString()} coins</TableCell>
                    <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                    <TableCell>
                      {new Date(redemption.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {redemption.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(redemption.id, 'completed')}
                            >
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(redemption.id, 'failed')}
                            >
                              Fail
                            </Button>
                          </>
                        )}
                        {redemption.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(redemption.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} redemptions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadRedemptions(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadRedemptions(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

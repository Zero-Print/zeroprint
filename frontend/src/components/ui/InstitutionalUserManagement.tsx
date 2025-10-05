'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'school' | 'msme' | 'govt' | 'admin';
  department?: string;
  organizationId?: string;
  organizationName?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  healCoins: number;
  carbonSaved: number;
}

interface Department {
  id: string;
  name: string;
  organizationId: string;
  userCount: number;
  adminId: string;
  budget?: number;
  carbonTarget?: number;
}

interface BulkOperation {
  type: 'activate' | 'suspend' | 'delete' | 'assign_department' | 'update_role';
  userIds: string[];
  reason?: string;
  newValue?: string;
}

interface InstitutionalUserManagementProps {
  onUserUpdate?: (userId: string, updates: Partial<User>) => void;
  onBulkOperation?: (operation: BulkOperation) => void;
}

export const InstitutionalUserManagement: React.FC<InstitutionalUserManagementProps> = ({
  onUserUpdate,
  onBulkOperation
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@greentech.edu',
        name: 'John Doe',
        role: 'school',
        department: 'Environmental Science',
        organizationId: 'org1',
        organizationName: 'Green Tech University',
        status: 'active',
        lastLogin: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        healCoins: 1250,
        carbonSaved: 45.2
      },
      {
        id: '2',
        email: 'sarah.wilson@ecomsme.com',
        name: 'Sarah Wilson',
        role: 'msme',
        department: 'Operations',
        organizationId: 'org2',
        organizationName: 'EcoMSME Solutions',
        status: 'active',
        lastLogin: new Date('2024-01-14'),
        createdAt: new Date('2024-01-02'),
        healCoins: 890,
        carbonSaved: 32.1
      },
      {
        id: '3',
        email: 'mike.govt@citycouncil.gov',
        name: 'Mike Johnson',
        role: 'govt',
        department: 'Environmental Affairs',
        organizationId: 'org3',
        organizationName: 'City Council',
        status: 'pending',
        createdAt: new Date('2024-01-10'),
        healCoins: 0,
        carbonSaved: 0
      },
      {
        id: '4',
        email: 'admin@zeroprint.com',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        lastLogin: new Date('2024-01-15'),
        createdAt: new Date('2023-12-01'),
        healCoins: 5000,
        carbonSaved: 150.5
      }
    ];

    const mockDepartments: Department[] = [
      {
        id: 'dept1',
        name: 'Environmental Science',
        organizationId: 'org1',
        userCount: 25,
        adminId: '1',
        budget: 50000,
        carbonTarget: 1000
      },
      {
        id: 'dept2',
        name: 'Operations',
        organizationId: 'org2',
        userCount: 12,
        adminId: '2',
        budget: 30000,
        carbonTarget: 500
      },
      {
        id: 'dept3',
        name: 'Environmental Affairs',
        organizationId: 'org3',
        userCount: 8,
        adminId: '3',
        carbonTarget: 2000
      }
    ];

    setUsers(mockUsers);
    setDepartments(mockDepartments);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.organizationName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkAction = (type: BulkOperation['type'], newValue?: string) => {
    if (selectedUsers.length === 0) return;

    const operation: BulkOperation = {
      type,
      userIds: selectedUsers,
      newValue
    };

    onBulkOperation?.(operation);
    setSelectedUsers([]);
    setShowBulkActions(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'govt': return 'bg-blue-100 text-blue-800';
      case 'school': return 'bg-green-100 text-green-800';
      case 'msme': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ZPCard title="Total Users" className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-gray-600">Across all organizations</div>
        </ZPCard>
        <ZPCard title="Active Users" className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-600">
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Currently active</div>
        </ZPCard>
        <ZPCard title="Pending Approval" className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-yellow-600">
            {users.filter(u => u.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Awaiting approval</div>
        </ZPCard>
        <ZPCard title="Departments" className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-purple-600">{departments.length}</div>
          <div className="text-sm text-gray-600">Active departments</div>
        </ZPCard>
      </div>

      {/* Filters and Search */}
      <ZPCard title="User Management" description="Manage institutional users and departments">
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search users, emails, or organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="school">School</option>
              <option value="msme">MSME</option>
              <option value="govt">Government</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <ZPButton 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('activate')}
                  >
                    Activate
                  </ZPButton>
                  <ZPButton 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleBulkAction('suspend')}
                  >
                    Suspend
                  </ZPButton>
                  <ZPButton 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowBulkActions(true)}
                  >
                    More Actions
                  </ZPButton>
                </div>
              </div>
            </div>
          )}

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Department</th>
                  <th className="text-left p-3 font-medium">Organization</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">HealCoins</th>
                  <th className="text-left p-3 font-medium">CO₂ Saved</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-400">
                            Last login: {user.lastLogin.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <ZPBadge className={getRoleColor(user.role)}>
                        {user.role.toUpperCase()}
                      </ZPBadge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{user.department || '-'}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{user.organizationName || '-'}</span>
                    </td>
                    <td className="p-3">
                      <ZPBadge className={getStatusColor(user.status)}>
                        {user.status.toUpperCase()}
                      </ZPBadge>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{user.healCoins.toLocaleString()}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-green-600 font-medium">{user.carbonSaved} kg</span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <ZPButton
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                        >
                          Edit
                        </ZPButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-4 block">👥</span>
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </ZPCard>

      {/* Department Management */}
      <ZPCard title="Department Management" description="Manage organizational departments and budgets">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Active Departments</h3>
            <ZPButton onClick={() => setShowDepartmentModal(true)}>
              Add Department
            </ZPButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{dept.name}</h4>
                  <ZPButton size="sm" variant="outline">Edit</ZPButton>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Users: {dept.userCount}</div>
                  {dept.budget && <div>Budget: ${dept.budget.toLocaleString()}</div>}
                  {dept.carbonTarget && <div>Carbon Target: {dept.carbonTarget} kg CO₂</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ZPCard>
    </div>
  );
};
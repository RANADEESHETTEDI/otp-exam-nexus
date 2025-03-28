
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui-custom/Button";
import { Input } from "@/components/ui-custom/Input";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Mock user data
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'disabled';
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: "user-001",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "student",
    status: "active",
    lastLogin: "2023-09-15T14:30:00Z"
  },
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    role: "student",
    status: "active",
    lastLogin: "2023-09-14T09:45:00Z"
  },
  {
    id: "user-003",
    name: "Michael Chen",
    email: "m.chen@example.com",
    role: "student",
    status: "pending",
    lastLogin: ""
  },
  {
    id: "user-004",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    role: "student",
    status: "active",
    lastLogin: "2023-09-12T16:20:00Z"
  },
  {
    id: "user-005",
    name: "David Garcia",
    email: "d.garcia@example.com",
    role: "student",
    status: "disabled",
    lastLogin: "2023-08-25T11:10:00Z"
  },
  {
    id: "admin-001",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    lastLogin: "2023-09-15T08:15:00Z"
  }
];

const UserManagement = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student"
  });
  const [errors, setErrors] = useState({
    name: "",
    email: ""
  });
  
  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate("/admin/login");
      return;
    }
    
    if (user.role !== "admin") {
      toast.error("You do not have permission to access this page");
      navigate("/login");
      return;
    }
    
    // Fetch users (mock)
    const fetchUsers = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setUsers(mockUsers);
      } catch (error) {
        toast.error("Failed to load users. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, navigate]);
  
  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.status.toLowerCase().includes(searchLower)
    );
  });
  
  // Add new user
  const handleAddUser = () => {
    // Reset errors
    setErrors({ name: "", email: "" });
    
    // Validate form
    let hasError = false;
    
    if (!newUser.name.trim()) {
      setErrors(prev => ({ ...prev, name: "Name is required" }));
      hasError = true;
    }
    
    if (!newUser.email.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }));
      hasError = true;
    } else if (!newUser.email.includes('@')) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email" }));
      hasError = true;
    }
    
    if (hasError) return;
    
    // Add user (mock)
    const addedUser: User = {
      id: `user-${Math.floor(Math.random() * 1000)}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'pending',
      lastLogin: ""
    };
    
    setUsers(prev => [addedUser, ...prev]);
    setShowAddUserModal(false);
    setNewUser({ name: "", email: "", role: "student" });
    
    toast.success(`User ${addedUser.name} has been added successfully`);
  };
  
  // Change user status
  const handleChangeStatus = (userId: string, newStatus: 'active' | 'pending' | 'disabled') => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus } 
          : user
      )
    );
    
    const userName = users.find(u => u.id === userId)?.name;
    toast.success(`${userName}'s status updated to ${newStatus}`);
  };
  
  // Delete user
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success("User has been deleted");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="User Management" subtitle="Loading users...">
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-primary animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Management"
      subtitle="Add and manage user accounts"
    >
      {/* Search and Add User */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setShowAddUserModal(true)}>
          Add New User
        </Button>
      </div>
      
      {/* User Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left font-medium text-muted-foreground">Last Login</th>
                <th className="px-6 py-4 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 capitalize">{user.role}</td>
                    <td className="px-6 py-4">
                      <span className={`
                        inline-block px-2 py-1 rounded-full text-xs font-medium
                        ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}
                      `}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(user.lastLogin)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleChangeStatus(user.id, 'active')}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          Activate
                        </button>
                      )}
                      {user.status !== 'disabled' && (
                        <button
                          onClick={() => handleChangeStatus(user.id, 'disabled')}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Disable
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs text-red-600 hover:text-red-800 ml-3"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl max-w-md w-full p-6 shadow-lg"
          >
            <h2 className="text-xl font-medium mb-6">Add New User</h2>
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                error={errors.name}
              />
              
              <Input
                label="Email Address"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                error={errors.email}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full rounded-lg border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/80"
                >
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </Button>
                
                <Button onClick={handleAddUser}>
                  Add User
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;

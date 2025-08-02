// Mock data for Team Hub application

// Mock users data
export const mockUsers = [
  { id: '1', email: 'admin@company.com', password: 'admin123', role: 'admin' },
  { id: '2', email: 'john@company.com', password: 'user123', role: 'user' },
  { id: '3', email: 'sarah@company.com', password: 'user123', role: 'user' },
  { id: '4', email: 'mike@company.com', password: 'user123', role: 'admin' },
  { id: '5', email: 'lisa@company.com', password: 'user123', role: 'user' }
];

// Mock announcements data
export const mockAnnouncements = [
  {
    id: '1',
    title: 'New Office Hours Policy',
    content: 'Starting next Monday, we are implementing flexible office hours. All team members can now choose to work between 7 AM - 10 AM and 3 PM - 6 PM or the traditional 9 AM - 5 PM schedule.',
    author: 'admin@company.com',
    createdAt: new Date('2024-12-15T10:30:00Z'),
    updatedAt: new Date('2024-12-15T10:30:00Z')
  },
  {
    id: '2',
    title: 'Team Building Event - December 20th',
    content: 'Join us for our quarterly team building event at Central Park. Activities include mini golf, team challenges, and a BBQ lunch. Please RSVP by December 18th.',
    author: 'sarah@company.com',
    createdAt: new Date('2024-12-14T14:15:00Z'),
    updatedAt: new Date('2024-12-14T14:15:00Z')
  },
  {
    id: '3',
    title: 'Holiday Schedule Reminder',
    content: 'The office will be closed from December 24th through January 2nd. Emergency contacts and project deadlines have been shared via email.',
    author: 'admin@company.com',
    createdAt: new Date('2024-12-13T09:00:00Z'),
    updatedAt: new Date('2024-12-13T09:00:00Z')
  },
  {
    id: '4',
    title: 'New Employee Welcome',
    content: 'Please join me in welcoming Alex Chen to our development team. Alex will be working on the mobile app project and starts this Monday.',
    author: 'mike@company.com',
    createdAt: new Date('2024-12-12T16:45:00Z'),
    updatedAt: new Date('2024-12-12T16:45:00Z')
  },
  {
    id: '5',
    title: 'Parking Lot Update',
    content: 'Due to construction, the north parking lot will be unavailable from December 16-18. Please use the south lot or street parking during this time.',
    author: 'lisa@company.com',
    createdAt: new Date('2024-12-11T11:20:00Z'),
    updatedAt: new Date('2024-12-11T11:20:00Z')
  }
];

// Mock authentication functions
export const mockAuth = {
  currentUser: null,
  
  signIn: (email, password) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      mockAuth.currentUser = { id: user.id, email: user.email, role: user.role };
      localStorage.setItem('teamhub_user', JSON.stringify(mockAuth.currentUser));
      return { success: true, user: mockAuth.currentUser };
    }
    return { success: false, error: 'Invalid credentials' };
  },
  
  signUp: (email, password, role) => {
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      role
    };
    
    mockUsers.push(newUser);
    mockAuth.currentUser = { id: newUser.id, email: newUser.email, role: newUser.role };
    localStorage.setItem('teamhub_user', JSON.stringify(mockAuth.currentUser));
    return { success: true, user: mockAuth.currentUser };
  },
  
  logout: () => {
    mockAuth.currentUser = null;
    localStorage.removeItem('teamhub_user');
  },
  
  getCurrentUser: () => {
    if (!mockAuth.currentUser) {
      const stored = localStorage.getItem('teamhub_user');
      if (stored) {
        mockAuth.currentUser = JSON.parse(stored);
      }
    }
    return mockAuth.currentUser;
  },
  
  isAdmin: () => {
    const user = mockAuth.getCurrentUser();
    return user && user.role === 'admin';
  }
};

// Mock API functions for announcements
export const mockAnnouncementAPI = {
  getAll: () => {
    return Promise.resolve(mockAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  },
  
  create: (title, content) => {
    const user = mockAuth.getCurrentUser();
    const newAnnouncement = {
      id: Date.now().toString(),
      title,
      content,
      author: user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockAnnouncements.push(newAnnouncement);
    return Promise.resolve(newAnnouncement);
  },
  
  update: (id, title, content) => {
    const index = mockAnnouncements.findIndex(a => a.id === id);
    if (index !== -1) {
      mockAnnouncements[index] = {
        ...mockAnnouncements[index],
        title,
        content,
        updatedAt: new Date()
      };
      return Promise.resolve(mockAnnouncements[index]);
    }
    return Promise.reject(new Error('Announcement not found'));
  },
  
  delete: (id) => {
    const index = mockAnnouncements.findIndex(a => a.id === id);
    if (index !== -1) {
      const deleted = mockAnnouncements.splice(index, 1)[0];
      return Promise.resolve(deleted);
    }
    return Promise.reject(new Error('Announcement not found'));
  }
};

// Mock API functions for user management
export const mockUserAPI = {
  getAll: () => {
    return Promise.resolve(mockUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
  },
  
  updateRole: (userId, newRole) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.role = newRole;
      return Promise.resolve({ id: user.id, email: user.email, role: user.role });
    }
    return Promise.reject(new Error('User not found'));
  }
};
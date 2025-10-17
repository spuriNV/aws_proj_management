import { useState } from 'react'
import Head from 'next/head'
import { 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  FolderPlus,
  Users,
  BarChart3,
  Shield
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'on-hold'
  team: number
  tasks: number
  progress: number
  lastActivity: string
}

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
  project: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'team'>('projects')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - in real app, this would come from API
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      status: 'active',
      team: 5,
      tasks: 12,
      progress: 65,
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile app for iOS and Android platforms',
      status: 'active',
      team: 8,
      tasks: 24,
      progress: 30,
      lastActivity: '1 day ago'
    },
    {
      id: '3',
      name: 'Security Audit',
      description: 'Comprehensive security audit and penetration testing',
      status: 'completed',
      team: 3,
      tasks: 8,
      progress: 100,
      lastActivity: '3 days ago'
    }
  ]

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Design homepage layout',
      description: 'Create wireframes and mockups for the new homepage',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Doe',
      dueDate: '2024-01-15',
      project: 'Website Redesign'
    },
    {
      id: '2',
      title: 'Implement user authentication',
      description: 'Set up secure login and registration system',
      status: 'todo',
      priority: 'high',
      assignee: 'Jane Smith',
      dueDate: '2024-01-20',
      project: 'Mobile App Development'
    },
    {
      id: '3',
      title: 'Security vulnerability scan',
      description: 'Run automated security scans on all endpoints',
      status: 'completed',
      priority: 'medium',
      assignee: 'Mike Johnson',
      dueDate: '2024-01-10',
      project: 'Security Audit'
    }
  ]

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Head>
        <title>Dashboard - Secure Project Management</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Secure Project Management
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects, tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                </button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">John Doe</span>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FolderPlus className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status !== 'completed').length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Shield className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'projects'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'team'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Team
            </button>
          </div>

          {/* Content */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                <button className="btn-primary flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : project.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{project.tasks} tasks</span>
                        <span>{project.team} members</span>
                      </div>
                      
                      <p className="text-xs text-gray-500">Last activity: {project.lastActivity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                <button className="btn-primary flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </button>
              </div>
              
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Assigned to: {task.assignee}</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-500">{task.project}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                <button className="btn-primary flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </button>
              </div>
              
              <div className="card">
                <p className="text-gray-600">Team management features coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

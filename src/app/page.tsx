"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DM_Sans } from "next/font/google"
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar, 
  Droplet, 
  ParkingSquare, 
  Lightbulb,
  SearchX
} from "lucide-react"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
})

// Types
type Amenity = "water" | "parking" | "lights" | "changing_rooms" | "equipment"
type ThemeMode = "light" | "dark"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

interface Match {
  id: string
  groundName: string
  location: string
  date: string
  time: string
  totalSpots: number
  spotsLeft: number
  amenities: Amenity[]
  organizerName: string
  organizerId: string
  description: string
  joining?: boolean
  participants: string[]
}

interface User {
  id: string
  name: string
  email: string
  joinedMatches: string[]
  organizedMatches: string[]
}

export default function CricketMatchFinder() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>("light")
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else if (prefersDark) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    }
  }, [])
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  // Mock current user
  const [currentUser, setCurrentUser] = useState<User>({
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    joinedMatches: ["match3"],
    organizedMatches: ["match1"],
  })

  // Mock data for matches
  const [matches, setMatches] = useState<Match[]>([
    {
      id: "match1",
      groundName: "Victoria Park",
      location: "London",
      date: "2025-04-15",
      time: "14:00",
      totalSpots: 22,
      spotsLeft: 5,
      amenities: ["water", "parking", "lights"],
      organizerName: "John Doe",
      organizerId: "user1",
      description: "Friendly T20 match, all skill levels welcome.",
      participants: ["user1", "user2"],
    },
    {
      id: "match2",
      groundName: "Central Cricket Ground",
      location: "Manchester",
      date: "2025-04-18",
      time: "10:00",
      totalSpots: 22,
      spotsLeft: 2,
      amenities: ["water", "changing_rooms", "equipment"],
      organizerName: "Mike Smith",
      organizerId: "user2",
      description: "Competitive match, intermediate to advanced players.",
      participants: ["user2", "user3"],
    },
    {
      id: "match3",
      groundName: "Riverside Fields",
      location: "Birmingham",
      date: "2025-04-20",
      time: "16:30",
      totalSpots: 22,
      spotsLeft: 8,
      amenities: ["water", "parking"],
      organizerName: "Sarah Johnson",
      organizerId: "user3",
      description: "Practice session with coaching available.",
      participants: ["user3", "user1"],
    },
    {
      id: "match4",
      groundName: "Community Sports Hub",
      location: "London",
      date: "2025-04-22",
      time: "18:00",
      totalSpots: 22,
      spotsLeft: 11,
      amenities: ["water", "lights", "changing_rooms"],
      organizerName: "David Wilson",
      organizerId: "user4",
      description: "Evening match under lights, beginners welcome.",
      participants: ["user4", "user1"],
    },
  ])

  // State for join requests
  const [joinRequests, setJoinRequests] = useState<{ [key: string]: boolean }>({})

  // State for filters
  const [filters, setFilters] = useState({
    location: "",
    date: "",
    amenity: "",
  })

  // State for view mode
  const [viewMode, setViewMode] = useState<"matches" | "profile" | "create">("matches")

  // State for new match form
  const [newMatch, setNewMatch] = useState<Omit<Match, "id" | "organizerName" | "organizerId">>({
    groundName: "",
    location: "",
    date: "",
    time: "",
    totalSpots: 22,
    spotsLeft: 22,
    amenities: [],
    description: "",
    participants: [],
  })

  // Near the top of the file, after other useState declarations
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [spotsFilter, setSpotsFilter] = useState("all")

  // Add a clearFilters function
  const clearFilters = () => {
    setSearchTerm("")
    setDateFilter("all")
    setLocationFilter("all")
    setSpotsFilter("all")
  }

  // Function to handle joining a match
  const handleJoinMatch = (matchId: string) => {
    if (currentUser.joinedMatches.includes(matchId)) {
      return
    }
    
    // Update match spots and add user to participants
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, spotsLeft: match.spotsLeft - 1, participants: [...match.participants, currentUser.id] } 
        : match
    ))
    
    // Update user's joined matches
    setCurrentUser({
      ...currentUser,
      joinedMatches: [...currentUser.joinedMatches, matchId],
    })
  }

  // Filter matches based on selected filters
  const filteredMatches = matches.filter((match) => {
    const locationMatch = filters.location ? match.location === filters.location : true
    const dateMatch = filters.date ? match.date === filters.date : true
    const amenityMatch = filters.amenity ? match.amenities.includes(filters.amenity as Amenity) : true
    return locationMatch && dateMatch && amenityMatch
  })

  // Handle join request
  const handleJoinRequest = (matchId: string) => {
    if (currentUser.joinedMatches.includes(matchId)) {
      return
    }

    // First set the joining animation state
    setMatches(matches.map(match => 
      match.id === matchId 
        ? { ...match, joining: true } 
        : match
    ))

    // Set join request state immediately for UI feedback
    setJoinRequests({ ...joinRequests, [matchId]: true })

    // Complete the join process after animation
    setTimeout(() => {
      setMatches(matches.map((match) => 
        match.id === matchId 
          ? { ...match, spotsLeft: match.spotsLeft - 1, joining: false } 
          : match
      ))

      setCurrentUser({
        ...currentUser,
        joinedMatches: [...currentUser.joinedMatches, matchId],
      })
    }, 1000)
  }

  // Handle creating a new match
  const handleCreateMatch = () => {
    const newMatchId = `match${matches.length + 1}`
    const createdMatch: Match = {
      ...newMatch,
      id: newMatchId,
      organizerName: currentUser.name,
      organizerId: currentUser.id,
    }

    setMatches([...matches, createdMatch])
    setCurrentUser({
      ...currentUser,
      organizedMatches: [...currentUser.organizedMatches, newMatchId],
    })
    setViewMode("matches")

    // Reset form
    setNewMatch({
      groundName: "",
      location: "",
      date: "",
      time: "",
      totalSpots: 22,
      spotsLeft: 22,
      amenities: [],
      description: "",
      participants: [],
    })
  }

  // Handle amenity toggle in create form
  const toggleAmenity = (amenity: Amenity) => {
    if (newMatch.amenities.includes(amenity)) {
      setNewMatch({
        ...newMatch,
        amenities: newMatch.amenities.filter((a) => a !== amenity),
      })
    } else {
      setNewMatch({
        ...newMatch,
        amenities: [...newMatch.amenities, amenity],
      })
    }
  }

  // Get unique locations for filter
  const locations = Array.from(new Set(matches.map((match) => match.location)))

  // Get user's joined matches
  const userJoinedMatches = matches.filter((match) => currentUser.joinedMatches.includes(match.id))

  // Get user's organized matches
  const userOrganizedMatches = matches.filter((match) => currentUser.organizedMatches.includes(match.id))

  // Custom styles for select dropdowns
  useEffect(() => {
    // Apply custom styles to select dropdowns
    const style = document.createElement('style');
    style.textContent = `
      select option {
        padding: 10px;
        font-size: 14px;
        background-color: white;
        color: #374151;
      }
      select option:hover, select option:focus {
        background-color: #D1FAE5 !important;
        color: #065F46;
      }
      select option:checked {
        background-color: #10B981 !important;
        color: white;
      }
      
      input[type="date"]::-webkit-calendar-picker-indicator {
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 24 24" fill="none" stroke="%2310B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
        cursor: pointer;
        opacity: 0.8;
        width: 20px;
        height: 20px;
      }
      
      input[type="date"]::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={`min-h-screen ${dmSans.variable} ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${dmSans.className} ${theme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-emerald-800 to-teal-700'} shadow-lg transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-3 mb-4 md:mb-0"
            >
              <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-full flex items-center justify-center shadow-md transition-colors duration-300`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-7 w-7 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} transition-colors duration-300`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">CricConnect</h1>
            </motion.div>
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="mr-4 p-2 rounded-full bg-opacity-20 bg-white dark:bg-gray-800 dark:bg-opacity-20 text-white flex items-center justify-center"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>
              <motion.nav 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className={`flex space-x-1 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-emerald-700/50'} rounded-full p-1 shadow-md transition-colors duration-300`}
              >
                <motion.button
                  whileHover={{ backgroundColor: viewMode !== "matches" ? (theme === 'dark' ? "rgba(75, 85, 99, 0.8)" : "rgba(6, 95, 70, 0.8)") : undefined }}
                onClick={() => setViewMode("matches")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === "matches" 
                      ? theme === 'dark' 
                        ? "bg-gray-700 text-white shadow-md" 
                        : "bg-emerald-700 text-white shadow-md" 
                      : theme === 'dark'
                        ? "text-gray-300 hover:bg-gray-700" 
                        : "text-emerald-300 hover:bg-emerald-600"
                }`}
              >
                Find Matches
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: viewMode !== "profile" ? (theme === 'dark' ? "rgba(75, 85, 99, 0.8)" : "rgba(6, 95, 70, 0.8)") : undefined }}
                onClick={() => setViewMode("profile")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === "profile" 
                      ? theme === 'dark' 
                        ? "bg-gray-700 text-white shadow-md" 
                        : "bg-emerald-700 text-white shadow-md" 
                      : theme === 'dark'
                        ? "text-gray-300 hover:bg-gray-700" 
                        : "text-emerald-300 hover:bg-emerald-600"
                }`}
              >
                My Profile
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: viewMode !== "create" ? (theme === 'dark' ? "rgba(75, 85, 99, 0.8)" : "rgba(6, 95, 70, 0.8)") : undefined }}
                onClick={() => setViewMode("create")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    viewMode === "create" 
                      ? theme === 'dark' 
                        ? "bg-gray-700 text-white shadow-md" 
                        : "bg-emerald-700 text-white shadow-md" 
                      : theme === 'dark'
                        ? "text-gray-300 hover:bg-gray-700" 
                        : "text-emerald-300 hover:bg-emerald-600"
                }`}
              >
                Create Match
                </motion.button>
              </motion.nav>
            </div>
          </div>

          {/* Hero content */}
          {viewMode === "matches" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-3 mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-0">Find Your Perfect Cricket Match</h2>
              <p className="text-md text-emerald-100 max-w-2xl mx-auto">
                Join local games, meet new players, and enjoy the sport you love
              </p>
            </motion.div>
          )}
        </div>
      </motion.header>

      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 mt-2 ${dmSans.className}`}>
        <AnimatePresence mode="wait">
        {viewMode === "matches" && (
            <motion.div
              key="matches"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
              className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-emerald-700 to-teal-600'} text-white transition-colors duration-300`}>
                <div className={`px-6 py-8 sm:px-8 ${theme === 'dark' ? 'border-gray-700' : 'border-emerald-600/30'} transition-colors duration-300`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl leading-6 font-bold text-white">Find Matches</h3>
                      <p className={`mt-2 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-emerald-100'} transition-colors duration-300`}>
                        Browse available cricket matches in your area.
                      </p>
                    </div>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setViewMode("create")}
                      className={`bg-white text-sm font-medium rounded-md shadow px-4 py-2 flex items-center space-x-1 ${theme === 'dark' ? 'text-gray-800 hover:bg-gray-100' : 'text-emerald-700 hover:bg-emerald-50'} transition-colors duration-300`}
                    >
                      <span>Create Match</span>
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className={`mb-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300`}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                    <div className="sm:col-span-2">
                      <label htmlFor="search" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                        Search
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                          <Search className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          name="search"
                          id="search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`block w-full pl-10 py-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-emerald-500 focus:ring-emerald-500' : 'border-gray-300 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500'} sm:text-sm rounded-md transition-colors duration-300`}
                          placeholder="Search by ground or location"
                        />
                      </div>
                    </div>
                <div>
                      <label htmlFor="date-filter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                        Date
                  </label>
                  <select
                        id="date-filter"
                        name="date-filter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className={`mt-1 block w-full py-3 px-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-300`}
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="this-week">This Week</option>
                        <option value="next-week">Next Week</option>
                  </select>
                </div>
                <div>
                      <label htmlFor="location-filter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                        Area
                  </label>
                      <select
                        id="location-filter"
                        name="location-filter"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className={`mt-1 block w-full py-3 px-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-300`}
                      >
                        <option value="all">All Areas</option>
                        <option value="north">North</option>
                        <option value="south">South</option>
                        <option value="east">East</option>
                        <option value="west">West</option>
                        <option value="central">Central</option>
                      </select>
                </div>
                <div>
                      <label htmlFor="spots-filter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                        Available Spots
                  </label>
                  <select
                        id="spots-filter"
                        name="spots-filter"
                        value={spotsFilter}
                        onChange={(e) => setSpotsFilter(e.target.value)}
                        className={`mt-1 block w-full py-3 px-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors duration-300`}
                      >
                        <option value="all">Any</option>
                        <option value="1+">At least 1</option>
                        <option value="2+">At least 2</option>
                        <option value="5+">At least 5</option>
                        <option value="10+">At least 10</option>
                  </select>
                </div>
              </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={clearFilters}
                      className={`inline-flex items-center px-2.5 py-1.5 ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300`}
                    >
                Clear Filters
                    </motion.button>
                  </div>
            </div>

                <div className="space-y-6">
                  {filteredMatches.length === 0 ? (
                    <div className={`text-center py-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                      <SearchX className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className={`mt-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} transition-colors duration-300`}>No matches found</h3>
                      <p className="mt-1 text-sm">Try adjusting your search or filter criteria.</p>
                      <div className="mt-6">
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => setViewMode("create")}
                          className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md ${theme === 'dark' ? 'text-white bg-emerald-700 hover:bg-emerald-800' : 'text-white bg-emerald-600 hover:bg-emerald-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300`}
                        >
                          Create a match
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {filteredMatches.map((match, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          key={match.id}
                          className={`rounded-lg shadow-sm overflow-hidden ${theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'} transition-colors duration-300`}
                        >
                          <div className="px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                              <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>{match.groundName}</h3>
                              <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                match.spotsLeft === 0
                                  ? theme === 'dark' 
                                    ? 'bg-red-900 text-red-100' 
                                    : 'bg-red-100 text-red-800'
                                  : match.spotsLeft <= 2
                                  ? theme === 'dark'
                                    ? 'bg-yellow-700 text-yellow-100'
                                    : 'bg-yellow-100 text-yellow-800'
                                  : theme === 'dark'
                                    ? 'bg-green-700 text-green-100'
                                    : 'bg-green-100 text-green-800'
                              } transition-colors duration-300`}>
                                {match.spotsLeft === 0
                                  ? "Full"
                                  : `${match.spotsLeft} spot${match.spotsLeft !== 1 ? "s" : ""} left`}
                      </div>
                      </div>
                            <div className="mt-1 max-w-2xl">
                              <div className="flex items-center text-sm">
                                <MapPin className={`flex-shrink-0 mr-1.5 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>{match.location}</p>
                      </div>
                              <div className="mt-1 flex items-center text-sm">
                                <Calendar className={`flex-shrink-0 mr-1.5 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`} />
                                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
                                  {match.date} at {match.time}
                                </p>
                        </div>
                      </div>
                          </div>
                          <div className={`${theme === 'dark' ? 'border-t border-gray-600 bg-gray-800' : 'border-t border-gray-200 bg-gray-50'} px-4 py-4 sm:px-6 transition-colors duration-300`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {match.amenities.includes("water") && (
                                  <div className="flex items-center" title="Water available">
                                    <Droplet className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} transition-colors duration-300`} />
                        </div>
                                )}
                                {match.amenities.includes("parking") && (
                                  <div className="flex items-center" title="Parking available">
                                    <ParkingSquare className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`} />
                        </div>
                                )}
                                {match.amenities.includes("lights") && (
                                  <div className="flex items-center" title="Lights available">
                                    <Lightbulb className={`h-5 w-5 ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-500'} transition-colors duration-300`} />
                      </div>
                                )}
                    </div>
                              <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => handleJoinMatch(match.id)}
                                disabled={match.spotsLeft === 0 || match.participants.includes(currentUser.id)}
                                className={`${
                                  match.participants.includes(currentUser.id)
                                    ? theme === 'dark' 
                                      ? 'bg-emerald-700 text-white hover:bg-emerald-800' 
                                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : match.spotsLeft === 0
                                    ? theme === 'dark'
                                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : theme === 'dark'
                                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                      : 'bg-white text-emerald-700 hover:bg-emerald-50'
                                } inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300`}
                              >
                                {match.participants.includes(currentUser.id)
                                  ? "Joined"
                                  : match.spotsLeft === 0
                                  ? "Full"
                                  : "Join Match"}
                              </motion.button>
                        </div>
                        </div>
                        </motion.div>
                      ))}
                    </>
                      )}
                    </div>
                  </div>
            </motion.div>
        )}

        {viewMode === "profile" && (
            <motion.div
              key="profile"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg overflow-hidden border transition-colors duration-300`}
            >
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-emerald-700 to-teal-600'} text-white transition-colors duration-300`}>
                <div className={`px-6 py-8 sm:px-8 ${theme === 'dark' ? 'border-gray-700' : 'border-emerald-600/30'} border-b transition-colors duration-300`}>
                <h3 className="text-2xl leading-6 font-bold">Profile</h3>
                  <p className={`mt-2 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-emerald-100'} transition-colors duration-300`}>Your cricket match information and history.</p>
              </div>
              <div className="px-6 py-8 sm:p-8">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="flex items-center space-x-4"
                  >
                    <div className={`h-16 w-16 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} flex items-center justify-center shadow-lg transition-colors duration-300`}>
                      <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} transition-colors duration-300`}>{currentUser.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{currentUser.name}</h4>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-emerald-100'} transition-colors duration-300`}>{currentUser.email}</p>
                  </div>
                  </motion.div>
              </div>
            </div>

            <div className="px-6 py-8 sm:p-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mb-10"
                >
                  <h4 className={`text-xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 mr-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'} transition-colors duration-300`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                  Your Joined Matches
                </h4>
                {userJoinedMatches.length > 0 ? (
                  <div className="space-y-4">
                      {userJoinedMatches.map((match, index) => (
                        <motion.div
                        key={match.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                          className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border rounded-lg p-4 transition-colors`}
                          whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                              <h5 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{match.groundName}</h5>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{match.location}</p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                              {new Date(match.date).toLocaleDateString()} at {match.time}
                            </p>
                          </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-800'} transition-colors duration-300`}>
                            Joined
                          </span>
                        </div>
                        </motion.div>
                    ))}
                  </div>
                ) : (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className={`${theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'} p-4 rounded-lg transition-colors duration-300`}
                    >
                      You haven't joined any matches yet.
                    </motion.p>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="mb-10"
                >
                  <h4 className={`text-xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 mr-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-500'} transition-colors duration-300`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Your Organized Matches
                </h4>
                {userOrganizedMatches.length > 0 ? (
                  <div className="space-y-4">
                      {userOrganizedMatches.map((match, index) => (
                        <motion.div
                        key={match.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                          className={`${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border rounded-lg p-4 transition-colors`}
                          whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                              <h5 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{match.groundName}</h5>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{match.location}</p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                              {new Date(match.date).toLocaleDateString()} at {match.time}
                            </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2 transition-colors duration-300`}>
                              {match.spotsLeft} of {match.totalSpots} spots remaining
                            </p>
                          </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'} transition-colors duration-300`}>
                            Organizer
                          </span>
                        </div>
                        </motion.div>
                    ))}
                  </div>
                ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                      className={`${theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-50'} p-4 rounded-lg transition-colors duration-300`}
                    >
                      You haven't organized any matches yet.
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="mt-8"
                >
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  onClick={() => setViewMode("create")}
                    className={`inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white ${theme === 'dark' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create a New Match
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
        )}

        {viewMode === "create" && (
            <motion.div
              key="create"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
              className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg overflow-hidden border transition-colors duration-300`}
            >
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-emerald-700 to-teal-600'} text-white transition-colors duration-300`}>
                <div className={`px-6 py-8 sm:px-8 ${theme === 'dark' ? 'border-gray-700' : 'border-emerald-600/30'} border-b transition-colors duration-300`}>
                <h3 className="text-2xl leading-6 font-bold">Create a New Match</h3>
                  <p className={`mt-2 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-emerald-100'} transition-colors duration-300`}>
                  Fill in the details to organize a cricket match.
                </p>
              </div>
            </div>
            <div className="px-6 py-8 sm:p-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} p-6 rounded-xl border transition-colors duration-300`}
                >
                <div>
                    <label htmlFor="ground-name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                    Ground Name
                  </label>
                  <input
                    type="text"
                    name="ground-name"
                    id="ground-name"
                    value={newMatch.groundName}
                    onChange={(e) => setNewMatch({ ...newMatch, groundName: e.target.value })}
                      className={`mt-1 block w-full p-3 rounded-md ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 text-black'} shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-colors duration-300`}
                    placeholder="Enter ground name"
                  />
                </div>
                <div>
                    <label htmlFor="location" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={newMatch.location}
                    onChange={(e) => setNewMatch({ ...newMatch, location: e.target.value })}
                      className={`mt-1 block w-full rounded-md p-3 ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 text-black'} shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-colors duration-300`}
                    placeholder="City or area"
                  />
                </div>
                <div>
                    <label htmlFor="date" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    value={newMatch.date}
                    onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })}
                      className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 text-black'} p-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-colors duration-300`}
                  />
                </div>
                <div>
                    <label htmlFor="time" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    id="time"
                    value={newMatch.time}
                    onChange={(e) => setNewMatch({ ...newMatch, time: e.target.value })}
                      className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 text-black'} p-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-colors duration-300`}
                  />
                </div>
                <div>
                    <label htmlFor="total-spots" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                    Total Spots
                  </label>
                  <input
                    type="number"
                    name="total-spots"
                    id="total-spots"
                    value={newMatch.totalSpots}
                    onChange={(e) =>
                      setNewMatch({
                        ...newMatch,
                        totalSpots: Number.parseInt(e.target.value),
                        spotsLeft: Number.parseInt(e.target.value),
                      })
                    }
                      className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 text-black'} p-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-colors duration-300`}
                  />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={newMatch.description}
                    onChange={(e) => setNewMatch({ ...newMatch, description: e.target.value })}
                      className={`mt-1 block w-full rounded-md ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300 text-black'} shadow-sm p-3 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm transition-colors duration-300`}
                    placeholder="Describe your match, skill level required, etc."
                  />
                </div>
                <div className="sm:col-span-2">
                  <fieldset>
                      <legend className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>Amenities</legend>
                    <div className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 sm:grid-cols-3">
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                        <input
                          id="water"
                          name="water"
                          type="checkbox"
                          checked={newMatch.amenities.includes("water")}
                          onChange={() => toggleAmenity("water")}
                            className={`h-4 w-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} text-emerald-600 focus:ring-emerald-500 rounded transition-colors duration-300`}
                        />
                          <label htmlFor="water" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                          Water
                        </label>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                        <input
                          id="parking"
                          name="parking"
                          type="checkbox"
                          checked={newMatch.amenities.includes("parking")}
                          onChange={() => toggleAmenity("parking")}
                            className={`h-4 w-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} text-emerald-600 focus:ring-emerald-500 rounded transition-colors duration-300`}
                        />
                          <label htmlFor="parking" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                          Parking
                        </label>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                        <input
                          id="lights"
                          name="lights"
                          type="checkbox"
                          checked={newMatch.amenities.includes("lights")}
                          onChange={() => toggleAmenity("lights")}
                            className={`h-4 w-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} text-emerald-600 focus:ring-emerald-500 rounded transition-colors duration-300`}
                        />
                          <label htmlFor="lights" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                          Lights
                        </label>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                        <input
                          id="changing_rooms"
                          name="changing_rooms"
                          type="checkbox"
                          checked={newMatch.amenities.includes("changing_rooms")}
                          onChange={() => toggleAmenity("changing_rooms")}
                            className={`h-4 w-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} text-emerald-600 focus:ring-emerald-500 rounded transition-colors duration-300`}
                        />
                          <label htmlFor="changing_rooms" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                          Changing Rooms
                        </label>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
                        <input
                          id="equipment"
                          name="equipment"
                          type="checkbox"
                          checked={newMatch.amenities.includes("equipment")}
                          onChange={() => toggleAmenity("equipment")}
                            className={`h-4 w-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300'} text-emerald-600 focus:ring-emerald-500 rounded transition-colors duration-300`}
                        />
                          <label htmlFor="equipment" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                          Equipment
                        </label>
                        </motion.div>
                    </div>
                  </fieldset>
                </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-8 flex justify-end space-x-3"
                >
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  type="button"
                  onClick={() => setViewMode("matches")}
                    className={`inline-flex items-center px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-300`}
                >
                  Cancel
                  </motion.button>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  type="button"
                  onClick={handleCreateMatch}
                  disabled={!newMatch.groundName || !newMatch.location || !newMatch.date || !newMatch.time}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${theme === 'dark' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300`}
                >
                  Create Match
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className={`${dmSans.className} bg-gray-800 text-white mt-12`}
      >
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <motion.a 
                whileHover={{ y: -2, color: "#ffffff" }}
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.a>
              <motion.a 
                whileHover={{ y: -2, color: "#ffffff" }}
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.a>
              <motion.a 
                whileHover={{ y: -2, color: "#ffffff" }}
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </motion.a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} CricketConnect. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
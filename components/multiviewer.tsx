"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import OBSWebSocket from "obs-websocket-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, RefreshCw } from "lucide-react"

// Define the OBS connection type
interface OBSConnection {
  category: "primary" | "backup"
  address: string
  show: boolean
  name: string
  connected?: boolean
  screenshot?: string
  error?: string
  lastUpdate?: number
  lastAttemptTime?: number;
  sessionConnected?: boolean; // Track if we've connected in this session
  locked?: boolean; // Lock status to prevent reconnection attempts
}

// List of OBS connections
const obsConnections: OBSConnection[] = [
  // WIRECAST GEAR SENAYAN 100
  {
    category: "primary",
    address: "ws://192.168.40.178:4444",
    show: true,
    name: "WG 100 - Liga 1 IVM Persebaya VS Bali  (P)",
  },
  {
    category: "primary",
    address: "ws://192.168.40.178:4445",
    show: true,
    name: "WG 100 - Jelang Kick Off Persebaya VS Bali (P)",
  },
  {
    category: "primary",
    address: "ws://192.168.40.178:4446",
    show: false,
    name: "WG 100 - LaLiga : Valladolid vs Alaves | 15147 (P)",
  },

  // WIRECAST GEAR SENAYAN 101
  {
    category: "backup",
    address: "ws://192.168.40.177:4444",
    show: true,
    name: "WG 101 - Liga 1 IVM Persebaya VS Bali (B)",
  },
  {
    category: "backup",
    address: "ws://192.168.40.177:4445",
    show: false,
    name: "WG 101 - LaLiga : Las Palmas vs Leganes | 17323(B)",
  },
  {
    category: "backup",
    address: "ws://192.168.40.177:4446",
    show: false,
    name: "WG 101 - LaLiga : Valladolid vs Alaves | 15147 (B)",
  },

  // WIRECAST GEAR SENAYAN 102
  {
    category: "primary",
    address: "ws://192.168.40.33:4444",
    show: true,
    name: "WG 102 - Persija vs Malut United FC (P)",
  },
  {
    category: "primary",
    address: "ws://192.168.40.33:4445",
    show: true,
    name: "WG 102 - Jelang KO - Persija vs Malut United FC  (P)",
  },
  { category: "primary", address: "ws://192.168.40.33:4446", show: true, name: "WG 102 - PSM Makassar vs Persita (P)" },

  // WIRECAST GEAR SENAYAN 103
  {
    category: "backup",
    address: "ws://192.168.40.187:4444",
    show: true,
    name: "WG 103 - Persija vs Malut United FC (B)",
  },
  {
    category: "backup",
    address: "ws://192.168.40.187:4445",
    show: true,
    name: "WG 103 - Jelang KO - Persija vs Malut United FC (B)",
  },
  {
    category: "backup",
    address: "ws://192.168.40.187:4446",
    show: true,
    name: "WG 103 -  PSM Makassar vs Persita (B)",
  },

  // WIRECAST GEAR SENAYAN 104
  { category: "primary", address: "ws://192.168.40.46:4444", show: false, name: "WG 104 - BWF Court 1 (P)" },
  { category: "primary", address: "ws://192.168.40.46:4445", show: false, name: "WG 104 - BWF Court 2 (P)" },
  {
    category: "primary",
    address: "ws://192.168.40.46:4446",
    show: false,
    name: "WG 104 - Roma vs Milan - Serie A (P)",
  },

  // WIRECAST GEAR SENAYAN 105
  { category: "backup", address: "ws://192.168.40.45:4444", show: false, name: "WG 105 - BWF Court 1 (B)" },
  { category: "backup", address: "ws://192.168.40.45:4445", show: false, name: "WG 105 - BWF Court 2 (B) " },
  { category: "backup", address: "ws://192.168.40.45:4446", show: false, name: "WG 105 - Roma vs Milan - Serie A (B)" },

  // WIRECAST GEAR SENAYAN 106
  { category: "primary", address: "ws://192.168.40.19:4444", show: true, name: "WG 106 - One Champ (P)" },
  { category: "primary", address: "ws://192.168.40.19:4445", show: false, name: "WG 106 - BWF Court 4 (P)" },
  {
    category: "primary",
    address: "ws://192.168.40.19:4446",
    show: false,
    name: "WG 106 - UECL | Molde vs Legia | 18006 (P)",
  },

  // WIRECAST GEAR SENAYAN 107
  { category: "backup", address: "ws://192.168.40.186:4444", show: true, name: "WG 107 - One Champ (B)" },
  { category: "backup", address: "ws://192.168.40.186:4445", show: false, name: "WG 107 - BWF Court 4 (B)" },
  {
    category: "backup",
    address: "ws://192.168.40.186:4446",
    show: false,
    name: "WG 107 - UECL | Molde vs Legia | 18006 (B)",
  },

  // WIRECAST GEAR SENAYAN 108
  {
    category: "primary",
    address: "ws://192.168.40.49:4444",
    show: true,
    name: "WG 108 - Dewa United FC vs PSBS Biak (P)",
  },
  {
    category: "primary",
    address: "ws://192.168.40.49:4445",
    show: false,
    name: "WG 108 - LaLiga : Valencia vs Athletic Club | 17325 (P)",
  },
  { category: "primary", address: "ws://192.168.40.49:4446", show: false, name: "WG 108 - One | 16890 (P)" },

  // WIRECAST GEAR SENAYAN 109
  {
    category: "backup",
    address: "ws://192.168.40.185:4444",
    show: true,
    name: "WG 109 - Dewa United FC vs PSBS Biak (B)",
  },
  {
    category: "backup",
    address: "ws://192.168.40.185:4445",
    show: false,
    name: "WG 109 - LaLiga : Valencia vs Athletic Club | 17325  (B)",
  },
  { category: "backup", address: "ws://192.168.40.185:4446", show: false, name: "WG 109 - One | 16890 (B)" },

  // WIRECAST GEAR SENAYAN 110
  {
    category: "primary",
    address: "ws://192.168.40.48:4444",
    show: false,
    name: "WG 110 - Serie A : Cagliari vs Venezia | 18615 P",
  },
  {
    category: "primary",
    address: "ws://192.168.40.48:4445",
    show: false,
    name: "WG 110 - Serie A : Lecce vs Torino | 12726 (P)",
  },
  { category: "primary", address: "ws://192.168.40.48:4446", show: false, name: "WG 110 - APOEL vs Celje | 18200 (P)" },

  // WIRECAST GEAR SENAYAN 111
  {
    category: "backup",
    address: "ws://192.168.40.184:4444",
    show: false,
    name: "WG 111 - Serie A : Cagliari vs Venezia | 18615 (B)",
  },
  {
    category: "backup",
    address: "ws://192.168.40.184:4445",
    show: false,
    name: "WG 111 - Serie A : Lecce vs Torino (B)",
  },
  { category: "backup", address: "ws://192.168.40.184:4446", show: false, name: "WG 111 - IWF | 18148  (B)" },

  // WIRECAST GEAR SENAYAN 112
  {
    category: "backup",
    address: "ws://192.168.40.51:4444",
    show: false,
    name: "WG 112 - UECL | Vitoria SC vs Real Betis",
  },
  {
    category: "backup",
    address: "ws://192.168.40.51:4445",
    show: false,
    name: "WG 112 - Liga 2 - Bekasi vs Persikabo | 17947 (B)",
  },
  { category: "backup", address: "ws://192.168.40.51:4446", show: false, name: "WG 112 - APOEL vs Celje | 18200 (B)" },

  // WIRECAST GEAR SENAYAN 113
  { category: "backup", address: "ws://192.168.40.55:4444", show: false, name: "WG 113 - Event 1 (B)" },
  { category: "backup", address: "ws://192.168.40.55:4445", show: false, name: "WG 113 - Event 2 (B)" },
  { category: "backup", address: "ws://192.168.40.55:4446", show: false, name: "WG 113 - Event 3 (B)" },

  // WIRECAST GEAR SENAYAN 114
  { category: "primary", address: "ws://192.168.40.18:4444", show: false, name: "WG 114 - Testing PC Syauqi" },
  { category: "primary", address: "ws://192.168.40.18:4445", show: false, name: "WG 114 - Event 2 (P)" },
  { category: "primary", address: "ws://192.168.40.18:4446", show: false, name: "WG 114 - Event 3 (P)" },
]

export function Multiviewer() {
  const [connections, setConnections] = useState<Map<string, OBSConnection>>(new Map())
  const [filter, setFilter] = useState<"visible" | "all" | "primary" | "backup">("all")
  const obsInstancesRef = useRef<Map<string, OBSWebSocket>>(new Map())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const sessionConnectionsRef = useRef<Set<string>>(new Set()) // Track connections made in this session

  // Initialize connections map
  useEffect(() => {
    const initialConnections = new Map<string, OBSConnection>()
    obsConnections.forEach((conn) => {
      initialConnections.set(conn.address, { ...conn, locked: false })
    })
    setConnections(initialConnections)
  }, [])

  // Filter connections based on the selected filter
  const filteredConnections = Array.from(connections.values()).filter((conn) => {
    if (filter === "primary") return conn.category === "primary"
    if (filter === "backup") return conn.category === "backup"
    return true // 'all' filter
  })

  // Update a single connection without causing full re-render
  const updateConnection = useCallback((address: string, updates: Partial<OBSConnection>) => {
    setConnections((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(address)
      if (existing) {
        newMap.set(address, { ...existing, ...updates, lastUpdate: Date.now() })
      }
      return newMap
    })
  }, [])

  // Get screenshot from a single OBS instance
  const getScreenshotFromOBS = useCallback(
    async (conn: OBSConnection) => {
      // If connection is locked and already connected, just get the screenshot without reconnection attempts
      if (conn.locked && conn.connected) {
        try {
          const obs = obsInstancesRef.current.get(conn.address);
          if (obs && obs.identified) {
            // Just get the screenshot without reconnection logic
            const apiTimeout = 1500;
            
            try {
              const getScenePromise = obs.call("GetCurrentProgramScene");
              const sceneTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Get scene timeout")), apiTimeout)
              );
              
              const { currentProgramSceneName } = await Promise.race([getScenePromise, sceneTimeoutPromise]) as { currentProgramSceneName: string };
              
              const getScreenshotPromise = obs.call("GetSourceScreenshot", {
                sourceName: currentProgramSceneName,
                imageFormat: "jpg",
                imageWidth: 320,
                imageHeight: 180,
              });
              
              const screenshotTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Get screenshot timeout")), apiTimeout)
              );
              
              const { imageData } = await Promise.race([getScreenshotPromise, screenshotTimeoutPromise]) as { imageData: string };
              
              // Update only the screenshot
              updateConnection(conn.address, { screenshot: imageData });
            } catch (error) {
              // If screenshot fetch fails for a locked connection, unlock it to allow reconnection
              updateConnection(conn.address, { 
                locked: false,
                error: "Screenshot fetch failed - connection unlocked"
              });
            }
            return;
          }
        } catch (error) {
          // If any error occurs with a locked connection, unlock it
          updateConnection(conn.address, { 
            locked: false,
            connected: false,
            error: "Connection error - unlocked"
          });
        }
      }

      // Check if we've already connected to this OBS instance in this session
      if (sessionConnectionsRef.current.has(conn.address) && !obsInstancesRef.current.get(conn.address)?.identified) {
        // We've tried to connect in this session but it failed, don't retry constantly
        const cooldown = 30000; // 30 seconds between retries for failed connections
        const now = Date.now();
        
        if (conn.lastAttemptTime && now - conn.lastAttemptTime < cooldown) {
          return; // Skip until cooldown expires
        }
      }

      // Standard cooldown for connection attempts (5 seconds)
      const cooldown = 5000;
      const now = Date.now();

      // Check if enough time has passed since the last attempt
      if (conn.lastAttemptTime && now - conn.lastAttemptTime < cooldown) {
        // Too soon to attempt again, skip this interval cycle
        return;
      }

      // Update last attempt time before trying to connect
      updateConnection(conn.address, { lastAttemptTime: now });

      try {
        let obs = obsInstancesRef.current.get(conn.address);

        // Create new connection if it doesn't exist or is disconnected
        if (!obs || !obs.identified) {
          // If we've already tried to connect in this session and failed, don't keep trying constantly
          if (sessionConnectionsRef.current.has(conn.address) && !conn.sessionConnected) {
            updateConnection(conn.address, { 
              connected: false,
              error: "Connection failed - will retry later" 
            });
            return;
          }

          obs = new OBSWebSocket();
          obsInstancesRef.current.set(conn.address, obs);

          // Connect with timeout
          const connectPromise = obs.connect(conn.address, undefined, {
            rpcVersion: 1,
          })

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 2000),
          )

          await Promise.race([connectPromise, timeoutPromise])

          // Mark that we've connected in this session
          sessionConnectionsRef.current.add(conn.address);
          
          // Update connection status and lock it by default when successfully connected
          updateConnection(conn.address, { 
            connected: true, 
            error: undefined,
            sessionConnected: true,
            locked: true // Lock the connection once established
          });
        }

        // If connected (either just connected or already connected), get scene and screenshot
        if (obs && obs.identified) {
          const apiTimeout = 1500; // 1.5 second timeout for API calls

          const getScenePromise = obs.call("GetCurrentProgramScene");
          const getScreenshotPromise = (sceneName: string) => obs.call("GetSourceScreenshot", {
            sourceName: sceneName,
            imageFormat: "jpg",
            imageWidth: 320,
            imageHeight: 180,
          });

          const sceneTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Get scene timeout")), apiTimeout)
          );

          const { currentProgramSceneName } = await Promise.race([getScenePromise, sceneTimeoutPromise]) as { currentProgramSceneName: string };

          const screenshotTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Get screenshot timeout")), apiTimeout)
          );

          const { imageData } = await Promise.race([getScreenshotPromise(currentProgramSceneName), screenshotTimeoutPromise]) as { imageData: string };

          // Update only the screenshot and ensure connection is locked
          updateConnection(conn.address, { 
            screenshot: imageData, 
            error: undefined,
            locked: true
          });
        } else if (obs && !obs.identified) {
           // Handle case where connection was attempted but not identified (e.g., auth failure)
           sessionConnectionsRef.current.add(conn.address); // Mark that we've tried this session
           updateConnection(conn.address, {
              connected: false,
              error: "Connection not identified",
              sessionConnected: false,
              locked: false
            });
        }

      } catch (error) {
        // Connection or API call failed
        sessionConnectionsRef.current.add(conn.address); // Mark that we've tried this session
        
        const obs = obsInstancesRef.current.get(conn.address)
        if (obs) {
          // If the error was during connection, the instance might still be there but not identified
          // If the error was during API call, the instance might still be identified but the call failed
          // We keep the instance but mark it as not connected and show the error.

          updateConnection(conn.address, {
            connected: false,
            error: error instanceof Error ? error.message : "Unknown error",
            sessionConnected: false,
            locked: false
          });
        }
        // No need to delete the instance here, it's handled by the !obs.identified check on the next interval
      }
    },
    [updateConnection],
  )

  // Fetch screenshots from all connections in parallel
  const fetchAllScreenshots = useCallback(async () => {
    const promises = obsConnections.map((conn) => getScreenshotFromOBS(conn))
    await Promise.allSettled(promises)
  }, [getScreenshotFromOBS])

  // Start/stop the screenshot fetching interval
  useEffect(() => {
    // Initial fetch
    fetchAllScreenshots()

    // Set up interval - reduced from 125ms (8fps) to 1000ms (1fps) to reduce load
    intervalRef.current = setInterval(fetchAllScreenshots, 1000) 

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // Clean up OBS connections
      obsInstancesRef.current.forEach((obs) => {
        try {
          obs.disconnect()
        } catch {}
      })
      obsInstancesRef.current.clear()
    }
  }, [fetchAllScreenshots])

  // Manual refresh button handler
  const handleRefresh = useCallback(() => {
    // Clear session connections to allow reconnection attempts
    sessionConnectionsRef.current.clear();
    
    // Unlock all connections
    setConnections(prev => {
      const newMap = new Map(prev);
      for (const [address, conn] of newMap.entries()) {
        newMap.set(address, { ...conn, locked: false });
      }
      return newMap;
    });
    
    fetchAllScreenshots();
  }, [fetchAllScreenshots]);

  // Toggle lock for a specific connection
  const toggleLock = useCallback((address: string) => {
    setConnections(prev => {
      const newMap = new Map(prev);
      const conn = newMap.get(address);
      if (conn) {
        newMap.set(address, { ...conn, locked: !conn.locked });
      }
      return newMap;
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/Logo-Vidio-Apps.png" alt="Vidio Logo" className="h-8 w-auto" />
          <h1 className="text-2xl font-bold">OBS Multiviewer Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh All
          </Button>
          <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="primary">Primary</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-[10px]">
        {filteredConnections.map((conn) => (
          <Card
            key={conn.address}
            className={`overflow-hidden ${conn.connected ? "border-green-500" : "border-red-500"}`}
          >
            <CardContent className="p-0 relative">
              {conn.screenshot ? (
                <img
                  src={conn.screenshot || "/placeholder.svg"}
                  alt={conn.name}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                <div className="text-xs font-medium truncate">
                  {conn.name.split(" - ")[0]} - {conn.address.split(":").pop()}
                </div>
                <div className="text-xs text-gray-400 truncate">{conn.address}</div>
                {conn.error && <div className="text-xs text-red-400 truncate">{conn.error}</div>}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-5 w-5 p-0 ${conn.locked ? 'bg-yellow-500/20' : 'bg-transparent'}`}
                  onClick={() => toggleLock(conn.address)}
                  title={conn.locked ? "Connection locked (click to unlock)" : "Connection unlocked (click to lock)"}
                >
                  {conn.locked ? '🔒' : '🔓'}
                </Button>
                <span
                  className={`inline-block w-3 h-3 rounded-full ${conn.connected ? "bg-green-500" : "bg-red-500"}`}
                ></span>
              </div>
              <div className="absolute top-2 left-2">
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${conn.category === "primary" ? "bg-blue-600" : "bg-orange-600"}`}
                >
                  {conn.category}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

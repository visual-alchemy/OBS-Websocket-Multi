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
  connecting?: boolean; // Flag to indicate a connection attempt is in progress
  reconnectAttempts?: number; // Counter for reconnection attempts
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
  const connectionQueueRef = useRef<string[]>([]) // Queue for pending connections
  const processingConnectionRef = useRef<boolean>(false) // Flag to indicate if we're currently processing a connection

  // Initialize connections map
  useEffect(() => {
    const initialConnections = new Map<string, OBSConnection>()
    obsConnections.forEach((conn) => {
      initialConnections.set(conn.address, { 
        ...conn, 
        locked: false, 
        connecting: false,
        reconnectAttempts: 0
      })
    })
    setConnections(initialConnections)
  }, [])

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

  // Process the connection queue one at a time
  const processConnectionQueue = useCallback(async () => {
    if (processingConnectionRef.current || connectionQueueRef.current.length === 0) {
      return;
    }

    processingConnectionRef.current = true;
    const address = connectionQueueRef.current.shift();

    if (address) {
      try {
        const conn = connections.get(address);
        if (!conn) {
          processingConnectionRef.current = false;
          return;
        }

        // Skip if already connected or connecting
        if (obsInstancesRef.current.get(address)?.identified || conn.connecting) {
          processingConnectionRef.current = false;
          return;
        }

        // Check reconnect attempts - if too many, back off for longer
        const maxReconnectAttempts = 5;
        const reconnectAttempts = conn.reconnectAttempts || 0;
        
        if (reconnectAttempts >= maxReconnectAttempts) {
          // Too many reconnection attempts, back off for a longer time
          console.log(`Too many reconnect attempts for ${address}, backing off`);
          updateConnection(address, { 
            error: `Connection failed after ${reconnectAttempts} attempts - backing off`,
            reconnectAttempts: 0 // Reset counter but will try again later
          });
          
          processingConnectionRef.current = false;
          
          // Remove from queue and try again after a much longer delay
          setTimeout(() => {
            if (!connectionQueueRef.current.includes(address)) {
              connectionQueueRef.current.push(address);
              processConnectionQueue();
            }
          }, 60000); // 1 minute backoff
          
          return;
        }

        // Mark as connecting and increment reconnect attempts
        updateConnection(address, { 
          connecting: true,
          reconnectAttempts: reconnectAttempts + 1
        });

        // Clean up any existing instance
        const existingObs = obsInstancesRef.current.get(address);
        if (existingObs) {
          try {
            existingObs.disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
          obsInstancesRef.current.delete(address);
        }

        // Wait a moment before creating a new connection to ensure proper cleanup
        await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay for higher refresh rate

        // Create new instance
        const obs = new OBSWebSocket();
        
        // Set up event handlers before connecting
        obs.on('ConnectionClosed', () => {
          console.log(`Connection closed for ${address}`);
          updateConnection(address, {
            connected: false,
            locked: false,
            connecting: false,
            error: "Connection closed by OBS"
          });
          obsInstancesRef.current.delete(address);
        });

        obs.on('ConnectionError', (error) => {
          console.log(`Connection error for ${address}: ${error}`);
          updateConnection(address, {
            connected: false,
            locked: false,
            connecting: false,
            error: "Connection error"
          });
          obsInstancesRef.current.delete(address);
        });
        
        // Store the instance before connecting
        obsInstancesRef.current.set(address, obs);

        // Connect with timeout
        const connectPromise = obs.connect(address, undefined, {
          rpcVersion: 1,
          eventSubscriptions: 0, // Don't subscribe to any events to reduce load
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 5000), // Increased timeout
        );

        await Promise.race([connectPromise, timeoutPromise]);

        // Verify the connection is still valid after connecting
        if (!obs.identified) {
          throw new Error("Connection not identified after connect");
        }

        // Mark that we've connected in this session
        sessionConnectionsRef.current.add(address);
        
        // Update connection status and lock it by default when successfully connected
        updateConnection(address, { 
          connected: true, 
          error: undefined,
          sessionConnected: true,
          locked: true, // Lock the connection once established
          connecting: false
        });
        
        // Wait a moment before making API calls to ensure the connection is stable
        await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay for higher refresh rate

        // Get scene and screenshot
        const apiTimeout = 3000; // Increased timeout for API calls

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
          imageCompressionQuality: 70, // Add compression to reduce data size
        });

        const screenshotTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Get screenshot timeout")), apiTimeout)
        );

        const { imageData } = await Promise.race([getScreenshotPromise, screenshotTimeoutPromise]) as { imageData: string };

        // Update only the screenshot and ensure connection is locked
        updateConnection(address, { 
          screenshot: imageData, 
          error: undefined,
          locked: true
        });
      } catch (error) {
        // Connection or API call failed
        console.log(`Connection failed for ${address}: ${error instanceof Error ? error.message : "Unknown error"}`);
        sessionConnectionsRef.current.add(address); // Mark that we've tried this session
        
        // Clean up any failed connection attempt
        const obs = obsInstancesRef.current.get(address);
        if (obs) {
          try {
            obs.disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
          obsInstancesRef.current.delete(address);
        }
        
        // Get current reconnect attempts
        const conn = connections.get(address);
        const reconnectAttempts = conn?.reconnectAttempts || 0;
        
        updateConnection(address, {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
          sessionConnected: false,
          locked: false,
          connecting: false,
          reconnectAttempts: reconnectAttempts // Keep the counter
        });
      } finally {
        processingConnectionRef.current = false;
        
        // Process next in queue after a delay
        // Use a shorter delay for higher refresh rate
        setTimeout(() => {
          processConnectionQueue();
        }, 500); // Reduced delay between connection attempts
      }
    } else {
      processingConnectionRef.current = false;
    }
  }, [connections, updateConnection]);

  // Get screenshot from a single OBS instance
  const getScreenshotFromOBS = useCallback(
    async (conn: OBSConnection) => {
      // If connection is locked and already connected, just get the screenshot without reconnection attempts
      if (conn.locked && conn.connected) {
        try {
          const obs = obsInstancesRef.current.get(conn.address);
          if (obs && obs.identified) {
            // Just get the screenshot without reconnection logic
            const apiTimeout = 3000; // Increased timeout
            
            try {
              // For active connections, we'll use a more efficient approach
              // Skip getting the scene name if we already have a screenshot
              // This reduces the number of API calls by half for active connections
              let currentProgramSceneName;
              
              if (conn.screenshot) {
                // If we already have a screenshot, assume the scene hasn't changed
                // This is a performance optimization
                currentProgramSceneName = "Current";
              } else {
                // If we don't have a screenshot yet, get the scene name
                const getScenePromise = obs.call("GetCurrentProgramScene");
                const sceneTimeoutPromise = new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Get scene timeout")), apiTimeout)
                );
                
                const result = await Promise.race([getScenePromise, sceneTimeoutPromise]) as { currentProgramSceneName: string };
                currentProgramSceneName = result.currentProgramSceneName;
              }
              
              const getScreenshotPromise = obs.call("GetSourceScreenshot", {
                sourceName: currentProgramSceneName,
                imageFormat: "jpg",
                imageWidth: 320,
                imageHeight: 180,
                imageCompressionQuality: 70, // Add compression to reduce data size
              });
              
              const screenshotTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Get screenshot timeout")), apiTimeout)
              );
              
              const { imageData } = await Promise.race([getScreenshotPromise, screenshotTimeoutPromise]) as { imageData: string };
              
              // Update only the screenshot
              updateConnection(conn.address, { screenshot: imageData });
            } catch (error) {
              console.log(`Screenshot fetch error for ${conn.address}: ${error instanceof Error ? error.message : "Unknown error"}`);
              
              // Check if the error is due to a disconnection
              if (obs && !obs.identified) {
                // Connection was lost, unlock it and mark as disconnected
                updateConnection(conn.address, { 
                  locked: false,
                  connected: false,
                  error: "Connection lost - will retry later"
                });
                
                // Remove the instance
                obsInstancesRef.current.delete(conn.address);
              } else {
                // If the error mentions "not valid", we need to get the scene name again
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                if (errorMessage.includes("not valid") || errorMessage.includes("not found")) {
                  // Force refresh the scene name on next update
                  updateConnection(conn.address, { 
                    screenshot: undefined,
                    error: "Refreshing scene..."
                  });
                } else {
                  // Just a screenshot fetch error, keep the connection
                  updateConnection(conn.address, { 
                    error: "Screenshot fetch failed - connection maintained"
                  });
                }
              }
            }
            return;
          } else {
            // Connection was marked as locked but obs is no longer identified
            // This could happen if OBS closed the connection
            updateConnection(conn.address, { 
              locked: false,
              connected: false,
              error: "Connection lost - will retry later"
            });
            
            // Remove the instance
            obsInstancesRef.current.delete(conn.address);
          }
        } catch (error) {
          console.log(`Error with locked connection ${conn.address}: ${error instanceof Error ? error.message : "Unknown error"}`);
          
          // If any error occurs with a locked connection, unlock it
          updateConnection(conn.address, { 
            locked: false,
            connected: false,
            error: "Connection error - unlocked"
          });
          
          // Remove the instance
          obsInstancesRef.current.delete(conn.address);
        }
        return; // Important: return here to prevent reconnection attempts for locked connections
      }

      // Skip if currently connecting
      if (conn.connecting) {
        return;
      }

      // Check if we've already connected to this OBS instance in this session
      if (sessionConnectionsRef.current.has(conn.address) && !obsInstancesRef.current.get(conn.address)?.identified) {
        // We've tried to connect in this session but failed, don't retry constantly
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

      // Check if we already have a valid connection for this address
      const existingObs = obsInstancesRef.current.get(conn.address);
      if (existingObs && existingObs.identified) {
        // We already have a valid connection, just update the status
        updateConnection(conn.address, { 
          connected: true,
          locked: true,
          sessionConnected: true
        });
        
        // Get the screenshot using the existing connection
        try {
          const apiTimeout = 2000; // Increased timeout
          
          const getScenePromise = existingObs.call("GetCurrentProgramScene");
          const sceneTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Get scene timeout")), apiTimeout)
          );
          
          const { currentProgramSceneName } = await Promise.race([getScenePromise, sceneTimeoutPromise]) as { currentProgramSceneName: string };
          
          const getScreenshotPromise = existingObs.call("GetSourceScreenshot", {
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
          updateConnection(conn.address, { 
            screenshot: imageData,
            error: undefined
          });
          return;
        } catch (error) {
          // If screenshot fetch fails, check if the connection is still valid
          if (!existingObs.identified) {
            // Connection was lost, remove it
            obsInstancesRef.current.delete(conn.address);
            updateConnection(conn.address, {
              connected: false,
              locked: false,
              error: "Connection lost during screenshot fetch"
            });
          }
        }
        return;
      }

      // Update last attempt time before trying to connect
      updateConnection(conn.address, { lastAttemptTime: now });

      // Add to connection queue if not already in queue
      if (!connectionQueueRef.current.includes(conn.address)) {
        connectionQueueRef.current.push(conn.address);
        processConnectionQueue();
      }
    },
    [updateConnection, processConnectionQueue],
  );

  // Fetch screenshots from all connections in parallel
  const fetchAllScreenshots = useCallback(async () => {
    // Process existing connections first
    const connectedPromises = Array.from(connections.values())
      .filter(conn => conn.connected && obsInstancesRef.current.get(conn.address)?.identified)
      .map(conn => getScreenshotFromOBS(conn));
    
    // Use Promise.all instead of Promise.allSettled for better performance
    // This will continue even if some promises reject
    try {
      await Promise.all(connectedPromises.map(p => p.catch(e => console.log('Screenshot fetch error:', e))));
    } catch (e) {
      // Ignore errors
    }
    
    // Then try to connect to disconnected ones (one at a time via queue)
    const disconnectedConnections = Array.from(connections.values())
      .filter(conn => !conn.connected && !conn.connecting);
    
    for (const conn of disconnectedConnections) {
      if (!connectionQueueRef.current.includes(conn.address)) {
        connectionQueueRef.current.push(conn.address);
      }
    }
    
    // Start processing the queue if not already processing
    if (!processingConnectionRef.current) {
      processConnectionQueue();
    }
  }, [getScreenshotFromOBS, connections, processConnectionQueue]);

  // Start/stop the screenshot fetching interval
  useEffect(() => {
    // Initial fetch
    fetchAllScreenshots()

    // Set up interval - update at 6fps (every ~167ms)
    intervalRef.current = setInterval(fetchAllScreenshots, 167) 

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      // Clean up OBS connections
      obsInstancesRef.current.forEach((obs) => {
        try {
          if (obs.identified) {
            obs.disconnect()
          }
        } catch (e) {
          // Ignore disconnect errors
        }
      })
      obsInstancesRef.current.clear()
      sessionConnectionsRef.current.clear()
      connectionQueueRef.current = []
      processingConnectionRef.current = false
    }
  }, [fetchAllScreenshots])

  // Manual refresh button handler
  const handleRefresh = useCallback(() => {
    // Clear session connections to allow reconnection attempts
    sessionConnectionsRef.current.clear();
    
    // Unlock all connections and reset reconnect attempts
    setConnections(prev => {
      const newMap = new Map(prev);
      for (const [address, conn] of newMap.entries()) {
        newMap.set(address, { 
          ...conn, 
          locked: false, 
          connecting: false,
          reconnectAttempts: 0 // Reset reconnect attempts on manual refresh
        });
      }
      return newMap;
    });
    
    // Clear the connection queue
    connectionQueueRef.current = [];
    processingConnectionRef.current = false;
    
    // Clean up existing connections
    obsInstancesRef.current.forEach((obs) => {
      try {
        obs.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    });
    obsInstancesRef.current.clear();
    
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

  // Filter connections based on the selected filter and connection status
  const activeConnections = Array.from(connections.values()).filter((conn) => {
    // Active connections are those that are connected
    if (!conn.connected) return false;
    
    // Apply category filter if needed
    if (filter === "primary") return conn.category === "primary"
    if (filter === "backup") return conn.category === "backup"
    return true; // 'all' filter
  });

  const inactiveConnections = Array.from(connections.values()).filter((conn) => {
    // Inactive connections are those that are not connected
    if (conn.connected) return false;
    
    // Apply category filter if needed
    if (filter === "primary") return conn.category === "primary"
    if (filter === "backup") return conn.category === "backup"
    return true; // 'all' filter
  });

  // Count active feeds
  const activeCount = activeConnections.length;
  // Count total feeds
  const totalCount = obsConnections.length;
  // Count hidden feeds
  const hiddenCount = inactiveConnections.length;

  return (
    <div className="space-y-6">
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

      {/* Active Feeds Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Active Feeds <span className="text-sm font-normal text-gray-400">({activeCount} feeds • Updates every 167ms (6fps))</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-[10px]">
          {activeConnections.map((conn) => (
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

      {/* Hidden/Inactive Feeds Section */}
      {inactiveConnections.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Hidden Feeds <span className="text-sm font-normal text-gray-400">({hiddenCount})</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[10px]">
            {inactiveConnections.map((conn) => (
              <div 
                key={conn.address} 
                className={`flex items-center p-2 rounded border ${conn.category === "primary" ? "border-blue-600" : "border-orange-600"} bg-gray-900`}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={`inline-block min-w-[12px] w-3 h-3 rounded-full bg-red-500`}></span>
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-medium">
                        {conn.name.split(" - ")[0]}
                        <span className={`ml-2 text-[10px] px-1 py-0.5 rounded ${conn.category === "primary" ? "bg-blue-600" : "bg-orange-600"}`}>
                          {conn.category === "primary" ? "P" : "B"}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      {conn.address.replace('ws://', '')}
                    </div>
                    {conn.error && <div className="text-[10px] text-red-400 truncate">Connection failed - will retry later</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

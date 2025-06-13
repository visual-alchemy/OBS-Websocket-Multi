# gh0st-project - OBS Multiviewer Dashboard

## Description

A web-based dashboard for monitoring multiple OBS Studio instances via WebSocket. This application provides a grid view of live screenshots from configured OBS sources, allowing users to quickly check the status and content of various streams or recordings.

## Features

*   **Multiviewer:** Displays live screenshots from multiple OBS instances in a responsive grid.
*   **Connection Status:** Visual indicators show the connection status (connected/disconnected) for each OBS instance.
*   **Categorized Filtering:** Filter displays by "All" (showing connected instances), "Primary", and "Backup" categories.
*   **Real-time Updates:** Screenshots update automatically at approximately 8 frames per second.
*   **Automatic Reconnection:** Attempts to reconnect to OBS instances if the connection is lost.
*   **Connection Cooldown:** Implements a cooldown period between connection attempts to prevent flooding the OBS server.
*   **Customizable Display Name:** Each display card shows a simplified name based on the OBS gear number and port.
*   **Dark Theme:** Default dark theme for a monitoring dashboard environment.

## Technologies Used

*   Next.js
*   React
*   TypeScript
*   Tailwind CSS
*   Radix UI
*   obs-websocket-js (for OBS integration)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd gh0st-project
    ```
2.  **Install dependencies:**
    ```bash
    npm install # or yarn install or pnpm install
    ```
3.  **Place your logo:**
    Ensure your logo file, `Logo-Vidio-Apps.png`, is placed in the `public` directory.
    ```bash
    cp /path/to/your/Logo-Vidio-Apps.png public/
    ```
4.  **Configure OBS Instances:**
    Edit the `obsConnections` array in `components/multiviewer.tsx` to add or modify the details of your OBS instances (address, category, name, show). The `show` property currently affects only the initial state; the "All" filter shows only connected instances regardless of `show`, while "Primary" and "Backup" show all instances in their category.
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
6.  **Open in your browser:**
    Navigate to `http://localhost:3000` (or the port indicated in your terminal).

## Configuration

OBS instances are configured in the `obsConnections` array within `components/multiviewer.tsx`. Each object in the array represents an OBS connection with the following properties:

*   `category`: `"primary" | "backup"` - The category of the OBS instance.
*   `address`: `string` - The WebSocket address of the OBS instance (e.g., `"ws://192.168.40.178:4444"`).
*   `show`: `boolean` - Initially determines if the connection is intended to be shown (currently only affects initial state before connections are established and filtered).
*   `name`: `string` - A descriptive name for the connection (used partially for the display name).

## Credits

*   Inspired by other OBS web control projects.
*   Uses the `obs-websocket-js` library for communication with OBS Studio.

## License

[Specify your license here. For example: MIT License, GPL, or state if it's Unlicensed/Proprietary.]
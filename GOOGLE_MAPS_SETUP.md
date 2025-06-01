# Google Maps Setup Instructions

## Getting a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Maps JavaScript API:
   - Go to APIs & Services > Library
   - Search for "Maps JavaScript API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. (Optional but recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:*` for development)

## Setting up the Environment Variable

1. Open the `.env` file in your project root
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
3. Restart your development server

## Features

The Google Map component will:
- Display a map centered on the listing's location (city, region, country)
- Show a marker at the approximate location
- Adjust zoom level based on location specificity (higher zoom for city, lower for region/country)
- Handle loading states and error cases
- Fall back gracefully if the location cannot be geocoded

## Security Note

Keep your API key secure and never commit it to version control. Consider using environment-specific keys for development and production.

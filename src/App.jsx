import { useState, useEffect } from 'react';
import { getAirlineInfo } from './airlines';
import './index.css';

// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const toRadian = angle => (Math.PI / 180) * angle;
  const radLat1 = toRadian(lat1);
  const radLat2 = toRadian(lat2);
  const deltaLat = toRadian(lat2 - lat1);
  const deltaLon = toRadian(lon2 - lon1);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

function App() {
  const [status, setStatus] = useState('idle'); // idle, locating, fetching, complete, error
  const [errorText, setErrorText] = useState('');
  const [flightData, setFlightData] = useState(null);

  const startTracking = () => {
    setStatus('locating');
    setErrorText('');
    setFlightData(null);

    if (!navigator.geolocation) {
      setErrorText('Geolocation is not supported by your browser.');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchFlights(latitude, longitude);
      },
      (error) => {
        console.error("GPS Error:", error);
        setErrorText(`Location access denied or unavailable (${error.message}). We need your location to find the aircraft above you.`);
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const fetchFlights = async (lat, lon) => {
    setStatus('fetching');
    try {
      // Create a bounding box of roughly ~55km around the user (+/- 0.5 degrees)
      const latMin = lat - 0.5;
      const latMax = lat + 0.5;
      const lonMin = lon - 0.5;
      const lonMax = lon + 0.5;

      const url = `https://opensky-network.org/api/states/all?lamin=${latMin}&lomin=${lonMin}&lamax=${latMax}&lomax=${lonMax}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OpenSky API responded with ${response.status}`);
      }

      const data = await response.json();

      if (!data.states || data.states.length === 0) {
        setErrorText('No aircraft found in your immediate vicinity right now.');
        setStatus('error');
        return;
      }

      // Find the closest aircraft
      let closestAircraft = null;
      let minDistance = Infinity;

      data.states.forEach(state => {
        const flightLat = state[6];
        const flightLon = state[5];
        if (flightLat && flightLon) {
          const distance = calculateDistance(lat, lon, flightLat, flightLon);
          if (distance < minDistance) {
            minDistance = distance;
            closestAircraft = state;
          }
        }
      });

      if (!closestAircraft) {
        setErrorText('Could not determine exact positions of nearby aircraft.');
        setStatus('error');
        return;
      }

      setFlightData({
        details: closestAircraft,
        distanceMeters: minDistance
      });
      setStatus('complete');
    } catch (err) {
      console.error("Fetch Error:", err);
      setErrorText(`Failed to fetch flight data: ${err.message}. The free OpenSky API may be rate limiting us.`);
      setStatus('error');
    }
  };

  const renderContent = () => {
    if (status === 'idle') {
      return (
        <button className="action-button" onClick={startTracking}>
          Identify the Aircraft Above Me
        </button>
      );
    }

    if (status === 'locating' || status === 'fetching') {
      return (
        <div className="radar-container">
          <div className="radar-circle radar-circle-1"></div>
          <div className="radar-circle radar-circle-2"></div>
          <div className="radar-circle radar-circle-3"></div>
          <div className="radar-sweep"></div>
          <div className="radar-dot"></div>
          <div className="loading-text">
            {status === 'locating' ? 'Acquiring GPS Signal...' : 'Scanning Skies (OpenSky Network)...'}
          </div>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <>
          <div className="error-text">{errorText}</div>
          <button className="action-button" style={{ marginTop: '2rem' }} onClick={startTracking}>
            Try Again
          </button>
        </>
      );
    }

    if (status === 'complete' && flightData) {
      const [
        icao24, callsignRaw, originCountry, timePosition, lastContact,
        long, lat, baroAltitude, onGround, velocity, trueTrack,
        verticalRate, sensors, geoAltitude, squawk, spi, positionSource
      ] = flightData.details;

      const callsign = callsignRaw ? callsignRaw.trim() : '';
      const distanceMiles = (flightData.distanceMeters * 0.000621371).toFixed(1);
      const altitudeFeet = baroAltitude ? Math.round(baroAltitude * 3.28084) : 'Unknown';
      const speedMph = velocity ? Math.round(velocity * 2.23694) : 'Unknown';

      const airlineDescription = getAirlineInfo(callsign);
      const activeCallsign = callsign || icao24.toUpperCase();

      return (
        <div className="result-container">
          <div className="result-card">
            <h2 className="aircraft-callsign">{activeCallsign}</h2>
            <div className="aircraft-description">
              You are most likely hearing <strong>{airlineDescription}</strong> flight
              {altitudeFeet !== 'Unknown' ? ` cruising at ${altitudeFeet.toLocaleString()} ft` : ''}
              {speedMph !== 'Unknown' ? ` at ${speedMph} mph` : ''},
              originating from {originCountry}.
            </div>

            <div className="aircraft-meta">
              <div className="meta-item">
                <span className="meta-label">Distance</span>
                <span className="meta-value">{distanceMiles} miles away</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Altitude</span>
                <span className="meta-value">{altitudeFeet !== 'Unknown' ? `${altitudeFeet.toLocaleString()} ft` : 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Speed</span>
                <span className="meta-value">{speedMph !== 'Unknown' ? `${speedMph} mph` : 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Heading</span>
                <span className="meta-value">{trueTrack ? `${Math.round(trueTrack)}°` : 'N/A'}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="action-button" onClick={startTracking}>
              Scan Again
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <h1>SkyScanner</h1>
        <div className="subtitle">Discover what's flying directly above you right now</div>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;

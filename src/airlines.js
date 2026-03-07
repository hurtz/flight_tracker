export const getAirlineInfo = (callsign) => {
    if (!callsign || typeof callsign !== 'string') return null;
    const cleanCallsign = callsign.trim().toUpperCase();
    const prefix3 = cleanCallsign.substring(0, 3);
    const prefix2 = cleanCallsign.substring(0, 2);

    const airlines = {
        'AAL': 'American Airlines',
        'DAL': 'Delta Air Lines',
        'UAL': 'United Airlines',
        'SWA': 'Southwest Airlines',
        'JBU': 'JetBlue Airways',
        'NKS': 'Spirit Airlines',
        'FFT': 'Frontier Airlines',
        'ASA': 'Alaska Airlines',
        'AAY': 'Allegiant Air',
        'ACA': 'Air Canada',
        'WJA': 'WestJet',
        'BAW': 'British Airways',
        'AFR': 'Air France',
        'DLH': 'Lufthansa',
        'KLM': 'KLM Royal Dutch Airlines',
        'VIR': 'Virgin Atlantic',
        'UAE': 'Emirates',
        'QFA': 'Qantas',
        'ROT': 'Tarom',
        'EZY': 'easyJet',
        'RYR': 'Ryanair',
        'SKW': 'SkyWest Airlines',
        'RPA': 'Republic Airways',
        'EDV': 'Endeavor Air',
        'ENY': 'Envoy Air',
        'JIA': 'PSA Airlines',
        'ASH': 'Mesa Airlines',
        'PDT': 'Piedmont Airlines',
        'EIA': 'Evergreen International',
        'FDX': 'FedEx Express',
        'UPS': 'UPS Airlines',
        'GTI': 'Atlas Air',
        'ABB': 'ABX Air',
        'PAC': 'Polar Air Cargo',
        'ABW': 'AirBridgeCargo',
        'CJT': 'Cargojet',
        'JZA': 'Jazz Aviation',
        'QXE': 'Horizon Air',
        'CPZ': 'Compass Airlines',
        'GJS': 'GoJet Airlines',
        'SNC': 'Sierra Nevada Corporation',
        'NASA': 'NASA',
        'N7': 'a private aircraft',
        'N8': 'a private aircraft',
        'N9': 'a private aircraft',
        'N1': 'a private aircraft',
        'N2': 'a private aircraft',
        'N3': 'a private aircraft',
        'N4': 'a private aircraft',
        'N5': 'a private aircraft',
        'N6': 'a private aircraft',
    };

    if (airlines[prefix3]) {
        return airlines[prefix3];
    }
    if (airlines[prefix2]) {
        return airlines[prefix2];
    }

    if (cleanCallsign.startsWith('N') && !isNaN(cleanCallsign.charAt(1))) {
        return 'a private US aircraft';
    }

    return 'an unidentified aircraft';
};

export interface TrainRoute {
  trainNumber: string;
  trainName: string;
  fromCity: string;
  fromStation: string;
  fromCode: string;
  toCity: string;
  toStation: string;
  toCode: string;
  departure: string;
  arrival: string;
  durationHours: number;
  distanceKm: number;
  frequency: string;
  classes: { SL?: number; '3A'?: number; '2A'?: number; '1A'?: number; CC?: number; EC?: number; '2S'?: number };
  notes?: string;
}

const ROUTES: TrainRoute[] = [
  // ── Delhi ↔ Jaipur ────────────────────────────────────────────────────────
  { trainNumber: '12015', trainName: 'Ajmer Shatabdi Express', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Jaipur', toStation: 'Jaipur Jn', toCode: 'JP', departure: '06:05', arrival: '10:35', durationHours: 4.5, distanceKm: 308, frequency: 'Daily except Sun', classes: { CC: 755, EC: 1420 }, notes: 'Fastest option; breakfast served onboard' },
  { trainNumber: '12462', trainName: 'Mandore SF Express', fromCity: 'Delhi', fromStation: 'Hazrat Nizamuddin', fromCode: 'NZM', toCity: 'Jaipur', toStation: 'Jaipur Jn', toCode: 'JP', departure: '21:05', arrival: '03:30', durationHours: 6.4, distanceKm: 308, frequency: 'Daily', classes: { SL: 295, '3A': 775, '2A': 1115 } },
  // ── Delhi ↔ Agra ─────────────────────────────────────────────────────────
  { trainNumber: '12002', trainName: 'Bhopal Shatabdi Express', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Agra', toStation: 'Agra Cantt', toCode: 'AGC', departure: '06:00', arrival: '08:10', durationHours: 2.2, distanceKm: 200, frequency: 'Daily except Sun', classes: { CC: 695, EC: 1400 }, notes: 'Fastest Delhi–Agra train' },
  { trainNumber: '12050', trainName: 'Gatimaan Express', fromCity: 'Delhi', fromStation: 'Hazrat Nizamuddin', fromCode: 'NZM', toCity: 'Agra', toStation: 'Agra Cantt', toCode: 'AGC', departure: '08:10', arrival: '09:50', durationHours: 1.7, distanceKm: 188, frequency: 'Daily except Fri', classes: { CC: 755, EC: 1505 }, notes: "India's fastest train 160 km/h; check-in 30 min before" },
  { trainNumber: '12627', trainName: 'Karnataka Express', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Agra', toStation: 'Agra Cantt', toCode: 'AGC', departure: '21:30', arrival: '00:30', durationHours: 3.0, distanceKm: 200, frequency: 'Daily', classes: { SL: 250, '3A': 665, '2A': 955 } },
  // ── Delhi ↔ Varanasi ─────────────────────────────────────────────────────
  { trainNumber: '12560', trainName: 'Shivganga SF Express', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Varanasi', toStation: 'Varanasi Jn', toCode: 'BSB', departure: '18:40', arrival: '07:05', durationHours: 12.4, distanceKm: 783, frequency: 'Daily', classes: { SL: 360, '3A': 945, '2A': 1360 } },
  { trainNumber: '15001', trainName: 'Poorvanchal Express', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Varanasi', toStation: 'Varanasi Jn', toCode: 'BSB', departure: '20:55', arrival: '08:10', durationHours: 11.2, distanceKm: 783, frequency: 'Daily', classes: { SL: 380, '3A': 1020, '2A': 1455 } },
  // ── Delhi ↔ Amritsar ─────────────────────────────────────────────────────
  { trainNumber: '12013', trainName: 'Amritsar Shatabdi', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Amritsar', toStation: 'Amritsar Jn', toCode: 'ASR', departure: '07:20', arrival: '13:20', durationHours: 6.0, distanceKm: 449, frequency: 'Daily', classes: { CC: 1015, EC: 2010 }, notes: 'Meals included' },
  { trainNumber: '12031', trainName: 'Amritsar Express', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Amritsar', toStation: 'Amritsar Jn', toCode: 'ASR', departure: '22:30', arrival: '07:00', durationHours: 8.5, distanceKm: 449, frequency: 'Daily', classes: { SL: 250, '3A': 660, '2A': 945 } },
  // ── Delhi ↔ Chandigarh (for Shimla/Manali) ───────────────────────────────
  { trainNumber: '12011', trainName: 'Kalka Shatabdi', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Chandigarh', toStation: 'Chandigarh', toCode: 'CDG', departure: '07:40', arrival: '11:05', durationHours: 3.4, distanceKm: 248, frequency: 'Daily', classes: { CC: 680, EC: 1350 }, notes: 'Continue to Kalka (30 min) then toy train to Shimla' },
  // ── Delhi ↔ Dehradun (for Haridwar/Rishikesh) ────────────────────────────
  { trainNumber: '12017', trainName: 'Dehradun Shatabdi', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Dehradun', toStation: 'Dehradun', toCode: 'DDN', departure: '06:50', arrival: '11:55', durationHours: 5.1, distanceKm: 302, frequency: 'Daily', classes: { CC: 815, EC: 1605 } },
  { trainNumber: '12055', trainName: 'Dehradun Jan Shatabdi', fromCity: 'Delhi', fromStation: 'New Delhi', fromCode: 'NDLS', toCity: 'Haridwar', toStation: 'Haridwar Jn', toCode: 'HW', departure: '15:20', arrival: '20:15', durationHours: 4.9, distanceKm: 289, frequency: 'Daily', classes: { CC: 640, '2S': 255 } },
  // ── Delhi ↔ Mumbai ────────────────────────────────────────────────────────
  { trainNumber: '12951', trainName: 'Mumbai Rajdhani', fromCity: 'Delhi', fromStation: 'Hazrat Nizamuddin', fromCode: 'NZM', toCity: 'Mumbai', toStation: 'Mumbai Central', toCode: 'MMCT', departure: '16:25', arrival: '08:15', durationHours: 15.8, distanceKm: 1384, frequency: 'Daily', classes: { '3A': 1980, '2A': 2870, '1A': 4930 }, notes: 'Meals included; best overnight train' },
  { trainNumber: '12953', trainName: 'August Kranti Rajdhani', fromCity: 'Delhi', fromStation: 'Hazrat Nizamuddin', fromCode: 'NZM', toCity: 'Mumbai', toStation: 'Mumbai Central', toCode: 'MMCT', departure: '17:00', arrival: '10:55', durationHours: 17.9, distanceKm: 1384, frequency: 'Daily', classes: { '3A': 1980, '2A': 2870, '1A': 4930 } },
  // ── Mumbai ↔ Goa ──────────────────────────────────────────────────────────
  { trainNumber: '10103', trainName: 'Mandovi Express', fromCity: 'Mumbai', fromStation: 'Chhatrapati Shivaji Terminus', fromCode: 'CSTM', toCity: 'Goa', toStation: 'Madgaon', toCode: 'MAO', departure: '07:10', arrival: '20:00', durationHours: 12.8, distanceKm: 582, frequency: 'Daily', classes: { SL: 285, '3A': 790, '2A': 1125 }, notes: 'Scenic Konkan railway route' },
  { trainNumber: '12133', trainName: 'Mangalore Express', fromCity: 'Mumbai', fromStation: 'Chhatrapati Shivaji Terminus', fromCode: 'CSTM', toCity: 'Goa', toStation: 'Madgaon', toCode: 'MAO', departure: '22:00', arrival: '09:25', durationHours: 11.4, distanceKm: 582, frequency: 'Daily', classes: { SL: 310, '3A': 830, '2A': 1195 } },
  // ── Mumbai ↔ Pune ─────────────────────────────────────────────────────────
  { trainNumber: '12127', trainName: 'Intercity Express', fromCity: 'Mumbai', fromStation: 'Chhatrapati Shivaji Terminus', fromCode: 'CSTM', toCity: 'Pune', toStation: 'Pune Jn', toCode: 'PUNE', departure: '06:10', arrival: '08:15', durationHours: 2.1, distanceKm: 192, frequency: 'Daily', classes: { CC: 290, '2S': 155 } },
  { trainNumber: '12025', trainName: 'Pune Shatabdi', fromCity: 'Mumbai', fromStation: 'Chhatrapati Shivaji Terminus', fromCode: 'CSTM', toCity: 'Pune', toStation: 'Pune Jn', toCode: 'PUNE', departure: '07:10', arrival: '09:45', durationHours: 2.6, distanceKm: 192, frequency: 'Daily', classes: { CC: 445, EC: 890 } },
  // ── Mumbai ↔ Aurangabad ───────────────────────────────────────────────────
  { trainNumber: '12071', trainName: 'Jan Shatabdi Express', fromCity: 'Mumbai', fromStation: 'Chhatrapati Shivaji Terminus', fromCode: 'CSTM', toCity: 'Aurangabad', toStation: 'Aurangabad', toCode: 'AWB', departure: '06:25', arrival: '12:35', durationHours: 6.2, distanceKm: 335, frequency: 'Daily except Tue', classes: { '2S': 285, CC: 580 } },
  // ── Chennai ↔ Bengaluru ───────────────────────────────────────────────────
  { trainNumber: '12163', trainName: 'Chennai Express', fromCity: 'Chennai', fromStation: 'Chennai Central', fromCode: 'MAS', toCity: 'Bengaluru', toStation: 'KSR Bengaluru', toCode: 'SBC', departure: '06:00', arrival: '10:45', durationHours: 4.8, distanceKm: 362, frequency: 'Daily', classes: { CC: 535, '3A': 1435 } },
  { trainNumber: '12639', trainName: 'Brindavan Express', fromCity: 'Chennai', fromStation: 'Chennai Central', fromCode: 'MAS', toCity: 'Bengaluru', toStation: 'KSR Bengaluru', toCode: 'SBC', departure: '07:45', arrival: '13:05', durationHours: 5.3, distanceKm: 362, frequency: 'Daily', classes: { CC: 390, '2S': 145 } },
  // ── Chennai ↔ Madurai ─────────────────────────────────────────────────────
  { trainNumber: '12637', trainName: 'Pandian SF Express', fromCity: 'Chennai', fromStation: 'Chennai Egmore', fromCode: 'MS', toCity: 'Madurai', toStation: 'Madurai Jn', toCode: 'MDU', departure: '21:40', arrival: '05:30', durationHours: 7.8, distanceKm: 462, frequency: 'Daily', classes: { SL: 300, '3A': 815, '2A': 1175 } },
  // ── Chennai ↔ Coimbatore (for Ooty) ─────────────────────────────────────
  { trainNumber: '12671', trainName: 'Nilgiri Express', fromCity: 'Chennai', fromStation: 'Chennai Central', fromCode: 'MAS', toCity: 'Coimbatore', toStation: 'Coimbatore Jn', toCode: 'CBE', departure: '20:00', arrival: '05:50', durationHours: 9.8, distanceKm: 493, frequency: 'Daily', classes: { SL: 280, '3A': 770, '2A': 1105 }, notes: 'Continue on Nilgiri Mountain Railway to Ooty' },
  // ── Bengaluru ↔ Mysuru ────────────────────────────────────────────────────
  { trainNumber: '12007', trainName: 'Shatabdi Express', fromCity: 'Bengaluru', fromStation: 'KSR Bengaluru', fromCode: 'SBC', toCity: 'Mysuru', toStation: 'Mysuru Jn', toCode: 'MYS', departure: '11:00', arrival: '13:15', durationHours: 2.3, distanceKm: 139, frequency: 'Daily', classes: { CC: 360, EC: 715 } },
  { trainNumber: '16021', trainName: 'Kaveri Express', fromCity: 'Bengaluru', fromStation: 'KSR Bengaluru', fromCode: 'SBC', toCity: 'Mysuru', toStation: 'Mysuru Jn', toCode: 'MYS', departure: '07:15', arrival: '10:15', durationHours: 3.0, distanceKm: 139, frequency: 'Daily', classes: { SL: 190, '2S': 115 } },
  // ── Bengaluru ↔ Goa ───────────────────────────────────────────────────────
  { trainNumber: '17301', trainName: 'Dharwad Express', fromCity: 'Bengaluru', fromStation: 'KSR Bengaluru', fromCode: 'SBC', toCity: 'Goa', toStation: 'Madgaon', toCode: 'MAO', departure: '19:20', arrival: '08:15', durationHours: 12.9, distanceKm: 580, frequency: 'Daily', classes: { SL: 310, '3A': 845, '2A': 1210 } },
  // ── Kolkata ↔ Darjeeling (via NJP) ───────────────────────────────────────
  { trainNumber: '13149', trainName: 'Kanchenjunga Express', fromCity: 'Kolkata', fromStation: 'Sealdah', fromCode: 'SDAH', toCity: 'New Jalpaiguri', toStation: 'New Jalpaiguri', toCode: 'NJP', departure: '07:05', arrival: '20:45', durationHours: 13.7, distanceKm: 567, frequency: 'Daily', classes: { SL: 275, '3A': 755, '2A': 1090 }, notes: 'Take DHR toy train NJP→Darjeeling (5-6 hrs, ₹250 2nd class)' },
  // ── Kolkata ↔ Puri ────────────────────────────────────────────────────────
  { trainNumber: '12837', trainName: 'Howrah-Puri Express', fromCity: 'Kolkata', fromStation: 'Howrah', fromCode: 'HWH', toCity: 'Puri', toStation: 'Puri', toCode: 'PURI', departure: '22:30', arrival: '07:35', durationHours: 9.1, distanceKm: 501, frequency: 'Daily', classes: { SL: 245, '3A': 660, '2A': 955 } },
  // ── Jaipur ↔ Jodhpur ──────────────────────────────────────────────────────
  { trainNumber: '14853', trainName: 'Marudhar Express', fromCity: 'Jaipur', fromStation: 'Jaipur Jn', fromCode: 'JP', toCity: 'Jodhpur', toStation: 'Jodhpur Jn', toCode: 'JU', departure: '22:45', arrival: '05:00', durationHours: 6.3, distanceKm: 320, frequency: 'Daily', classes: { SL: 235, '3A': 640, '2A': 925 } },
  { trainNumber: '12465', trainName: 'Ranthambore Express', fromCity: 'Jaipur', fromStation: 'Jaipur Jn', fromCode: 'JP', toCity: 'Jodhpur', toStation: 'Jodhpur Jn', toCode: 'JU', departure: '05:45', arrival: '12:00', durationHours: 6.3, distanceKm: 320, frequency: 'Daily', classes: { SL: 235, '3A': 640 } },
  // ── Jaipur ↔ Udaipur ──────────────────────────────────────────────────────
  { trainNumber: '12991', trainName: 'Udaipur City Express', fromCity: 'Jaipur', fromStation: 'Jaipur Jn', fromCode: 'JP', toCity: 'Udaipur', toStation: 'Udaipur City', toCode: 'UDZ', departure: '11:00', arrival: '16:20', durationHours: 5.3, distanceKm: 330, frequency: 'Daily', classes: { SL: 245, '3A': 660, '2A': 950 } },
  // ── Jodhpur ↔ Jaisalmer ───────────────────────────────────────────────────
  { trainNumber: '14810', trainName: 'Jaisalmer Express', fromCity: 'Jodhpur', fromStation: 'Jodhpur Jn', fromCode: 'JU', toCity: 'Jaisalmer', toStation: 'Jaisalmer', toCode: 'JSM', departure: '23:00', arrival: '05:45', durationHours: 6.8, distanceKm: 295, frequency: 'Daily', classes: { SL: 220, '3A': 610 } },
  // ── Kochi ↔ Thiruvananthapuram ────────────────────────────────────────────
  { trainNumber: '12625', trainName: 'Kerala Express', fromCity: 'Kochi', fromStation: 'Ernakulam Jn', fromCode: 'ERS', toCity: 'Thiruvananthapuram', toStation: 'Thiruvananthapuram Central', toCode: 'TVC', departure: '09:55', arrival: '14:10', durationHours: 4.2, distanceKm: 224, frequency: 'Daily', classes: { SL: 195, '3A': 540, '2A': 775 } },
  // ── Hyderabad ↔ Bengaluru ─────────────────────────────────────────────────
  { trainNumber: '12785', trainName: 'Kaghaznagar Express', fromCity: 'Hyderabad', fromStation: 'Kacheguda', fromCode: 'KCG', toCity: 'Bengaluru', toStation: 'KSR Bengaluru', toCode: 'SBC', departure: '22:15', arrival: '07:30', durationHours: 9.3, distanceKm: 575, frequency: 'Daily', classes: { SL: 295, '3A': 790, '2A': 1130 } },
  // ── Ahmedabad ↔ Mumbai ────────────────────────────────────────────────────
  { trainNumber: '12009', trainName: 'Shatabdi Express', fromCity: 'Ahmedabad', fromStation: 'Ahmedabad Jn', fromCode: 'ADI', toCity: 'Mumbai', toStation: 'Mumbai Central', toCode: 'MMCT', departure: '06:25', arrival: '12:55', durationHours: 6.5, distanceKm: 491, frequency: 'Daily except Sun', classes: { CC: 1010, EC: 2000 } },
];

export function findTrainRoutes(fromCity: string, toCity: string): TrainRoute[] {
  const normalizeCity = (c: string) =>
    c.toLowerCase()
      .replace(/\bjunction\b/g, '')
      .replace(/\bcantt\b/g, '')
      .replace(/\bcity\b/g, '')
      .replace(/kolkata|calcutta/g, 'kolkata')
      .replace(/mumbai|bombay/g, 'mumbai')
      .replace(/bengaluru|bangalore/g, 'bengaluru')
      .replace(/chennai|madras/g, 'chennai')
      .trim();

  const from = normalizeCity(fromCity);
  const to = normalizeCity(toCity);

  const forward = ROUTES.filter(
    (r) => normalizeCity(r.fromCity) === from && normalizeCity(r.toCity) === to
  );
  if (forward.length > 0) return forward;

  // Return reverse routes with swapped fields
  return ROUTES
    .filter((r) => normalizeCity(r.fromCity) === to && normalizeCity(r.toCity) === from)
    .map((r) => ({
      ...r,
      fromCity: r.toCity, fromStation: r.toStation, fromCode: r.toCode,
      toCity: r.fromCity, toStation: r.fromStation, toCode: r.fromCode,
      departure: r.arrival, arrival: r.departure,
    }));
}

export function formatTrainsForLLM(routes: TrainRoute[]): string {
  if (!routes.length) return '';
  return routes
    .slice(0, 3)
    .map((r) => {
      const prices = Object.entries(r.classes)
        .map(([cls, price]) => `${cls} ₹${price}`)
        .join(', ');
      return `  • ${r.trainNumber} ${r.trainName}: ${r.fromCode} ${r.departure} → ${r.toCode} ${r.arrival} (${r.durationHours}h, ${r.distanceKm}km) | ${prices}${r.notes ? ' | ' + r.notes : ''}`;
    })
    .join('\n');
}

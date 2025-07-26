// Free Maps Service using OpenStreetMap (No API key required)
// Perfect alternative to Mapbox - completely free and unlimited

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface RoutePoint {
  location: Location;
  vendorId?: string;
  estimatedTime?: number;
  distance?: number;
}

export interface OptimizedRoute {
  points: RoutePoint[];
  totalDistance: number;
  totalTime: number;
  optimizationScore: number;
}

export class MapsService {
  private static instance: MapsService;
  
  static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService();
    }
    return MapsService.instance;
  }

  // Geocoding using free Nominatim API (OpenStreetMap)
  async geocodeAddress(address: string): Promise<Location | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          address: data[0].display_name
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Reverse geocoding - get address from coordinates
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Simple route optimization using nearest neighbor algorithm
  optimizeRoute(startPoint: Location, destinations: Location[]): OptimizedRoute {
    if (destinations.length === 0) {
      return {
        points: [{ location: startPoint }],
        totalDistance: 0,
        totalTime: 0,
        optimizationScore: 100
      };
    }

    const unvisited = [...destinations];
    const route: RoutePoint[] = [{ location: startPoint }];
    let currentLocation = startPoint;
    let totalDistance = 0;

    // Nearest neighbor algorithm for route optimization
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        unvisited[0].latitude,
        unvisited[0].longitude
      );

      // Find nearest unvisited location
      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          unvisited[i].latitude,
          unvisited[i].longitude
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      // Add nearest location to route
      const nextLocation = unvisited[nearestIndex];
      route.push({
        location: nextLocation,
        distance: nearestDistance,
        estimatedTime: this.estimateTravelTime(nearestDistance)
      });

      totalDistance += nearestDistance;
      currentLocation = nextLocation;
      unvisited.splice(nearestIndex, 1);
    }

    const totalTime = this.estimateTravelTime(totalDistance);
    const optimizationScore = this.calculateOptimizationScore(route);

    return {
      points: route,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalTime: Math.round(totalTime),
      optimizationScore
    };
  }

  // Estimate travel time based on distance (assuming mixed city traffic)
  private estimateTravelTime(distanceKm: number): number {
    // Assuming average speed of 20 km/h in city traffic
    const averageSpeedKmh = 20;
    return Math.round((distanceKm / averageSpeedKmh) * 60); // Return minutes
  }

  // Calculate optimization score (0-100)
  private calculateOptimizationScore(route: RoutePoint[]): number {
    if (route.length <= 2) return 100;

    // Simple scoring based on route efficiency
    // In a real implementation, this would be more sophisticated
    const totalDistance = route.reduce((sum, point) => sum + (point.distance || 0), 0);
    const directDistance = this.calculateDistance(
      route[0].location.latitude,
      route[0].location.longitude,
      route[route.length - 1].location.latitude,
      route[route.length - 1].location.longitude
    );

    const efficiency = directDistance / totalDistance;
    return Math.round(efficiency * 100);
  }

  // Get route between two points using OSRM (free routing service)
  async getRoute(start: Location, end: Location): Promise<RoutePoint[]> {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=false&steps=true`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return [
          { location: start },
          { 
            location: end, 
            distance: route.distance / 1000, // Convert to km
            estimatedTime: Math.round(route.duration / 60) // Convert to minutes
          }
        ];
      }
      
      // Fallback to direct route
      const distance = this.calculateDistance(
        start.latitude, start.longitude,
        end.latitude, end.longitude
      );
      
      return [
        { location: start },
        { 
          location: end, 
          distance,
          estimatedTime: this.estimateTravelTime(distance)
        }
      ];
    } catch (error) {
      console.error('Routing error:', error);
      
      // Fallback to direct route calculation
      const distance = this.calculateDistance(
        start.latitude, start.longitude,
        end.latitude, end.longitude
      );
      
      return [
        { location: start },
        { 
          location: end, 
          distance,
          estimatedTime: this.estimateTravelTime(distance)
        }
      ];
    }
  }

  // Demo data for testing (Delhi area)
  static getDemoLocations(): Location[] {
    return [
      { latitude: 28.6139, longitude: 77.2090, address: "Connaught Place, New Delhi" },
      { latitude: 28.6562, longitude: 77.2410, address: "Chandni Chowk, Delhi" },
      { latitude: 28.5355, longitude: 77.3910, address: "Noida Sector 18" },
      { latitude: 28.4595, longitude: 77.0266, address: "Gurgaon Cyber City" },
      { latitude: 28.7041, longitude: 77.1025, address: "Azadpur Mandi, Delhi" }
    ];
  }
}

// Usage example:
// const mapsService = MapsService.getInstance();
// const route = mapsService.optimizeRoute(startLocation, vendorLocations);
// console.log(`Optimized route: ${route.totalDistance}km, ${route.totalTime} minutes`);
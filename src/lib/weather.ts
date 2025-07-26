// Weather Service using your free API keys
// WeatherAPI: 1M calls/month free
// OpenWeatherMap: 1K calls/day free

export interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string; // 'sunny', 'rainy', 'cloudy', etc.
  description: string;
  icon: string;
}

export interface WeatherForecast {
  date: Date;
  weather: WeatherData;
  maxTemp: number;
  minTemp: number;
}

export interface DemandImpact {
  productCategory: string;
  impactType: 'increase' | 'decrease' | 'neutral';
  percentage: number;
  reason: string;
}

export class WeatherService {
  private static instance: WeatherService;
  private weatherApiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "b8a2b48ebddd40c2a3d62104252607";
  private openWeatherKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "902b521f57dcca73bfb3bf35b9dca3ff";
  
  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  // Get current weather using WeatherAPI (primary)
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${this.weatherApiKey}&q=${latitude},${longitude}&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error('WeatherAPI failed');
      }
      
      const data = await response.json();
      
      return {
        temperature: data.current.temp_c,
        humidity: data.current.humidity,
        precipitation: data.current.precip_mm,
        windSpeed: data.current.wind_kph,
        condition: this.normalizeCondition(data.current.condition.text),
        description: data.current.condition.text,
        icon: data.current.condition.icon
      };
    } catch (error) {
      console.error('WeatherAPI error, trying OpenWeatherMap:', error);
      return this.getCurrentWeatherFallback(latitude, longitude);
    }
  }

  // Fallback to OpenWeatherMap
  private async getCurrentWeatherFallback(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.openWeatherKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('OpenWeatherMap failed');
      }
      
      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        precipitation: 0, // OpenWeatherMap doesn't provide current precipitation
        windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
        condition: this.normalizeCondition(data.weather[0].main),
        description: data.weather[0].description,
        icon: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`
      };
    } catch (error) {
      console.error('Both weather APIs failed:', error);
      return this.getMockWeatherData();
    }
  }

  // Get weather forecast using WeatherAPI
  async getWeatherForecast(latitude: number, longitude: number, days: number = 3): Promise<WeatherForecast[]> {
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${this.weatherApiKey}&q=${latitude},${longitude}&days=${days}&aqi=no&alerts=no`
      );
      
      if (!response.ok) {
        throw new Error('WeatherAPI forecast failed');
      }
      
      const data = await response.json();
      
      return data.forecast.forecastday.map((day: { 
        date: string; 
        day: { 
          avgtemp_c: number; 
          avghumidity: number; 
          totalprecip_mm: number; 
          maxwind_kph: number; 
          maxtemp_c: number;
          mintemp_c: number;
          condition: { text: string; icon: string } 
        } 
      }) => ({
        date: new Date(day.date),
        weather: {
          temperature: day.day.avgtemp_c,
          humidity: day.day.avghumidity,
          precipitation: day.day.totalprecip_mm,
          windSpeed: day.day.maxwind_kph,
          condition: this.normalizeCondition(day.day.condition.text),
          description: day.day.condition.text,
          icon: day.day.condition.icon
        },
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c
      }));
    } catch (error) {
      console.error('Weather forecast error:', error);
      return this.getMockForecastData(days);
    }
  }

  // Analyze weather impact on demand
  analyzeDemandImpact(weather: WeatherData): DemandImpact[] {
    const impacts: DemandImpact[] = [];

    // Temperature-based impacts
    if (weather.temperature > 35) {
      impacts.push({
        productCategory: 'beverages',
        impactType: 'increase',
        percentage: 25,
        reason: 'Hot weather increases cold drink demand'
      });
      impacts.push({
        productCategory: 'vegetables',
        impactType: 'decrease',
        percentage: 10,
        reason: 'Hot weather reduces fresh vegetable sales'
      });
    } else if (weather.temperature < 15) {
      impacts.push({
        productCategory: 'hot_snacks',
        impactType: 'increase',
        percentage: 20,
        reason: 'Cold weather increases hot snack demand'
      });
    }

    // Precipitation-based impacts
    if (weather.precipitation > 5 || weather.condition === 'rainy') {
      impacts.push({
        productCategory: 'vegetables',
        impactType: 'decrease',
        percentage: 15,
        reason: 'Rain reduces foot traffic and vegetable sales'
      });
      impacts.push({
        productCategory: 'fried_snacks',
        impactType: 'increase',
        percentage: 10,
        reason: 'Rainy weather increases comfort food demand'
      });
    }

    // Humidity-based impacts
    if (weather.humidity > 80) {
      impacts.push({
        productCategory: 'dairy',
        impactType: 'decrease',
        percentage: 12,
        reason: 'High humidity reduces dairy product demand'
      });
    }

    // Wind-based impacts
    if (weather.windSpeed > 25) {
      impacts.push({
        productCategory: 'all',
        impactType: 'decrease',
        percentage: 8,
        reason: 'Strong winds reduce overall foot traffic'
      });
    }

    return impacts;
  }

  // Normalize weather conditions to standard categories
  private normalizeCondition(condition: string): string {
    const normalized = condition.toLowerCase();
    
    if (normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('shower')) {
      return 'rainy';
    } else if (normalized.includes('cloud') || normalized.includes('overcast')) {
      return 'cloudy';
    } else if (normalized.includes('sun') || normalized.includes('clear')) {
      return 'sunny';
    } else if (normalized.includes('storm') || normalized.includes('thunder')) {
      return 'stormy';
    } else if (normalized.includes('fog') || normalized.includes('mist')) {
      return 'foggy';
    } else if (normalized.includes('snow')) {
      return 'snowy';
    }
    
    return 'partly_cloudy';
  }

  // Mock weather data for demo/fallback
  private getMockWeatherData(): WeatherData {
    return {
      temperature: 28,
      humidity: 65,
      precipitation: 0,
      windSpeed: 12,
      condition: 'partly_cloudy',
      description: 'Partly cloudy',
      icon: '/weather-icons/partly-cloudy.png'
    };
  }

  // Mock forecast data for demo/fallback
  private getMockForecastData(days: number): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const baseDate = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      forecasts.push({
        date,
        weather: {
          temperature: 25 + Math.random() * 10,
          humidity: 60 + Math.random() * 20,
          precipitation: Math.random() * 5,
          windSpeed: 10 + Math.random() * 10,
          condition: ['sunny', 'partly_cloudy', 'cloudy'][Math.floor(Math.random() * 3)],
          description: 'Mock weather data',
          icon: '/weather-icons/default.png'
        },
        maxTemp: 30 + Math.random() * 8,
        minTemp: 20 + Math.random() * 5
      });
    }
    
    return forecasts;
  }

  // Get weather-based procurement recommendations
  getRecommendations(weather: WeatherData, forecast: WeatherForecast[]): string[] {
    const recommendations: string[] = [];
    const impacts = this.analyzeDemandImpact(weather);
    
    impacts.forEach(impact => {
      if (impact.impactType === 'increase') {
        recommendations.push(
          `📈 Increase ${impact.productCategory} by ${impact.percentage}% - ${impact.reason}`
        );
      } else if (impact.impactType === 'decrease') {
        recommendations.push(
          `📉 Reduce ${impact.productCategory} by ${impact.percentage}% - ${impact.reason}`
        );
      }
    });

    // Forecast-based recommendations
    const tomorrowWeather = forecast[1]?.weather;
    if (tomorrowWeather) {
      if (tomorrowWeather.condition === 'rainy') {
        recommendations.push('🌧️ Rain expected tomorrow - stock more indoor snacks, reduce fresh vegetables');
      } else if (tomorrowWeather.temperature > 35) {
        recommendations.push('🌡️ Hot day tomorrow - increase cold beverages and ice cream');
      }
    }
    
    return recommendations;
  }
}

// Usage example:
// const weatherService = WeatherService.getInstance();
// const weather = await weatherService.getCurrentWeather(28.6139, 77.2090);
// const impacts = weatherService.analyzeDemandImpact(weather);
// console.log('Weather impacts:', impacts);
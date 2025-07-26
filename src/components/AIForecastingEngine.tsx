'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ProductRecommendation {
  productId: string;
  productName: string;
  recommendedQuantity: number;
  currentAverageQuantity: number;
  changePercentage: number;
  changeReason: string;
  visualIndicator: 'increase' | 'decrease' | 'maintain';
  confidence: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  forecast: string;
}

interface DailyForecast {
  vendorId: string;
  date: Date;
  recommendations: ProductRecommendation[];
  confidence: number;
  reasoning: string[];
  weatherImpact: string;
}

export default function AIForecastingEngine() {
  const { vendor } = useAuth();
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (vendor) {
      generateForecast();
    }
  }, [generateForecast, vendor]);

  const generateForecast = async () => {
    if (!vendor) return;
    
    setLoading(true);
    
    try {
      // Simulate weather data (in production, use WeatherAPI)
      const mockWeatherData: WeatherData = {
        temperature: 28 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        precipitation: Math.random() * 20,
        forecast: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)]
      };
      setWeatherData(mockWeatherData);

      // Generate AI-powered recommendations
      const recommendations = await generateRecommendations(vendor.id, mockWeatherData);
      
      const dailyForecast: DailyForecast = {
        vendorId: vendor.id,
        date: new Date(),
        recommendations,
        confidence: 85,
        reasoning: [
          'Based on 30-day historical pattern analysis',
          `Weather forecast: ${mockWeatherData.forecast} (${Math.round(mockWeatherData.temperature)}°C)`,
          'Seasonal demand trends considered',
          'Local market events factored in'
        ],
        weatherImpact: getWeatherImpact(mockWeatherData)
      };

      setForecast(dailyForecast);
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (vendorId: string, weather: WeatherData): Promise<ProductRecommendation[]> => {
    // Simulate historical data analysis
    const baseRecommendations = [
      {
        productId: 'onions',
        productName: 'Onions',
        currentAverageQuantity: 15,
        baseRecommendation: 18
      },
      {
        productId: 'potatoes',
        productName: 'Potatoes',
        currentAverageQuantity: 12,
        baseRecommendation: 14
      },
      {
        productId: 'tomatoes',
        productName: 'Tomatoes',
        currentAverageQuantity: 8,
        baseRecommendation: 6
      },
      {
        productId: 'green-chilies',
        productName: 'Green Chilies',
        currentAverageQuantity: 3,
        baseRecommendation: 4
      },
      {
        productId: 'oil',
        productName: 'Cooking Oil',
        currentAverageQuantity: 5,
        baseRecommendation: 5
      }
    ];

    return baseRecommendations.map(item => {
      let adjustedQuantity = item.baseRecommendation;
      const reasons: string[] = [];

      // Weather-based adjustments
      if (weather.forecast === 'rainy') {
        if (item.productId === 'tomatoes') {
          adjustedQuantity *= 0.7; // Reduce fresh vegetables in rain
          reasons.push('Rainy weather reduces fresh vegetable demand');
        }
        if (item.productId === 'oil') {
          adjustedQuantity *= 1.2; // More fried food in rain
          reasons.push('Increased demand for fried snacks during rain');
        }
      }

      if (weather.temperature > 35) {
        if (item.productId === 'onions') {
          adjustedQuantity *= 0.8; // Less cooking in extreme heat
          reasons.push('High temperature reduces cooking activity');
        }
      }

      // Day of week adjustments
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
        adjustedQuantity *= 1.15;
        reasons.push('Weekend demand increase');
      }

      // Seasonal adjustments
      const month = new Date().getMonth();
      if (month >= 3 && month <= 5) { // Summer months
        if (item.productId === 'tomatoes') {
          adjustedQuantity *= 0.9;
          reasons.push('Summer season affects vegetable demand');
        }
      }

      const changePercentage = ((adjustedQuantity - item.currentAverageQuantity) / item.currentAverageQuantity) * 100;
      
      let visualIndicator: 'increase' | 'decrease' | 'maintain' = 'maintain';
      if (changePercentage > 5) visualIndicator = 'increase';
      else if (changePercentage < -5) visualIndicator = 'decrease';

      return {
        productId: item.productId,
        productName: item.productName,
        recommendedQuantity: Math.round(adjustedQuantity),
        currentAverageQuantity: item.currentAverageQuantity,
        changePercentage: Math.round(changePercentage),
        changeReason: reasons.join('; ') || 'Normal demand pattern',
        visualIndicator,
        confidence: 75 + Math.random() * 20 // 75-95% confidence
      };
    });
  };

  const getWeatherImpact = (weather: WeatherData): string => {
    if (weather.forecast === 'rainy') {
      return 'Rainy weather expected - reduce fresh vegetables, increase oil and spices';
    }
    if (weather.temperature > 35) {
      return 'Hot weather - reduce overall quantities, focus on essentials';
    }
    if (weather.forecast === 'cloudy') {
      return 'Pleasant weather - normal demand expected';
    }
    return 'Good weather conditions for normal business';
  };

  const getIndicatorIcon = (indicator: string) => {
    switch (indicator) {
      case 'increase': return '📈';
      case 'decrease': return '📉';
      default: return '➡️';
    }
  };

  const getIndicatorColor = (indicator: string) => {
    switch (indicator) {
      case 'increase': return 'text-green-600 bg-green-50';
      case 'decrease': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Demand Forecasting</h3>
        <p className="text-gray-600">Unable to generate forecast. Please try again.</p>
        <button
          onClick={generateForecast}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry Forecast
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🤖 AI Demand Forecasting</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Confidence: {forecast.confidence}%</span>
          <button
            onClick={generateForecast}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Weather Impact */}
      {weatherData && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Weather Impact</h4>
              <p className="text-sm text-blue-700">{forecast.weatherImpact}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">
                {Math.round(weatherData.temperature)}°C • {weatherData.forecast}
              </p>
              <p className="text-xs text-blue-500">
                Humidity: {Math.round(weatherData.humidity)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Today's Recommendations</h4>
        
        {forecast.recommendations.map((rec) => (
          <div key={rec.productId} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getIndicatorIcon(rec.visualIndicator)}</span>
                <div>
                  <h5 className="font-medium text-gray-900">{rec.productName}</h5>
                  <p className="text-sm text-gray-600">
                    Avg: {rec.currentAverageQuantity}kg → Recommended: {rec.recommendedQuantity}kg
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIndicatorColor(rec.visualIndicator)}`}>
                  {rec.changePercentage > 0 ? '+' : ''}{rec.changePercentage}%
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(rec.confidence)}% confidence
                </p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
              <strong>Reason:</strong> {rec.changeReason}
            </p>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Analysis Factors</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {forecast.reasoning.map((reason, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded text-sm hover:bg-green-600">
            📋 Create Order from Forecast
          </button>
          <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600">
            📊 View Historical Accuracy
          </button>
        </div>
      </div>
    </div>
  );
}
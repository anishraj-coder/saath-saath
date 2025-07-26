'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceInterfaceProps {
  onCommand: (command: string, data?: unknown) => void;
  isActive: boolean;
  language?: string;
}

export default function VoiceInterface({ onCommand, isActive, language = 'hi-IN' }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition || 
                              (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognition.onerror = (event: unknown) => {
        
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const processVoiceCommand = (command: string) => {
    console.log('Voice command:', command);

    // Hindi and English command patterns
    const commands = {
      // Navigation commands
      dashboard: ['dashboard', 'डैशबोर्ड', 'home', 'होम'],
      orders: ['orders', 'ऑर्डर', 'order', 'आर्डर'],
      products: ['products', 'प्रोडक्ट', 'सामान', 'items'],
      groups: ['groups', 'ग्रुप', 'समूह', 'group buying'],
      
      // Action commands
      create_order: ['create order', 'नया ऑर्डर', 'order create', 'ऑर्डर बनाओ'],
      join_group: ['join group', 'ग्रुप जॉइन', 'समूह में शामिल', 'group join'],
      check_savings: ['savings', 'बचत', 'save money', 'पैसे बचाओ'],
      
      // Product commands
      onions: ['onions', 'प्याज', 'pyaz'],
      potatoes: ['potatoes', 'आलू', 'aloo'],
      tomatoes: ['tomatoes', 'टमाटर', 'tamatar'],
      oil: ['oil', 'तेल', 'tel'],
      flour: ['flour', 'आटा', 'atta'],
      
      // Quantity commands
      quantity: /(\d+)\s*(kg|किलो|kilo|litre|लीटर)/i,
      
      // Confirmation commands
      yes: ['yes', 'हाँ', 'han', 'okay', 'ठीक है'],
      no: ['no', 'नहीं', 'nahin', 'cancel', 'रद्द करो'],
      
      // Help commands
      help: ['help', 'मदद', 'madad', 'how to', 'कैसे करें']
    };

    // Check for navigation commands
    for (const [action, patterns] of Object.entries(commands)) {
      if (Array.isArray(patterns) && patterns.some(pattern => command.includes(pattern))) {
        onCommand(action);
        speak(getResponseText(action));
        return;
      }
    }

    // Check for quantity commands
    const quantityMatch = command.match(commands.quantity);
    if (quantityMatch) {
      const quantity = parseInt(quantityMatch[1]);
      const unit = quantityMatch[2];
      onCommand('set_quantity', { quantity, unit });
      speak(`${quantity} ${unit} सेट किया गया`);
      return;
    }

    // Default response for unrecognized commands
    speak('समझ नहीं आया। कृपया दोबारा कहें या मदद के लिए "help" कहें।');
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getResponseText = (action: string): string => {
    const responses: { [key: string]: string } = {
      dashboard: 'डैशबोर्ड खोला जा रहा है',
      orders: 'ऑर्डर पेज खोला जा रहा है',
      products: 'प्रोडक्ट लिस्ट दिखाई जा रही है',
      groups: 'ग्रुप बाइंग पेज खोला जा रहा है',
      create_order: 'नया ऑर्डर बनाया जा रहा है',
      join_group: 'ग्रुप में शामिल हो रहे हैं',
      check_savings: 'बचत की जानकारी दिखाई जा रही है',
      help: 'मदद की जानकारी दी जा रही है'
    };
    
    return responses[action] || 'कमांड प्रोसेस की जा रही है';
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-interface-fallback bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          Voice commands not supported in this browser. Please use touch interface.
        </p>
      </div>
    );
  }

  if (!isActive) {
    return null;
  }

  return (
    <div className="voice-interface bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Voice Commands</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-xs text-gray-500">
            {isListening ? 'Listening...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isListening 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isListening ? '🛑 Stop Listening' : '🎤 Start Voice Command'}
        </button>

        {transcript && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>You said:</strong> {transcript}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">Try saying:</p>
          <ul className="space-y-1">
            <li>• &quot;Dashboard&quot; or &quot;डैशबोर्ड&quot;</li>
            <li>• &quot;Create order&quot; or &quot;नया ऑर्डर&quot;</li>
            <li>• &quot;Show products&quot; or &quot;प्रोडक्ट दिखाओ&quot;</li>
            <li>• &quot;5 kg onions&quot; or &quot;5 किलो प्याज&quot;</li>
            <li>• &quot;Join group&quot; or &quot;ग्रुप जॉइन&quot;</li>
            <li>• &quot;Help&quot; or &quot;मदद&quot;</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
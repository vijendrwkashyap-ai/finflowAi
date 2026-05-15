import { registerPlugin } from '@capacitor/core';
import { useState, useEffect } from 'react';

interface SMS {
  address: string;
  body: string;
  date: number;
}

interface SMSReaderPlugin {
  getSMS(): Promise<{ sms: SMS[] }>;
}

const SMSReader = registerPlugin<SMSReaderPlugin>('SMSReader');

export function useSMSTracker() {
  const [messages, setMessages] = useState<SMS[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSMS = async () => {
    setLoading(true);
    try {
      const result = await SMSReader.getSMS();
      setMessages(result.sms);
      return result.sms;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, fetchSMS };
}

interface CalendarEvent {
  summary: string;
  dtstart: Date;
  dtend?: Date;
  description?: string;
  location?: string;
}

const parseICalDate = (dateStr: string): Date => {
  // Handle both YYYYMMDDTHHMMSSZ and YYYYMMDD formats
  if (dateStr.length === 8) {
    // YYYYMMDD format (all-day event)
    const year = parseInt(dateStr.substr(0, 4));
    const month = parseInt(dateStr.substr(4, 2)) - 1; // Month is 0-indexed
    const day = parseInt(dateStr.substr(6, 2));
    return new Date(year, month, day);
  } else if (dateStr.length === 15 && dateStr.endsWith('Z')) {
    // YYYYMMDDTHHMMSSZ format
    const year = parseInt(dateStr.substr(0, 4));
    const month = parseInt(dateStr.substr(4, 2)) - 1;
    const day = parseInt(dateStr.substr(6, 2));
    const hour = parseInt(dateStr.substr(9, 2));
    const minute = parseInt(dateStr.substr(11, 2));
    const second = parseInt(dateStr.substr(13, 2));
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  // Fallback to default parsing
  return new Date(dateStr);
};

const parseICalContent = (icalContent: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const lines = icalContent.split('\n').map(line => line.trim());
  
  let currentEvent: Partial<CalendarEvent> = {};
  let inEvent = false;
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.summary && currentEvent.dtstart) {
        events.push(currentEvent as CalendarEvent);
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('DTSTART:') || line.startsWith('DTSTART;')) {
        const dateValue = line.split(':')[1];
        currentEvent.dtstart = parseICalDate(dateValue);
      } else if (line.startsWith('DTEND:') || line.startsWith('DTEND;')) {
        const dateValue = line.split(':')[1];
        currentEvent.dtend = parseICalDate(dateValue);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9);
      }
    }
  }
  
  return events;
};

const formatEventForAI = (event: CalendarEvent): string => {
  const startDate = event.dtstart.toLocaleDateString();
  const startTime = event.dtstart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let eventStr = `**${event.summary}**: ${startDate}`;
  
  // Only add time if it's not an all-day event (check if time is not midnight)
  if (event.dtstart.getHours() !== 0 || event.dtstart.getMinutes() !== 0) {
    eventStr += ` at ${startTime}`;
  }
  
  if (event.location) {
    eventStr += ` (Location: ${event.location})`;
  }
  
  if (event.description) {
    eventStr += ` - ${event.description}`;
  }
  
  return eventStr;
};

const isDevelopment = (): boolean => {
  return (import.meta as any).env?.DEV || process.env.NODE_ENV === 'development';
};

const getMockCalendarData = (): string => {
  return `## Upcoming Calendar Events (Development Mock Data):
- **技術勉強会**: 2025年6月10日 at 19:00 - Cor.incオフィスでのLT大会
- **クライアント定例**: 2025年6月12日 at 14:00 - プロジェクト進捗報告
- **AIアンバサダー Cloudia LT**: 2025年6月15日 at 20:00 - Zenn記事連続投稿51週記念
- **会社説明会**: 2025年6月18日 at 10:00 - 新規パートナー向け
- **福岡IT交流会**: 2025年6月20日 at 18:30 - 地域エンジニアとの交流

*Note: This is mock data for development. In production, real calendar events will be displayed.`;
};

export const fetchCalendarData = async (icalUrl: string): Promise<string> => {
  console.log('fetchCalendarData called with URL:', icalUrl);
  
  // In development mode, return mock data to avoid CORS issues
  if (isDevelopment()) {
    console.log('Development mode: Using mock calendar data');
    return getMockCalendarData();
  }
  
  console.log('Production mode: Attempting to fetch real calendar data');
  
  try {
    // Use proxy API in production to avoid CORS issues
    const proxyUrl = '/api/calendar';
    console.log('📡 Fetching calendar from:', proxyUrl);
    const response = await fetch(proxyUrl);
    console.log('📡 Calendar response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.status}`);
    }
    
    // Handle potential encoding issues
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    let icalContent = decoder.decode(arrayBuffer);
    
    // Additional fallback for common encoding issues
    if (icalContent.includes('ã‚')) {
      console.log('🔧 Detected encoding issue, attempting to fix...');
      // Try to decode as if it was double-encoded
      const bytes = new Uint8Array(arrayBuffer);
      const utf8String = new TextDecoder('utf-8').decode(bytes);
      icalContent = utf8String;
    }
    
    console.log('📅 Calendar data sample:', icalContent.substring(0, 200));
    const events = parseICalContent(icalContent);
    
    // Sort events by date and get upcoming events (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    console.log('📊 Total events found:', events.length);
    console.log('📊 Date range check:', { now: now.toISOString(), thirtyDaysFromNow: thirtyDaysFromNow.toISOString() });
    
    const upcomingEvents = events
      .filter(event => {
        const isUpcoming = event.dtstart >= now && event.dtstart <= thirtyDaysFromNow;
        console.log(`🔍 Event check: "${event.summary}" at ${event.dtstart.toISOString()} - ${isUpcoming ? 'UPCOMING' : 'NOT upcoming'}`);
        if (isUpcoming) {
          console.log('✅ Upcoming event:', event.summary, event.dtstart.toISOString());
        }
        return isUpcoming;
      })
      .sort((a, b) => a.dtstart.getTime() - b.dtstart.getTime())
      .slice(0, 10); // Limit to 10 events
    
    console.log('📊 Upcoming events count:', upcomingEvents.length);
    
    if (upcomingEvents.length === 0) {
      return "## Upcoming Calendar Events:\nNo upcoming events in the next 30 days.";
    }
    
    const formattedEvents = upcomingEvents.map(formatEventForAI).join('\n- ');
    
    return `## Upcoming Calendar Events:\n- ${formattedEvents}`;
    
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return "## Calendar Information:\nUnable to fetch calendar data at this time. This may be due to CORS restrictions in development mode.";
  }
};
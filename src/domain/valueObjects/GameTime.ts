import { GameTime } from '../types';

export class GameTimeValue {
  private _year: number;
  private _month: number;
  private _day: number;
  private _hour: number;
  private _minute: number;
  private _dayOfWeek: number;

  constructor(
    year: number = 1983, 
    month: number = 9, 
    day: number = 1, 
    hour: number = 8, 
    minute: number = 0
  ) {
    this._year = year;
    this._month = month;
    this._day = day;
    this._hour = hour;
    this._minute = minute;
    
    // Calculate day of week (0 = Sunday, 6 = Saturday)
    // This is a simplification - you might want to use a library like dayjs for accurate calculations
    const date = new Date(year, month - 1, day);
    this._dayOfWeek = date.getDay();
  }

  get year(): number {
    return this._year;
  }

  get month(): number {
    return this._month;
  }
  
  get day(): number {
    return this._day;
  }
  
  get hour(): number {
    return this._hour;
  }
  
  get minute(): number {
    return this._minute;
  }
  
  get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  // For serialization (e.g., to Redux store)
  toJSON(): GameTime {
    return {
      year: this._year,
      month: this._month,
      day: this._day,
      hour: this._hour,
      minute: this._minute,
      dayOfWeek: this._dayOfWeek,
    };
  }

  // Add hours to the current time and handle date changes
  addHours(hours: number): GameTimeValue {
    // This is a simplified version - consider using a date library for production
    let newHour = this._hour + hours;
    let newDay = this._day;
    let newMonth = this._month;
    let newYear = this._year;
    
    // Handle day changes
    while (newHour >= 24) {
      newHour -= 24;
      newDay += 1;
      
      // Very simplified month handling - doesn't account for different month lengths
      if (newDay > 30) {
        newDay = 1;
        newMonth += 1;
        
        if (newMonth > 12) {
          newMonth = 1;
          newYear += 1;
        }
      }
    }
    
    return new GameTimeValue(newYear, newMonth, newDay, newHour, this._minute);
  }
}

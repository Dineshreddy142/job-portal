import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

const DateTimePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(value || new Date()));
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const containerRef = useRef(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const calendarDays = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({ day: prevMonthDays - i, current: false, month: month - 1 });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({ day: i, current: true, month: month });
    }

    // Next month padding
    const remaining = 42 - calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      calendarDays.push({ day: i, current: false, month: month + 1 });
    }

    return calendarDays;
  };

  const handleDateClick = (day, isCurrentMonth) => {
    let newDate = new Date(currentDate);
    if (!isCurrentMonth) {
        // Simple logic for prev/next month click if needed
    }
    newDate.setDate(day);
    setSelectedDate(new Date(newDate));
    updateValue(newDate);
  };

  const updateValue = (date) => {
    // Format to YYYY-MM-DDTHH:mm for datetime-local compatibility
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleTimeChange = (type, val) => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    if (type === 'h') newDate.setHours(parseInt(val));
    else if (type === 'm') newDate.setMinutes(parseInt(val));
    setSelectedDate(new Date(newDate));
    updateValue(newDate);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl cursor-pointer hover:ring-2 hover:ring-blue-500/10 transition-all group"
      >
        <CalendarIcon size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        <span className={`text-sm font-bold ${value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
          {value ? new Date(value).toLocaleString() : 'Select Deadline Date & Time'}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 z-[200] w-[320px] md:w-[450px] glass dark:bg-slate-900/95 p-6 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-white/20 dark:border-slate-800/50 animate-in fade-in zoom-in slide-in-from-top-4 duration-300 origin-top-right">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Calendar Part */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-heading font-bold text-slate-900 dark:text-white">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h4>
                <div className="flex space-x-1">
                  <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {days.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendar().map((item, i) => {
                  const isSelected = selectedDate && 
                    selectedDate.getDate() === item.day && 
                    selectedDate.getMonth() === item.month &&
                    selectedDate.getFullYear() === currentDate.getFullYear();
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateClick(item.day, item.current)}
                      className={`
                        h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all
                        ${item.current ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}
                        ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110' : 'hover:bg-blue-50 dark:hover:bg-blue-500/10'}
                      `}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Part */}
            <div className="w-full md:w-32 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-6 md:pt-0 md:pl-6 flex flex-col items-center">
               <div className="flex items-center space-x-2 mb-6 text-slate-400">
                 <Clock size={16} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Time</span>
               </div>
               
               <div className="flex flex-col space-y-4 w-full">
                 <div className="space-y-1">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center">Hours</span>
                   <select 
                    value={selectedDate?.getHours() || 0}
                    onChange={(e) => handleTimeChange('h', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-3 py-2 outline-none dark:text-white transition-colors cursor-pointer"
                   >
                     {[...Array(24)].map((_, i) => (
                       <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                     ))}
                   </select>
                 </div>
                 
                 <div className="space-y-1">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center">Mins</span>
                   <select 
                    value={selectedDate?.getMinutes() || 0}
                    onChange={(e) => handleTimeChange('m', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-3 py-2 outline-none dark:text-white transition-colors cursor-pointer"
                   >
                     {[0, 15, 30, 45, 59].map(i => (
                       <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                     ))}
                     {/* Add full minutes if needed, but 15m intervals are cleaner */}
                   </select>
                 </div>
               </div>

               <div className="mt-auto pt-8 w-full">
                 <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-blue-600 text-white text-[11px] font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all uppercase tracking-widest"
                 >
                   Apply
                 </button>
               </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;

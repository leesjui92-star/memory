import { useState, useEffect, useRef } from 'react';
import tomatoImg from './assets/cute_tomato.png';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

function App() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isFocus, setIsFocus] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Auto switch mode when time is up
      clearInterval(timerRef.current);
      const nextMode = !isFocus;
      setIsFocus(nextMode);
      setTimeLeft(nextMode ? FOCUS_TIME : BREAK_TIME);
      setIsActive(false); // require user to start the next session manually
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, isFocus]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isFocus ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (mode) => {
    setIsActive(false);
    setIsFocus(mode === 'focus');
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-darkBg text-white w-full">
      <div className="bg-darkPanel shadow-2xl rounded-3xl p-8 max-w-md w-full mx-4 flex flex-col items-center border border-gray-700/50">
        
        {/* Header / Mascot */}
        <div className="relative mb-6">
          <div className={`absolute -inset-4 rounded-full blur-2xl opacity-40 transition-colors duration-1000 ${isFocus ? 'bg-focus' : 'bg-break'}`}></div>
          <img 
            src={tomatoImg} 
            alt="Cute Tomato Mascot" 
            className={`w-32 h-32 object-cover rounded-full relative z-10 border-4 shadow-lg transition-colors duration-500 ${isFocus ? 'border-focus' : 'border-break'}`}
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-wide text-gray-100">
          {isFocus ? '집중할 시간이에요! 🚀' : '휴식 시간이에요! ☕'}
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          {isFocus ? '25분 동안 딴짓 금지!' : '5분 동안 푹 쉬고 오세요!'}
        </p>

        {/* Mode Toggle */}
        <div className="flex bg-gray-800 rounded-full p-1 mb-8 w-full">
          <button 
            onClick={() => switchMode('focus')}
            className={`flex-1 py-2 rounded-full font-semibold transition-all duration-300 ${isFocus ? 'bg-focus text-darkBg shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
          >
            집중 모드
          </button>
          <button 
            onClick={() => switchMode('break')}
            className={`flex-1 py-2 rounded-full font-semibold transition-all duration-300 ${!isFocus ? 'bg-break text-darkBg shadow-md' : 'text-gray-400 hover:text-gray-200'}`}
          >
            휴식 모드
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-7xl font-bold font-sans tracking-tight mb-10 tabular-nums">
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full">
          <button 
            onClick={toggleTimer}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg text-darkBg transition-transform active:scale-95 shadow-lg
              ${isFocus ? 'bg-focus hover:bg-[#ff7266]' : 'bg-break hover:bg-[#8affda]'}`}
          >
            {isActive ? '일시정지 ⏸' : '시작하기 ▶'}
          </button>
          <button 
            onClick={resetTimer}
            className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl font-bold text-lg text-white transition-transform active:scale-95 shadow-md"
          >
            초기화 ↺
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;

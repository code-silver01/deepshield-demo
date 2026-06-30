import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTypingAnimationOptions {
  speed?: number;
  onComplete?: () => void;
  startDelay?: number;
}

export function useTypingAnimation(
  text: string,
  options: UseTypingAnimationOptions = {}
) {
  const { speed = 30, onComplete, startDelay = 0 } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const start = useCallback(() => {
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    const begin = () => {
      setIsStarted(true);
      const tick = () => {
        if (indexRef.current < text.length) {
          indexRef.current++;
          setDisplayedText(text.slice(0, indexRef.current));
          timerRef.current = setTimeout(tick, speed + Math.random() * speed * 0.5);
        } else {
          setIsComplete(true);
          onComplete?.();
        }
      };
      tick();
    };

    if (startDelay > 0) {
      timerRef.current = setTimeout(begin, startDelay);
    } else {
      begin();
    }
  }, [text, speed, onComplete, startDelay]);

  const skip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayedText(text);
    setIsComplete(true);
    onComplete?.();
  }, [text, onComplete]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { displayedText, isComplete, isStarted, start, skip };
}

export function useSequentialTyping() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [isAllComplete, setIsAllComplete] = useState(false);

  const addLine = useCallback((line: string) => {
    setLines(prev => [...prev, line]);
  }, []);

  const advance = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  const markComplete = useCallback(() => {
    setIsAllComplete(true);
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setLines([]);
    setIsAllComplete(false);
  }, []);

  return { currentIndex, lines, isAllComplete, addLine, advance, markComplete, reset };
}

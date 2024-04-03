import { UIEventHandler, useRef, useState } from "react";

export function useHandleSectionScroll<TElement extends HTMLElement>(threshold?: number) {
   const logsSectionRef = useRef<TElement>(null!);
   const [showScrollDownButton, setShowScrollDownButton] = useState(true);

   const handleSectionScroll: UIEventHandler = (event) => {
      event.preventDefault();

      const { scrollTop, scrollHeight, clientHeight } = logsSectionRef.current!;

      // Adjust the threshold as needed
      const THRESHOLD = threshold ?? 10; // You can adjust this value to define how close to the bottom is considered "scroll end"

      const isScrollAtEnd = scrollHeight - scrollTop <= clientHeight + THRESHOLD;
      if (isScrollAtEnd) setShowScrollDownButton(false);
      else if (!showScrollDownButton) setShowScrollDownButton(true);
   };

   return [showScrollDownButton, setShowScrollDownButton, handleSectionScroll, logsSectionRef] as const;
}
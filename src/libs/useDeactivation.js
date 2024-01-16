import { useRef, useEffect, useState } from "react";

export function useDeactivation(ref) {
  // 要素 (ref.current) の外側をクリックすると isActive を false にする Hook
  // https://stackoverflow.com/questions/32553158/detect-click-outside-react-component

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      // ref.current 中にない要素をクリックした場合
      if (ref.current && !ref.current.contains(event.target)) {
        setIsActive(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside); 
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return [isActive, setIsActive];
}

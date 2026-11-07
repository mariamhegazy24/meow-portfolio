import {motion} from 'framer-motion';
import {useEffect, useState} from 'react';

/** Short surprise messages (easter eggs). Triggered through the 'cat:toast' event. */
export function Toast() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timeout = 0;
    const onToast = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setMessage(''), 2600);
    };
    window.addEventListener('cat:toast', onToast);
    return () => {
      window.removeEventListener('cat:toast', onToast);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <motion.div
      role="status"
      animate={{opacity: message ? 1 : 0, y: message ? 0 : 20}}
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-espresso px-6 py-3 text-center font-heading text-sm tracking-wider text-cream md:text-base"
    >
      {message}
    </motion.div>
  );
}

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppButton() {
    return (
        <motion.a
            href="https://wa.me/556992481585"
            target="_blank"
            rel="noopener noreferrer"
            // Moved UP to allow ScrollToTop button to sit below it
            className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-[60] w-12 h-12 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            aria-label="Falar no WhatsApp"
        >
            <MessageCircle size={28} />
        </motion.a>
    );
}

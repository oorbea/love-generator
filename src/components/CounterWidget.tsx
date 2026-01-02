import { motion } from 'framer-motion';

interface CounterWidgetProps {
    count: number;
}

export function CounterWidget({ count }: CounterWidgetProps) {
    return (
        <motion.div
            className="counter-widget"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <span className="text-gray-600">
                ✨ Razones encontradas: <strong className="text-pink-600">{count}</strong>
            </span>
        </motion.div>
    );
}

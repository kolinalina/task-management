import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo = null;

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080,
        forceTLS: false,
        enabledTransports: ['ws'],
    });
}

export default echo;
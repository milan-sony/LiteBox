import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_LITEBOX_SECRET}`,
        'ngrok-skip-browser-warning': 'true'  // This removes Ngrok interstitial
    }
})

export default axiosInstance
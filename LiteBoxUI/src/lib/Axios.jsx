import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_LITEBOX_SECRET}`
    }
})

console.log("🔧 API axiosInstance URL: ", axiosInstance.defaults.baseURL)

export default axiosInstance
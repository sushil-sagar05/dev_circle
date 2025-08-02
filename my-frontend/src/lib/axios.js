import axios from "axios"

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
})

export default instance
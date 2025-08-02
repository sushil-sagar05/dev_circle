"use client";
import { useState } from "react";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullname: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(
        "/user/register",
        {
          email: formData.email,
          password: formData.password,
          fullname: formData.fullname.trim(),
        },
        { withCredentials: true }
      );
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="hidden md:block bg-gray-100 p-8">
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Signup Illustration"
              width={400}
              height={400}
              className="object-contain rounded-full"
            />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
          <h2 className="text-3xl font-bold text-gray-800 text-center">Create an Account</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Please fill in the information below to sign up
          </p>
          <div>
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              aria-required="true"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              aria-required="true"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              aria-required="true"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

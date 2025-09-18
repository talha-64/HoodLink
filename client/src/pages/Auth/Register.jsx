/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import React from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [full_name, setFull_name] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postal_code, setPostal_code] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [neighborhoods, setNeighborhoods] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("full_name", full_name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("postal_code", postal_code);
    if (avatar) {
      formData.append("avatar", avatar);
    }
    formData.append("password", password);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        formData,
        {
          headers: {},
        }
      );

      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || err.response.data.message);
        toast({
          variant: "destructive",
          title: err.response.data.error || err.response.data.message,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
          duration: 3000,
        });
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  useEffect(() => {
    const getNeighborhoods = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/neighborhood/getAllNeighborhoods`
        );
        setNeighborhoods(res.data.neighborhoods);
      } catch (err) {
        setError(err.message || "Something went wrong");
      }
    };
    getNeighborhoods();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Card className="w-full max-w-md bg-gray-800 text-white border border-neutral-800 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-white tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-neutral-400 text-center">
            Enter your details below to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="full_name"
                className="text-sm font-medium text-neutral-300"
              >
                Full Name
              </label>
              <Input
                type="text"
                id="full_name"
                name="full_name"
                placeholder="Muhammad"
                value={full_name}
                onChange={(e) => setFull_name(e.target.value)}
                className="bg-gray-900 text-white border-neutral-700 focus:border-neutral-500 focus:ring-0 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-neutral-300"
              >
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 text-white border-neutral-700 focus:border-neutral-500 focus:ring-0 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-neutral-300"
              >
                Phone Number
              </label>
              <Input
                type="text"
                id="phone"
                name="phone"
                placeholder="Optional"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-gray-900 text-white border-neutral-700 focus:border-neutral-500 focus:ring-0 rounded-lg"
              />
            </div>

            {/* <div className="flex flex-col gap-1.5">
              <label
                htmlFor="postal_code"
                className="text-sm font-medium text-neutral-300"
              >
                Postal Code
              </label>
              <Input
                required
                type="text"
                id="postal_code"
                name="postal_code"
                placeholder="54000"
                value={postal_code}
                onChange={(e) => setPostal_code(e.target.value)}
                className="bg-gray-900 text-white border-neutral-700 focus:border-neutral-500 focus:ring-0 rounded-lg"
              />
            </div> */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="postal_code"
                className="text-sm font-medium text-neutral-300"
              >
                Neighborhood
              </label>
              <select
                required
                id="postal_code"
                name="postal_code"
                value={postal_code}
                onChange={(e) => setPostal_code(e.target.value)}
                className="bg-gray-900 text-white border-neutral-700 focus:border-neutral-500 focus:ring-0 rounded-lg px-3 py-2"
              >
                <option value="">Select your neighborhood</option>
                {neighborhoods.map((n) => (
                  <option key={n.postal_code} value={n.postal_code}>
                    {n.name}, {n.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="avatar"
                className="text-sm font-medium text-neutral-300"
              >
                Profile Picture
              </label>
              <Input
                accept="image/*"
                type="file"
                id="avatar"
                name="avatar"
                onChange={(e) => setAvatar(e.target.files[0])}
                className="bg-gray-900 text-white border-neutral-700 file:text-neutral-300 focus:border-neutral-500 focus:ring-0 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-neutral-300"
              >
                Password
              </label>
              <Input
                required
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-900 text-white border-neutral-700 focus:border-neutral-500 focus:ring-0 rounded-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition"
            >
              Register
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center gap-1 text-neutral-400">
          <span className="text-sm">Already have an account?</span>
          <Link
            to="/"
            className="text-sm font-semibold underline text-neutral-300 hover:text-white transition"
          >
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Register;

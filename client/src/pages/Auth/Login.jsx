import { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;

      login(data.user, data.token);

      navigate("/home");
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 ">
      <Card className="w-full max-w-md bg-gray-800 text-white border border-neutral-800 rounded-2xl  transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center text-white tracking-tight">
            Login to your account
          </CardTitle>
          <CardDescription className="text-neutral-400 text-center">
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 text-white border-neutral-700 focus:border-neutral-500 focus:ring-0 rounded-lg"
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
              Login
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center gap-1 text-neutral-400">
          <span className="text-sm">Don’t have an account?</span>
          <Link
            to="/register"
            className="text-sm font-semibold underline text-neutral-300 hover:text-white transition"
          >
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;

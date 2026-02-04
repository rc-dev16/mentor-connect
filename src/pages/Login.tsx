import { SignIn } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const location = useLocation();

  // Make Clerk work both at "/" and "/login"
  const clerkPath = location.pathname.startsWith("/login") ? "/login" : "/";

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-0 bg-cover bg-center bg-no-repeat bg-fixed" 
      style={{ 
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full flex justify-center px-4 md:px-8 lg:px-12">
        <Card className="w-full max-w-3xl py-6">
          <CardHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-6 gap-3">
              <img src="/mm.png" alt="Mentor-Connect Logo" className="h-16 w-auto" />
              <h1 className="text-2xl font-black text-primary uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Mentor-Connect</h1>
            </div>
            <CardTitle className="text-2xl font-bold">Sign in with your email</CardTitle>
            <CardDescription>
              Enter your university email to receive a sign-in code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pb-8">
            <div className="flex justify-center">
              <SignIn
                path={clerkPath}
                routing="path"
                afterSignInUrl="/"
                afterSignUpUrl="/"
                signUpFallbackRedirectUrl="/"
                signInFallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full flex justify-center",
                  card: "shadow-none border bg-background",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  header: "hidden",
                  logoImage: "hidden",
                },
              }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
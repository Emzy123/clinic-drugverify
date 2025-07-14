
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { getAuthInstance } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { upsertUser } from '@/services/user-service';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A8.003 8.003 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025A20.01 20.01 0 0024 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C42.018 35.153 44 30.024 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuthInstance();
  const [isSubmitting, setIsSubmitting] = React.useState(false);


  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const authUser = result.user;

      if (authUser) {
        // Create or update user in our database
        const appUserResult = await upsertUser({
          id: authUser.uid,
          fullname: authUser.displayName || 'Anonymous User',
          email: authUser.email || '',
          photoURL: authUser.photoURL || '',
        });
        
        if (!appUserResult.success) {
            toast({
              variant: 'destructive',
              title: 'Server Configuration Error',
              description: appUserResult.error || 'Could not save user data to the server. Please contact support.',
            });
            // Log out the user to prevent being in a weird state
            await auth.signOut();
            setIsSubmitting(false);
            return;
        }

        const appUser = appUserResult.user;

        // Store the full user object in session storage
        sessionStorage.setItem('user', JSON.stringify(appUser));
    
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${appUser.fullname}!`,
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      let description = 'Could not sign you in with Google. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        description = 'The sign-in window was closed before completing. Please try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        description = 'This app\'s domain is not authorized for login. Please contact the administrator.'
      }
       toast({
          variant: 'destructive',
          title: 'Login Failed',
          description,
        });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-sm w-full shadow-lg border">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary/10 border">
              <Logo className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              CUSTECH DrugVerify
            </CardTitle>
            <CardDescription className="pt-1">
              Sign in to access the verification tools
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  'Signing in...'
                ) : (
                  <>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Sign in with Google
                  </>
                )}
              </Button>
            </div>
             <p className="px-8 text-center text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

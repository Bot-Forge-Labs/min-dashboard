"use client";
import { createClient } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";

const supabase = createClient();

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;

  // signUp returns exactly what supabase.auth.signUp() returns:
  signUp: (
    email: string,
    password: string
  ) => Promise<Awaited<ReturnType<typeof supabase.auth.signUp>>>;

  // signInWithPassword returns exactly what supabase.auth.signInWithPassword() returns:
  signIn: (
    email: string,
    password: string
  ) => Promise<Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>>;

  signInWithDiscord: () => Promise<
    Awaited<ReturnType<typeof supabase.auth.signInWithOAuth>>
  >;

  // signOut returns exactly what supabase.auth.signOut() returns:
  signOut: () => Promise<Awaited<ReturnType<typeof supabase.auth.signOut>>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed", event, session);

      if (event === "INITIAL_SESSION") {
        // handle initial session
      } else if (event === "SIGNED_IN") {
        console.log("Signed in", session);
        // handle sign in event
        setUser(session?.user ?? null);

        setSession(session);
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        // handle sign out event
        setUser(null);
        setSession(null);
        router.push("/login");
      }

      // const currentUser = session?.user ?? null;
      // setSession(session);
      // setUser(currentUser);
      // if (currentUser) fetchUserProfile(currentUser.id);
      // else setUserProfile(null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe?.();
  }, [user]);

  const signUp: AuthContextProps["signUp"] = async (email, password) => {
    // this returns { data: { user, session }, error }
    return await supabase.auth.signUp({ email, password });
  };

  const signIn: AuthContextProps["signIn"] = async (email, password) => {
    // this returns { data: { user, session }, error }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut: AuthContextProps["signOut"] = async () => {
    // this returns { error }
    return await supabase.auth.signOut();
  };

  const signInWithDiscord: AuthContextProps["signInWithDiscord"] = async () => {
    console.log(`${window.location.origin}/auth/callback    `);
    // this returns { data: { user, session }, error }
    return await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <AuthContext
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithDiscord,
      }}
    >
      {children}
    </AuthContext>
  );
};

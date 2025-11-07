import type { AuthUser, Session } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"; 
import { useNavigate } from "react-router";    
import supabase from "~/lib/supabase";

// type User = {
//   email: string;
//   email_verified: boolean;
//   phone_verified: boolean;
//   sub: string;
//   username: string;
//   fullName: string;
//   image: string;
//   updated_at: Date;
// };

type IAuthContext = {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isAuthLoading: boolean;
  handleLogout: () => void;
};
export const defaultProvider: IAuthContext = {
  user: null,
  setUser: () => null,
  isAuthLoading: false,
  handleLogout: () => {},
};

export const AuthContext = createContext<IAuthContext | undefined>(
  defaultProvider
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null)


  useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthLoading(false);
        setSession(session);
        if(!session){
          setUser(null);
          navigate("/login")
        } else {
          setUser(session.user);
          if(!session.user.user_metadata.username){
            navigate("/complete-profile")
          }
        }
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("_event", _event);
        console.log("session", session);
        setSession(session)
        if(!session){
          setUser(null);
          navigate("/login")
        } else {
          setUser(session.user)
          /* if(_event === "SIGNED_IN"){
            navigate("/")
          } */
          switch (_event) {
            case "SIGNED_IN":
              if (session.user.user_metadata.username) {
                // User has completed profile
                navigate("/");
              } else {
                // New user needs to complete profile
                navigate("/complete-profile");
              }
              break;
            case "SIGNED_OUT":
              setUser(null);
              navigate("/login");
              break;
            case "USER_UPDATED":
              setUser(session.user);
              break;
            default:
              break;
          }
        }
      })
      return () => subscription.unsubscribe()
    }, [])

  /* useEffect(() => {
    (async () => {
      setIsAuthLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); 
        const user = localStorage.getItem("user");
        if(user){
          console.log(`JSON.parse(user || "") || null`)
          console.log(JSON.parse(user || "") || null);
          setUser(JSON.parse(user || "") || null);
        } else {
          console.log(`isAuthenticated: `, false);
          setUser(null);
          navigate("/login");
        }
      } catch (error) {
        console.log(error)
      } finally{
        setIsAuthLoading(false)
      }
    })();
  }, []); */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    /* setUser(null); 
    localStorage.removeItem("user");
    navigate("/login"); */
  };

  var value = {
    user,
    setUser,
    isAuthLoading,
    handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context){
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
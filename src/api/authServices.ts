const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL! ;

export function useAuthServices() { 
    const userLogin = async (email: string, password: string): Promise<any> => {
        const res = await fetch(`${BaseUrl}User/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid email or password");
      }

      console.log("response",res);
      return res.json();
    }
    return{
        userLogin
    };
}
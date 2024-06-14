'use client'
import { useRouter } from "next/navigation";
export default function ErrorPage() {

    const router = useRouter()
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-600 to-indigo-600">
      <div className="w-2/3 text-center">
        <h1 className="text-white text-4xl font-bold mb-4">
           A verification email has been sent to your mail.
     
        </h1>
           <button className="btn w-1/3 bg-blue-500 text-white font-semibold py-2 rounded-lg"
            onClick={() => router.push('/login')}
           >Login</button>
      </div>
    </main>
    
    );
  }
  
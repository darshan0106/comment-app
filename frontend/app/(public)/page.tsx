import Link from "next/link";
import { MessageSquareText } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <MessageSquareText size={64} className="text-slate-800 mb-4" />
            <h1 className="text-5xl font-bold mb-4">Welcome to PostThread</h1>
            <p className="text-lg text-slate-600 max-w-2xl mb-8">
                A minimalistic and highly scalable platform for discussions. Share your thoughts, reply to others, and stay engaged with the community.
            </p>
            <div className="flex gap-4">
                <Link href="/login" className="bg-white text-slate-800 px-6 py-2 rounded-md font-semibold shadow hover:bg-slate-50">
                    Login
                </Link>
                <Link href="/register" className="bg-slate-800 text-white px-6 py-2 rounded-md font-semibold shadow hover:bg-slate-900">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}
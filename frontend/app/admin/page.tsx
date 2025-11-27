"use client"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Admin = () => {
    const router = useRouter();
    useEffect(() => {
        router.replace('/admin/dashboard');
    }, [router]);
    return (
        <div>
        </div>
    )
}

export default Admin

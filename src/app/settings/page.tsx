'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

const PROFILE_KEY = 'scout_profile';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('Jane Doe');
  const [role, setRole] = useState('Associate');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const { displayName: n, role: r } = JSON.parse(raw);
        if (n) setDisplayName(n);
        if (r) setRole(r);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ displayName, role }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>Manage your account and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Display name</label>
            <Input className="mt-1" placeholder="Jane Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <Input className="mt-1" placeholder="Associate" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <Button onClick={handleSave}>{saved ? 'Saved!' : 'Save changes'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

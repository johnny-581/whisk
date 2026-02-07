"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DashboardContent() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/videos/new">
          <Button>Upload New Video</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Recent Videos</h3>
            <p className="text-sm text-neutral-600">
              Your latest vocabulary videos
            </p>
            <p className="text-sm text-neutral-500">
              No videos yet. Upload your first video to get started!
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Practice Sessions</h3>
              <p className="text-sm text-neutral-600">Continue your learning</p>
            </div>
            <Link href="/conversations/new" className="block">
              <Button variant="secondary" className="w-full">
                Start Practice
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Progress</h3>
            <p className="text-sm text-neutral-600">Your vocabulary journey</p>
            <p className="text-sm text-neutral-500">0 words learned</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

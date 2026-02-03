"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VideoDetailProps {
  videoId: string;
}

export function VideoDetail({ videoId }: VideoDetailProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Back to Dashboard
      </Button>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Video {videoId}</CardTitle>
            <CardDescription>
              Video details and extracted vocabulary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Video Information</h3>
              <p className="text-sm text-muted-foreground">
                Title: Sample Video
              </p>
              <p className="text-sm text-muted-foreground">Duration: 10:30</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Extracted Vocabulary</h3>
              <div className="space-y-2">
                <div className="p-2 border rounded">
                  <p className="font-medium">Word 1</p>
                  <p className="text-sm text-muted-foreground">
                    Definition and context...
                  </p>
                </div>
                <div className="p-2 border rounded">
                  <p className="font-medium">Word 2</p>
                  <p className="text-sm text-muted-foreground">
                    Definition and context...
                  </p>
                </div>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href={`/conversations/${videoId}`}>
                Practice with this Video
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

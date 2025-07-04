"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, ExternalLink, Share2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

interface HistoryItem {
  id: string;
  created_at: string;
  user_id: string;
  source_url: string;
  shape_url: string | null;
  color_url: string | null;
  result_url: string;
  ai_description: string | null;
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Fetch history for current user
        const { data, error } = await supabase
          .from("hair_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Validate data to ensure required URLs exist
        const validatedData = (data || []).map((item) => {
          if (!item.result_url) {
            toast.error(
              `Found item with missing result image (ID: ${item.id.substring(
                0,
                6
              )}...)`
            );
          }
          return item;
        });

        setHistoryItems(validatedData);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("failed to load history ｡°(°.◜ᯅ◝°)°｡");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const deleteHistoryItem = async (id: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("hair_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setHistoryItems(historyItems.filter((item) => item.id !== id));
      toast.success("transformation deleted ✨");
    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("failed to delete transformation ｡°(°.◜ᯅ◝°)°｡");
    }
  };

  const shareResult = async (item: HistoryItem) => {
    try {
      await navigator.share({
        title: "check out my new hairstyle with tresswap! ✨",
        text:
          item.ai_description ||
          "i tried on a new hairstyle with tresswap! (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤",
        url: item.result_url,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("sharing not supported", {
        description:
          "your browser doesn't support sharing. try downloading and sharing manually. ｡°(°.◜ᯅ◝°)°｡",
      });
    }
  };
  const downloadImage = async (url: string) => {
    if (!url) {
      toast.error("cannot download: image URL is missing ｡°(°.◜ᯅ◝°)°｡");
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `tresswap-${timestamp}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("error downloading image:", error);
      toast.error("failed to download image ｡°(°.◜ᯅ◝°)°｡");
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  if (!userId && !loading) {
    return (
      <div className="container py-10 mx-auto">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            your history
          </h1>
          <p className="text-muted-foreground mb-8">
            you need to be logged in to view your transformation history.
            (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤
          </p>
          <Button asChild>
            <Link href="/login">log in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            your transformation history ✨
          </h1>
          <p className="text-muted-foreground">
            view and manage all your previous hairstyle transformations (っ˘ω˘ς
            )
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full rounded-md" />
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : historyItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">
              no transformations yet ｡°(°.◜ᯅ◝°)°｡
            </h2>
            <p className="text-muted-foreground mb-6">
              try your first hairstyle transformation to see it here
            </p>
            <Button asChild>
              <Link href="/swap">try a style ✨</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {historyItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    hair transformation ✨
                  </CardTitle>
                  <CardDescription>
                    {formatDate(item.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">result</p>
                    <div className="relative h-48 w-full">
                      {item.result_url ? (
                        <Image
                          src={item.result_url}
                          alt="Result"
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted rounded-md">
                          <p className="text-muted-foreground text-sm">
                            Image not available
                          </p>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-background/80 px-1 py-0.5 rounded text-[10px]">
                        tresswap
                      </div>
                    </div>
                  </div>

                  {(item.shape_url || item.color_url) && (
                    <div className="grid grid-cols-2 gap-2">
                      {item.shape_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            shape
                          </p>
                          <div className="relative h-20 w-full">
                            <Image
                              src={item.shape_url}
                              alt="Shape Reference"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        </div>
                      )}
                      {item.color_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            color
                          </p>
                          <div className="relative h-20 w-full">
                            <Image
                              src={item.color_url}
                              alt="Color Reference"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareResult(item)}
                      disabled={!item.result_url}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        item.result_url
                          ? downloadImage(item.result_url)
                          : toast.error(
                              "cannot download: image URL is missing ｡°(°.◜ᯅ◝°)°｡"
                            )
                      }
                      disabled={!item.result_url}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      save
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHistoryItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {historyItems.length > 0 && (
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/swap">
                <ExternalLink className="h-4 w-4 mr-2" />
                try another style (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

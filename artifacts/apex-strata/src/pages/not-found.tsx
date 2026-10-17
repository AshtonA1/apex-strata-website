import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center bg-background pt-20">
      <Card className="w-full max-w-md mx-4 rounded-none border-border">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has moved.
          </p>

          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

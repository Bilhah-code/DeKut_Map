import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Directions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </Link>

        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Directions & Routes
          </h1>
          <p className="text-muted-foreground mb-6">
            This page will display turn-by-turn directions and walking routes
            between campus locations.
          </p>
          <p className="text-sm text-muted-foreground">
            Select a destination on the map to get started with route planning.
          </p>
        </div>
      </div>
    </div>
  );
}

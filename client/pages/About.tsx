import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </Link>

        <div className="bg-card rounded-lg border border-border p-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            About DeKUT Campus Navigator
          </h1>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground">
                DeKUT Campus Navigator is a GIS-based navigation application
                designed to help students, staff, and visitors navigate Dedan
                Kimathi University of Technology campus efficiently.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Interactive campus map with multiple layers</li>
                <li>Real-time location tracking</li>
                <li>Spatial search for campus buildings and facilities</li>
                <li>Walking route optimization</li>
                <li>Offline map access</li>
                <li>Mobile-friendly interface</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Getting Help</h2>
              <p className="text-muted-foreground mb-3">
                For support and additional features, please contact the IT
                Department at DeKUT.
              </p>
              <p className="text-sm text-muted-foreground">
                Version 1.0 | © 2024 Dedan Kimathi University of Technology
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

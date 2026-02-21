import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { resourcesAPI, Resource } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Download, ArrowLeft } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        if (id) {
          const data = await resourcesAPI.getById(id);
          setResource(data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch resource details",
          variant: "destructive",
        });
        navigate("/resources");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <p className="text-muted-foreground">Loading resource details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
            <Button onClick={() => navigate("/resources")}>Back to Resources</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isYouTube = (url: string) => /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)/i.test(url);
  const getYouTubeEmbed = (url: string) => {
    // Supports youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/embed/<id>
    const idMatch = url.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
    const id = idMatch?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : url.replace("watch?v=", "embed/");
  };

  const isImageUrl = (url: string) => /(\.(png|jpe?g|gif|webp|bmp|svg)$)/i.test(url);
  const isPdfUrl = (url: string) => /\.pdf($|\?)/i.test(url);
  const isGoogleDrive = (url: string) => /(drive|docs)\.google\.com\//i.test(url);
  const isGoogleFolder = (url: string) => /\/drive\/(?:u\/\d+\/)?folders\//i.test(url);

  const getDrivePreview = (url: string) => {
    // Folders cannot be embedded reliably
    if (isGoogleFolder(url)) return null;

    // Extract ID
    const idMatch = url.match(/\/(?:d|file\/d|document\/d|spreadsheets\/d|presentation\/d|forms\/d)\/([\w-]+)/);
    if (idMatch?.[1]) {
      const id = idMatch[1];

      // Forms use a specific embedded URL
      if (url.includes('/forms/')) {
        return `https://docs.google.com/forms/d/${id}/viewform?embedded=true`;
      }

      // Determine the type for better routing
      let type = 'file';
      if (url.includes('/document/')) type = 'document';
      else if (url.includes('/spreadsheets/')) type = 'spreadsheets';
      else if (url.includes('/presentation/')) type = 'presentation';

      return `https://docs.google.com/${type}/d/${id}/preview`;
    }

    // If it's a google doc but doesn't match ID pattern, return as is
    if (isGoogleDrive(url)) return url;

    // Fallback for other files using Google's public viewer
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const renderMedia = (url: string, key: number) => {
    if (isYouTube(url)) {
      return (
        <div key={key} className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
          <iframe
            src={getYouTubeEmbed(url)}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full"
          />
        </div>
      );
    }

    // Don't try to embed folders, they fall through to the download/view list
    if (isGoogleFolder(url)) return null;

    if (isGoogleDrive(url) || isPdfUrl(url)) {
      const embedUrl = isGoogleDrive(url) ? getDrivePreview(url) : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

      if (!embedUrl) return null;

      return (
        <div key={key} className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-card">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            title="Document viewer"
            allow="autoplay"
          />
        </div>
      );
    }
    if (isImageUrl(url)) {
      return (
        <img
          key={key}
          src={url}
          alt="Resource"
          className="w-full h-auto rounded-lg border cursor-pointer"
          onClick={() => window.open(url, "_blank")}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/resources")}
          className="mb-8 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{resource.title}</h1>

            {resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-lg text-muted-foreground mb-4">
              {resource.description}
            </p>

            <p className="text-sm text-muted-foreground">
              Added on {new Date(resource.timestamp).toLocaleDateString()}
            </p>
          </div>

          {/* Images */}
          {resource.images.length > 0 && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Images ({resource.images.length})</h2>
                {resource.images.length === 1 ? (
                  <div className="flex justify-center">
                    <img
                      src={resource.images[0]}
                      alt="Resource"
                      className="max-w-full h-auto rounded-lg hover:shadow-lg transition-shadow cursor-pointer border border-border"
                      onClick={() => window.open(resource.images[0], "_blank")}
                    />
                  </div>
                ) : (
                  <Carousel className="w-full max-w-4xl mx-auto">
                    <CarouselContent>
                      {resource.images.map((image, idx) => (
                        <CarouselItem key={idx}>
                          <div className="flex flex-col items-center p-1">
                            <img
                              src={image}
                              alt={`Resource ${idx + 1}`}
                              className="max-w-full h-auto rounded-lg cursor-pointer border border-border"
                              onClick={() => window.open(image, "_blank")}
                            />
                            <p className="text-center text-sm text-muted-foreground mt-2">
                              Image {idx + 1} of {resource.images.length}
                            </p>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                )}
              </CardContent>
            </Card>
          )}

          {/* Long Description */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <MarkdownRenderer
                  content={resource.longDescription || '*No additional details available.*'}
                  className="text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Links */}
          {resource.files.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Media & Files ({resource.files.length})</h2>
                {/* Embedded media previews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {resource.files.map((file, idx) => renderMedia(file, idx)).filter(Boolean as any)}
                </div>
                {/* Download tiles for non-previewable files */}
                <div className="space-y-3">
                  {resource.files.map((file, idx) => {
                    // Extract filename from URL - handle both / and \ separators
                    const urlParts = file.replace(/\\/g, '/').split('/');
                    const fileName = urlParts[urlParts.length - 1] || `File-${idx + 1}`;
                    const fileExt = fileName.includes('.')
                      ? fileName.split('.').pop()?.toUpperCase()
                      : 'FILE';
                    const previewable = !!renderMedia(file, -1);
                    if (previewable) return null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">{fileExt}</span>
                          </div>
                          <span className="text-sm font-medium truncate" title={fileName}>
                            {fileName}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2 flex-shrink-0"
                          onClick={() =>
                            handleDownloadFile(file, fileName)
                          }
                        >
                          Download
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

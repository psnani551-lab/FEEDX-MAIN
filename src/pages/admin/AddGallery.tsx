import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDataTable from "@/components/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { uploadFile, galleryAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Loader2, GripVertical, Image as ImageIcon, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageCropperDialog } from "@/components/ImageCropperDialog";

interface GalleryImage {
    id: string;
    url: string;
    order: number;
    createdAt?: string;
}

export default function AddGallery() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [imageUrl, setImageUrl] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedFileForCrop, setSelectedFileForCrop] = useState<string | null>(null);
    const [pendingFileName, setPendingFileName] = useState("");

    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const fetchGalleryImages = async () => {
        try {
            const data = await galleryAPI.getAll();
            setImages(data);
        } catch (error) {
            console.error("Failed to fetch gallery images:", error);
            // Initialize with default images if API fails
            const defaultImages = [
                { id: "1", url: "/images/carousel/carousel1.jpg", order: 1, createdAt: new Date().toISOString() },
                { id: "2", url: "/images/carousel/carousel2.jpg", order: 2, createdAt: new Date().toISOString() },
                { id: "3", url: "/images/carousel/carousel3.jpg", order: 3, createdAt: new Date().toISOString() },
                { id: "4", url: "/images/carousel/carousel 4.jpg", order: 4, createdAt: new Date().toISOString() },
            ];
            setImages(defaultImages as any);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setPendingFileName(file.name);

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setSelectedFileForCrop(reader.result?.toString() || null);
            setIsCropperOpen(true);
        });
        reader.readAsDataURL(file);
    };

    const onCropComplete = async (croppedBlob: Blob) => {
        setIsUploading(true);
        try {
            // Convert blob to file for upload
            const file = new File([croppedBlob], pendingFileName, { type: "image/jpeg" });
            const url = await uploadFile(file);
            setImageUrl(url);
            toast({ title: "Image Adjusted & Uploaded", description: pendingFileName });
        } catch (error) {
            toast({ title: "Upload Failed", variant: "destructive" });
        } finally {
            setIsUploading(false);
            setSelectedFileForCrop(null);
        }
    };

    const handleAddImage = async () => {
        if (!imageUrl) {
            toast({ title: "Error", description: "Please upload an image first", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await galleryAPI.create({
                url: imageUrl,
                order: images.length + 1,
            });

            toast({ title: "Image Added", description: "Gallery image added successfully" });
            setImageUrl("");
            setIsDialogOpen(false);
            fetchGalleryImages();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (item: GalleryImage) => {
        if (!confirm(`Delete this image?`)) return;

        try {
            await galleryAPI.delete(item.id);
            toast({ title: "Image Deleted" });
            fetchGalleryImages();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const handleBulkDelete = async (ids: string[]) => {
        if (!confirm(`Delete ${ids.length} image(s)?`)) return;

        try {
            await Promise.all(ids.map(id => galleryAPI.delete(id)));
            toast({ title: "Images Deleted", description: `${ids.length} images removed successfully` });
            fetchGalleryImages();
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const handleReorder = async (dragIndex: number, dropIndex: number) => {
        const newImages = [...images];
        const [draggedItem] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, draggedItem);

        // Update order numbers
        const reorderedImages = newImages.map((img, index) => ({
            ...img,
            order: index + 1,
        }));

        setImages(reorderedImages);

        // Save new order to backend
        try {
            await galleryAPI.reorder(reorderedImages);
        } catch (error) {
            console.error('Failed to reorder images:', error);
        }
    };

    const columns = [
        {
            key: "preview",
            label: "Preview",
            render: (item: GalleryImage) => (
                <img
                    src={item.url}
                    alt="Gallery"
                    className="w-20 h-12 object-cover rounded-lg border border-white/10"
                />
            ),
        },
        {
            key: "url",
            label: "Image URL",
            render: (item: GalleryImage) => (
                <span className="text-sm text-muted-foreground truncate max-w-xs block">
                    {item.url}
                </span>
            ),
        },
        {
            key: "order",
            label: "Order",
            render: (item: GalleryImage) => (
                <span className="text-sm font-mono">{item.order}</span>
            ),
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                            Manage <span className="text-primary">Gallery.</span>
                        </h1>
                        <p className="text-muted-foreground font-medium">Manage homepage carousel images.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setImageUrl("");
                            setIsUploading(false);
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 font-bold uppercase tracking-widest text-xs hidden sm:flex">
                                <Plus className="h-4 w-4" /> New Image
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                                    Add New Image
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="image">Gallery Image</Label>
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-1">
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                                className="bg-background/50 border-white/10"
                                            />
                                        </div>
                                        {isUploading && (
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        )}
                                    </div>
                                    {imageUrl && (
                                        <div className="relative mt-4 inline-block">
                                            <img
                                                src={imageUrl}
                                                alt="Preview"
                                                className="w-full max-w-md h-48 object-cover rounded-lg border border-white/10"
                                            />
                                            <button
                                                onClick={() => setImageUrl("")}
                                                className="absolute top-2 right-2 p-1 bg-destructive rounded-full hover:bg-destructive/80"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={handleAddImage}
                                    disabled={isLoading || !imageUrl}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Add to Gallery
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Gallery Images Table */}
                <Card className="glass-card border-white/10">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black uppercase tracking-tight">
                            Current Gallery Images ({images.length})
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Drag to reorder • Images appear in this order on the homepage
                        </p>
                    </CardHeader>
                    <CardContent>
                        {images.length === 0 ? (
                            <div className="text-center py-12">
                                <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No gallery images yet</p>
                            </div>
                        ) : (
                            <AdminDataTable
                                data={images}
                                columns={columns}
                                onDelete={handleDelete}
                                onBulkDelete={handleBulkDelete}
                                searchPlaceholder="Search images..."
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="glass-card bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-primary" />
                            Quick Guide
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                            <li>• Upload images in landscape format (16:9 ratio recommended)</li>
                            <li>• Images will auto-rotate every 4 seconds on the homepage</li>
                            <li>• Drag rows to reorder images in the carousel</li>
                            <li>• Recommended size: 1920x1080px or larger</li>
                            <li>• Supported formats: JPG, PNG, WebP</li>
                        </ul>
                    </CardContent>
                </Card>

                <ImageCropperDialog
                    image={selectedFileForCrop}
                    open={isCropperOpen}
                    onOpenChange={setIsCropperOpen}
                    onCropComplete={onCropComplete}
                />
            </div>
        </AdminLayout>
    );
}

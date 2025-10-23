import { UploadDropzone } from "@/lib/uploadthing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
}

export function ImageUploadModal({
  open,
  onOpenChange,
  onUploaded,
}: ImageUploadModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <UploadDropzone
          className="
            ut-ready:bg-card ut-ready:border-border ut-ready:text-foreground
            ut-uploading:bg-muted ut-uploading:border-border ut-uploading:text-muted-foreground
            ut-label:text-sm ut-label:text-muted-foreground
            ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground
            ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-primary-foreground
            ut-button:font-medium ut-button:rounded-lg ut-button:px-4 ut-button:py-2
          "
          appearance={{
            container:
              "bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200",
            button:
              "bg-primary text-primary-foreground font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200",
            label: "text-sm font-medium text-foreground mb-1 block",
            allowedContent:
              "text-xs text-muted-foreground mt-1 leading-relaxed italic tracking-wide",
            uploadIcon:
              "w-6 h-6 text-primary-foreground group-hover:text-white transition-colors",
          }}
          endpoint={"imageUploader"}
          onClientUploadComplete={(res) => {
            const url = res[0].ufsUrl;

            toast.success("Image uploaded successfully");

            onUploaded(url);
          }}
          onUploadError={(error) => {
            toast.error(error.message);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

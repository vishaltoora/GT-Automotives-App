interface TireImageUploadProps {
    tireId?: string;
    existingImages?: string[];
    primaryImageUrl?: string;
    onImagesChange?: (images: string[]) => void;
    onPrimaryChange?: (imageUrl: string) => void;
    maxImages?: number;
    maxSizeBytes?: number;
    disabled?: boolean;
}
export declare function TireImageUpload({ tireId, existingImages, primaryImageUrl, onImagesChange, onPrimaryChange, maxImages, maxSizeBytes, disabled, }: TireImageUploadProps): import("react/jsx-runtime").JSX.Element;
export default TireImageUpload;
//# sourceMappingURL=TireImageUpload.d.ts.map
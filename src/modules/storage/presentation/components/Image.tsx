import { useEffect, useState } from "react"
import { useStorageFile } from "../hooks/useStorageFile"
import { Spinner } from "../../../../core/presentation/layouts/ui/state/Spinner"

export interface ImageProps {
    id: string
    className?: string
}
export const Image = ({ id, className }: ImageProps) => {
    const { getFileBlob } = useStorageFile();
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loadingImage, setLoadingImage] = useState<boolean>(true)
    const [imageError, setImageError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setImageError("Id is required")
            setLoadingImage(false)
            return
        }
        let cancelled = false
        setLoadingImage(true)
        setImageError(null)
        setImageUrl(null)

        getFileBlob(id)
            .then(blob => {
                if (!cancelled) {
                    setImageUrl(URL.createObjectURL(blob))
                    setLoadingImage(false)
                }
            })
            .catch(error => {
                if (!cancelled) {
                    setImageError(error?.message || "Something went wrong")
                    setLoadingImage(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [id])

    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl)
        }
    }, [imageUrl])

    if (loadingImage) return <div className="flex items-center justify-center"><Spinner size="md" /></div>
    if (imageError) return <>{imageError}</>

    return <img src={imageUrl!} className={className} />
}
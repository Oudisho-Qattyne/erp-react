import { useEffect, useState } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"

export interface ImageProps {
    id: string
    className?: string
}
export const Image = ({ id, className }: ImageProps) => {
    const apiClient = useApiClient();
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

        apiClient.get<Blob>(`/storage-management/${id}`, { responseType: 'blob' })
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

    if (loadingImage) return <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" /></div>
    if (imageError) return <>{imageError}</>

    return <img src={imageUrl!} className={className} />
}